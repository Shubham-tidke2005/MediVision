import os
import re
import uuid
import warnings

from pathlib import Path

from fastapi import (
    HTTPException,
    UploadFile,
    status,
)

from PIL import (
    Image,
    UnidentifiedImageError,
)

from pypdf import PdfReader

from sqlalchemy.orm import Session

from app.core.config import settings

from app.models.enums import (
    DocumentType,
)

from app.models.medical_document import (
    MedicalDocument,
)

from app.models.patient import (
    Patient,
)

from app.repositories.medical_document import (
    get_patient_document,
    list_patient_documents,
)


# =========================================================
# CONFIGURATION
# =========================================================


MAX_UPLOAD_BYTES = (
    15
    * 1024
    * 1024
)

CHUNK_SIZE = (
    1024
    * 1024
)


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}


MIME_EXTENSIONS = {
    "application/pdf": {
        ".pdf",
    },

    "image/jpeg": {
        ".jpg",
        ".jpeg",
    },

    "image/png": {
        ".png",
    },
}


CANONICAL_EXTENSION = {
    "application/pdf":
        ".pdf",

    "image/jpeg":
        ".jpg",

    "image/png":
        ".png",
}


# =========================================================
# STORAGE ROOT
# =========================================================


def get_upload_root():
    root = Path(
        settings.upload_dir
    ).resolve()

    root.mkdir(
        parents=True,
        exist_ok=True,
    )

    return root


# =========================================================
# SAFE ORIGINAL FILENAME
# =========================================================


def sanitize_filename(
    filename: str | None,
):
    if not filename:
        return "document"

    # Remove client path information.
    name = Path(
        filename
    ).name


    # Remove control characters.
    name = re.sub(
        r"[\x00-\x1f\x7f]",
        "",
        name,
    ).strip()


    if not name:
        return "document"


    # Database column is 255 chars.
    return name[:255]


# =========================================================
# FILE SIGNATURE DETECTION
# =========================================================


def detect_mime_type(
    header: bytes,
):
    # PDF
    if header.startswith(
        b"%PDF-"
    ):
        return "application/pdf"


    # JPEG
    if header.startswith(
        b"\xff\xd8\xff"
    ):
        return "image/jpeg"


    # PNG
    if header.startswith(
        b"\x89PNG\r\n\x1a\n"
    ):
        return "image/png"


    return None


# =========================================================
# VERIFY ACTUAL CONTENT
# =========================================================


def validate_file_content(
    path: Path,
    mime_type: str,
):
    if (
        mime_type
        == "application/pdf"
    ):
        try:
            reader = PdfReader(
                str(path)
            )

            if reader.is_encrypted:
                raise HTTPException(
                    status_code=(
                        status.HTTP_422_UNPROCESSABLE_ENTITY
                    ),
                    detail=(
                        "Encrypted PDF files "
                        "are not supported."
                    ),
                )

            # Force basic parsing.
            if len(reader.pages) < 1:
                raise HTTPException(
                    status_code=(
                        status.HTTP_422_UNPROCESSABLE_ENTITY
                    ),
                    detail=(
                        "PDF must contain "
                        "at least one page."
                    ),
                )

        except HTTPException:
            raise

        except Exception as exc:
            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail="Invalid PDF file.",
            ) from exc

        return


    if mime_type in {
        "image/jpeg",
        "image/png",
    }:
        try:
            with warnings.catch_warnings():
                warnings.simplefilter(
                    "error",
                    Image.DecompressionBombWarning,
                )

                with Image.open(
                    path
                ) as image:

                    expected_format = (
                        "JPEG"
                        if mime_type
                        == "image/jpeg"
                        else "PNG"
                    )

                    if (
                        image.format
                        != expected_format
                    ):
                        raise HTTPException(
                            status_code=(
                                status.HTTP_422_UNPROCESSABLE_ENTITY
                            ),
                            detail=(
                                "Image content does not "
                                "match its detected type."
                            ),
                        )

                    image.verify()

        except HTTPException:
            raise

        except (
            UnidentifiedImageError,
            OSError,
            ValueError,
            Image.DecompressionBombWarning,
        ) as exc:
            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail="Invalid image file.",
            ) from exc

        return


    raise HTTPException(
        status_code=(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
        ),
        detail="Unsupported file type.",
    )


# =========================================================
# SERIALIZER
# =========================================================


def serialize_document(
    document: MedicalDocument,
):
    return {
        "id":
            document.id,

        "document_type":
            document.document_type,

        "filename":
            document.original_filename,

        "mime_type":
            document.mime_type,

        "size_bytes":
            document.size_bytes,

        "created_at":
            document.created_at,
    }


# =========================================================
# UPLOAD
# =========================================================


async def upload_patient_document(
    db: Session,
    patient: Patient,
    document_type: DocumentType,
    file: UploadFile,
):
    original_filename = (
        sanitize_filename(
            file.filename
        )
    )


    original_extension = (
        Path(
            original_filename
        )
        .suffix
        .lower()
    )


    if (
        original_extension
        not in ALLOWED_EXTENSIONS
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
            ),
            detail=(
                "Only PDF, JPG, JPEG and PNG "
                "files are allowed."
            ),
        )


    upload_root = (
        get_upload_root()
    )


    patient_folder = (
        upload_root
        / "medical_documents"
        / str(
            patient.id
        )
    )


    patient_folder.mkdir(
        parents=True,
        exist_ok=True,
    )


    temporary_path = (
        patient_folder
        / (
            f".upload-{uuid.uuid4().hex}.tmp"
        )
    )


    total_size = 0

    header = b""


    try:
        # =================================================
        # STREAM FILE TO TEMPORARY STORAGE
        # =================================================

        with temporary_path.open(
            "wb"
        ) as destination:

            while True:
                chunk = await file.read(
                    CHUNK_SIZE
                )

                if not chunk:
                    break


                total_size += len(
                    chunk
                )


                if (
                    total_size
                    > MAX_UPLOAD_BYTES
                ):
                    raise HTTPException(
                        status_code=(
                            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                        ),
                        detail=(
                            "File is too large. "
                            "Maximum allowed size is 15 MB."
                        ),
                    )


                if (
                    len(header)
                    < 16
                ):
                    needed = (
                        16
                        - len(header)
                    )

                    header += (
                        chunk[:needed]
                    )


                destination.write(
                    chunk
                )


        # =================================================
        # EMPTY FILE
        # =================================================

        if (
            total_size <= 0
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail=(
                    "Uploaded file is empty."
                ),
            )


        # =================================================
        # DETECT REAL MIME TYPE
        # =================================================

        detected_mime = (
            detect_mime_type(
                header
            )
        )


        if (
            detected_mime
            is None
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
                ),
                detail=(
                    "File contents are not "
                    "a supported PDF, JPG or PNG."
                ),
            )


        # =================================================
        # CHECK EXTENSION MATCHES CONTENT
        # =================================================

        if (
            original_extension
            not in MIME_EXTENSIONS[
                detected_mime
            ]
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail=(
                    "File extension does not "
                    "match the actual file type."
                ),
            )


        # =================================================
        # PARSE / VERIFY FILE
        # =================================================

        validate_file_content(
            temporary_path,
            detected_mime,
        )


        # =================================================
        # SERVER-GENERATED STORAGE NAME
        #
        # Never use uploaded filename as physical path.
        # =================================================

        generated_filename = (
            f"{uuid.uuid4().hex}"
            f"{CANONICAL_EXTENSION[detected_mime]}"
        )


        final_path = (
            patient_folder
            / generated_filename
        )


        storage_key = (
            Path(
                "medical_documents"
            )
            / str(
                patient.id
            )
            / generated_filename
        ).as_posix()


        # Atomic rename on same filesystem.
        os.replace(
            temporary_path,
            final_path,
        )


        # =================================================
        # DATABASE METADATA
        # =================================================

        document = MedicalDocument(
            patient_id=(
                patient.id
            ),

            document_type=(
                document_type
            ),

            storage_key=(
                storage_key
            ),

            original_filename=(
                original_filename
            ),

            mime_type=(
                detected_mime
            ),

            size_bytes=(
                total_size
            ),
        )


        db.add(
            document
        )


        try:
            db.commit()

        except Exception:
            db.rollback()

            # Avoid orphaned physical file
            # if DB metadata creation fails.
            final_path.unlink(
                missing_ok=True
            )

            raise


        db.refresh(
            document
        )


        return serialize_document(
            document
        )


    finally:
        await file.close()

        temporary_path.unlink(
            missing_ok=True
        )


# =========================================================
# LIST DOCUMENTS
# =========================================================


def get_patient_documents(
    db: Session,
    patient: Patient,
):
    documents = (
        list_patient_documents(
            db,
            patient.id,
        )
    )


    return [
        serialize_document(
            document
        )

        for document
        in documents
    ]


# =========================================================
# RESOLVE STORAGE PATH
# =========================================================


def resolve_storage_path(
    storage_key: str,
):
    upload_root = (
        get_upload_root()
    )


    path = (
        upload_root
        / storage_key
    ).resolve()


    # Prevent path traversal even if corrupted metadata
    # somehow enters the database.
    if not path.is_relative_to(
        upload_root
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Document not found.",
        )


    return path


# =========================================================
# DOWNLOAD DOCUMENT
# =========================================================


def get_patient_document_download(
    db: Session,
    patient: Patient,
    document_id: uuid.UUID,
):
    document = (
        get_patient_document(
            db,
            patient.id,
            document_id,
        )
    )


    if (
        document is None
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Document not found.",
        )


    path = resolve_storage_path(
        document.storage_key
    )


    if (
        not path.is_file()
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Stored document file "
                "could not be found."
            ),
        )


    return (
        document,
        path,
    )