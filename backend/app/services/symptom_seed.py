from sqlalchemy import (
    select,
)

from sqlalchemy.orm import Session

from app.models.symptom import Symptom


DEFAULT_SYMPTOMS = [
    {
        "code": "FEVER",
        "name": "Fever",
        "description": (
            "Raised body temperature or feeling feverish."
        ),
    },
    {
        "code": "COUGH",
        "name": "Cough",
        "description": (
            "Frequent or persistent coughing."
        ),
    },
    {
        "code": "HEADACHE",
        "name": "Headache",
        "description": (
            "Pain or discomfort in the head."
        ),
    },
    {
        "code": "NAUSEA",
        "name": "Nausea",
        "description": (
            "Feeling like you may vomit."
        ),
    },
    {
        "code": "VOMITING",
        "name": "Vomiting",
        "description": (
            "Forceful emptying of stomach contents."
        ),
    },
    {
        "code": "DIZZINESS",
        "name": "Dizziness",
        "description": (
            "Feeling light-headed, unsteady or faint."
        ),
    },
    {
        "code": "SHORTNESS_OF_BREATH",
        "name": "Shortness of Breath",
        "description": (
            "Difficulty breathing or feeling unable "
            "to get enough air."
        ),
    },
    {
        "code": "CHEST_PAIN",
        "name": "Chest Pain",
        "description": (
            "Pain, pressure or discomfort in the chest."
        ),
    },
    {
        "code": "SORE_THROAT",
        "name": "Sore Throat",
        "description": (
            "Pain or irritation in the throat."
        ),
    },
    {
        "code": "RUNNY_NOSE",
        "name": "Runny Nose",
        "description": (
            "Excess nasal discharge."
        ),
    },
    {
        "code": "NASAL_CONGESTION",
        "name": "Nasal Congestion",
        "description": (
            "Blocked or stuffy nose."
        ),
    },
    {
        "code": "FATIGUE",
        "name": "Fatigue",
        "description": (
            "Unusual tiredness or lack of energy."
        ),
    },
    {
        "code": "WEAKNESS",
        "name": "Weakness",
        "description": (
            "Reduced strength or general weakness."
        ),
    },
    {
        "code": "ABDOMINAL_PAIN",
        "name": "Abdominal Pain",
        "description": (
            "Pain or discomfort in the abdomen."
        ),
    },
    {
        "code": "DIARRHEA",
        "name": "Diarrhea",
        "description": (
            "Frequent loose or watery stools."
        ),
    },
    {
        "code": "CONSTIPATION",
        "name": "Constipation",
        "description": (
            "Difficulty or reduced frequency "
            "of bowel movements."
        ),
    },
    {
        "code": "LOSS_OF_APPETITE",
        "name": "Loss of Appetite",
        "description": (
            "Reduced desire to eat."
        ),
    },
    {
        "code": "BODY_ACHE",
        "name": "Body Ache",
        "description": (
            "Generalized muscle or body pain."
        ),
    },
    {
        "code": "JOINT_PAIN",
        "name": "Joint Pain",
        "description": (
            "Pain or discomfort affecting one "
            "or more joints."
        ),
    },
    {
        "code": "BACK_PAIN",
        "name": "Back Pain",
        "description": (
            "Pain affecting the back."
        ),
    },
    {
        "code": "RASH",
        "name": "Skin Rash",
        "description": (
            "Visible irritation or change in the skin."
        ),
    },
    {
        "code": "ITCHING",
        "name": "Itching",
        "description": (
            "Uncomfortable sensation causing an urge "
            "to scratch."
        ),
    },
    {
        "code": "SWELLING",
        "name": "Swelling",
        "description": (
            "Enlargement or puffiness of a body area."
        ),
    },
    {
        "code": "PALPITATIONS",
        "name": "Palpitations",
        "description": (
            "Feeling that the heart is beating "
            "fast, hard or irregularly."
        ),
    },
    {
        "code": "FAINTING",
        "name": "Fainting",
        "description": (
            "Temporary loss of consciousness."
        ),
    },
    {
        "code": "CHILLS",
        "name": "Chills",
        "description": (
            "Feeling cold with possible shivering."
        ),
    },
    {
        "code": "SWEATING",
        "name": "Excessive Sweating",
        "description": (
            "Unusually heavy sweating."
        ),
    },
    {
        "code": "VISION_CHANGES",
        "name": "Vision Changes",
        "description": (
            "Blurred, reduced or otherwise changed vision."
        ),
    },
    {
        "code": "EAR_PAIN",
        "name": "Ear Pain",
        "description": (
            "Pain or discomfort in the ear."
        ),
    },
    {
        "code": "BURNING_URINATION",
        "name": "Burning During Urination",
        "description": (
            "Burning or pain while passing urine."
        ),
    },
]


def seed_symptoms(
    db: Session,
):
    existing_codes = set(
        db.scalars(
            select(
                Symptom.code
            )
        ).all()
    )

    created = 0

    for item in DEFAULT_SYMPTOMS:
        if (
            item["code"]
            in existing_codes
        ):
            continue

        db.add(
            Symptom(
                code=item["code"],
                name=item["name"],
                description=item[
                    "description"
                ],
                is_active=True,
            )
        )

        created += 1

    db.commit()

    return created