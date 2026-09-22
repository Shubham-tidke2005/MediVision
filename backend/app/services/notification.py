import uuid

from datetime import (
    datetime,
    timedelta,
)

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.orm import (
    Session,
)

from app.models.notification import (
    Notification,
)

from app.repositories.notification import (
    count_unread_notifications,
    get_user_notification,
    list_notifications,
    mark_all_user_notifications_read,
)

from app.schemas.notification import (
    MarkAllReadResponse,
    NotificationCenterResponse,
    NotificationResponse,
    NotificationType,
    UnreadCountResponse,
)


# =========================================================
# CORE CREATE FUNCTION
#
# IMPORTANT:
# This function does NOT commit.
#
# That allows appointment/prescription/access services
# to create a notification inside the SAME transaction.
# =========================================================


def create_notification(
    db: Session,
    *,
    user_id: uuid.UUID,
    notification_type: (
        NotificationType
        | str
    ),
    title: str,
    message: str,
    related_entity_type: (
        str
        | None
    ) = None,
    related_entity_id: (
        uuid.UUID
        | None
    ) = None,
    data: (
        dict
        | None
    ) = None,
    available_at: (
        datetime
        | None
    ) = None,
):
    type_value = (
        notification_type.value

        if isinstance(
            notification_type,
            NotificationType,
        )

        else notification_type
    )

    notification = Notification(
        user_id=user_id,

        notification_type=(
            type_value
        ),

        title=title,

        message=message,

        related_entity_type=(
            related_entity_type
        ),

        related_entity_id=(
            related_entity_id
        ),

        data_json=(
            data
            or {}
        ),

        available_at=(
            available_at
            if available_at
            is not None
            else datetime.now()
                .astimezone()
        ),
    )

    db.add(
        notification
    )

    db.flush()

    return notification


# =========================================================
# SERIALIZATION
# =========================================================


def serialize_notification(
    notification: Notification,
):
    return NotificationResponse(
        id=notification.id,

        notification_type=(
            notification
                .notification_type
        ),

        title=(
            notification.title
        ),

        message=(
            notification.message
        ),

        related_entity_type=(
            notification
                .related_entity_type
        ),

        related_entity_id=(
            notification
                .related_entity_id
        ),

        data_json=(
            notification.data_json
            or {}
        ),

        available_at=(
            notification
                .available_at
        ),

        read_at=(
            notification.read_at
        ),

        is_read=(
            notification.read_at
            is not None
        ),

        created_at=(
            notification.created_at
        ),
    )


# =========================================================
# READ CENTER
# =========================================================


def get_notification_center(
    db: Session,
    *,
    user_id: uuid.UUID,
    unread_only: bool = False,
    limit: int = 50,
    offset: int = 0,
):
    notifications = (
        list_notifications(
            db,

            user_id=user_id,

            unread_only=(
                unread_only
            ),

            limit=limit,

            offset=offset,
        )
    )

    unread_count = (
        count_unread_notifications(
            db,
            user_id,
        )
    )

    return (
        NotificationCenterResponse(
            unread_count=(
                unread_count
            ),

            items=[
                serialize_notification(
                    notification
                )

                for notification
                in notifications
            ],
        )
    )


def get_unread_count(
    db: Session,
    user_id: uuid.UUID,
):
    return UnreadCountResponse(
        unread_count=(
            count_unread_notifications(
                db,
                user_id,
            )
        )
    )


# =========================================================
# MARK ONE READ
# =========================================================


def mark_notification_read(
    db: Session,
    *,
    notification_id: uuid.UUID,
    user_id: uuid.UUID,
):
    notification = (
        get_user_notification(
            db,

            notification_id=(
                notification_id
            ),

            user_id=user_id,

            for_update=True,
        )
    )

    if notification is None:
        raise HTTPException(
            status_code=(
                status
                .HTTP_404_NOT_FOUND
            ),
            detail=(
                "Notification not found."
            ),
        )

    if (
        notification.read_at
        is None
    ):
        notification.read_at = (
            datetime.now()
            .astimezone()
        )

        db.commit()

        db.refresh(
            notification
        )

    return serialize_notification(
        notification
    )


# =========================================================
# MARK ALL READ
# =========================================================


def mark_all_notifications_read(
    db: Session,
    user_id: uuid.UUID,
):
    updated_count = (
        mark_all_user_notifications_read(
            db,
            user_id,
        )
    )

    db.commit()

    return MarkAllReadResponse(
        updated_count=(
            updated_count
        )
    )


# =========================================================
# DOMAIN HELPERS
# =========================================================


def notify_appointment_approved(
    db: Session,
    *,
    patient_user_id: uuid.UUID,
    appointment_id: uuid.UUID,
    doctor_name: str,
    start_at: datetime,
):
    create_notification(
        db,

        user_id=(
            patient_user_id
        ),

        notification_type=(
            NotificationType
            .APPOINTMENT_APPROVED
        ),

        title=(
            "Appointment Approved"
        ),

        message=(
            "Your appointment with "
            f"{doctor_name} has been "
            "approved."
        ),

        related_entity_type=(
            "APPOINTMENT"
        ),

        related_entity_id=(
            appointment_id
        ),

        data={
            "doctor_name":
                doctor_name,

            "start_at":
                start_at.isoformat(),
        },
    )


    # One-hour appointment reminder.
    create_notification(
        db,

        user_id=(
            patient_user_id
        ),

        notification_type=(
            NotificationType
            .APPOINTMENT_REMINDER
        ),

        title=(
            "Appointment Reminder"
        ),

        message=(
            "Your appointment with "
            f"{doctor_name} is scheduled "
            "soon."
        ),

        related_entity_type=(
            "APPOINTMENT"
        ),

        related_entity_id=(
            appointment_id
        ),

        data={
            "doctor_name":
                doctor_name,

            "start_at":
                start_at.isoformat(),
        },

        available_at=(
            start_at
            - timedelta(
                hours=1
            )
        ),
    )


def notify_appointment_rejected(
    db: Session,
    *,
    patient_user_id: uuid.UUID,
    appointment_id: uuid.UUID,
    doctor_name: str,
):
    return create_notification(
        db,

        user_id=(
            patient_user_id
        ),

        notification_type=(
            NotificationType
            .APPOINTMENT_REJECTED
        ),

        title=(
            "Appointment Rejected"
        ),

        message=(
            "Your appointment request "
            f"with {doctor_name} was "
            "not approved."
        ),

        related_entity_type=(
            "APPOINTMENT"
        ),

        related_entity_id=(
            appointment_id
        ),

        data={
            "doctor_name":
                doctor_name,
        },
    )


def notify_new_prescription(
    db: Session,
    *,
    patient_user_id: uuid.UUID,
    prescription_id: uuid.UUID,
):
    return create_notification(
        db,

        user_id=(
            patient_user_id
        ),

        notification_type=(
            NotificationType
            .NEW_PRESCRIPTION
        ),

        title=(
            "New Prescription"
        ),

        message=(
            "A new prescription was "
            "added to your medical record."
        ),

        related_entity_type=(
            "PRESCRIPTION"
        ),

        related_entity_id=(
            prescription_id
        ),
    )


def notify_medical_access_shared(
    db: Session,
    *,
    doctor_user_id: uuid.UUID,
    access_grant_id: uuid.UUID,
):
    return create_notification(
        db,

        user_id=(
            doctor_user_id
        ),

        notification_type=(
            NotificationType
            .MEDICAL_ACCESS_SHARED
        ),

        title=(
            "Medical Access Shared"
        ),

        message=(
            "A patient has shared "
            "medical-record access "
            "with you."
        ),

        related_entity_type=(
            "MEDICAL_ACCESS_GRANT"
        ),

        related_entity_id=(
            access_grant_id
        ),
    )


def schedule_medicine_reminder(
    db: Session,
    *,
    patient_user_id: uuid.UUID,
    medication_id: uuid.UUID,
    medicine_name: str,
    reminder_at: datetime,
):
    return create_notification(
        db,

        user_id=(
            patient_user_id
        ),

        notification_type=(
            NotificationType
            .MEDICINE_REMINDER
        ),

        title=(
            "Medicine Reminder"
        ),

        message=(
            f"Reminder for your scheduled "
            f"medicine: {medicine_name}."
        ),

        related_entity_type=(
            "PATIENT_MEDICATION"
        ),

        related_entity_id=(
            medication_id
        ),

        data={
            "medicine_name":
                medicine_name,
        },

        available_at=(
            reminder_at
        ),
    )