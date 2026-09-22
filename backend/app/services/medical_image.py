import base64
import io
import threading
from dataclasses import (
    dataclass,
)
from functools import (
    lru_cache,
)
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

from PIL import (
    Image,
    UnidentifiedImageError,
)

from torchvision import (
    transforms,
)
from torchvision.models import (
    resnet18,
)

from sqlalchemy.orm import Session

from app.repositories.medical_image import (
    create_medical_image_analysis,
)

from app.schemas.audit_log import (
    AuditAction,
    AuditResourceType,
)

from app.services.audit_log import (
    record_audit_event,
)


# =========================================================
# PHASE 40 CONFIGURATION
# =========================================================


CLASS_NAMES = [
    "glioma",
    "meningioma",
    "no_tumor",
    "pituitary",
]


DISPLAY_NAMES = {
    "glioma":
        "Glioma",

    "meningioma":
        "Meningioma",

    "no_tumor":
        "No Tumor",

    "pituitary":
        "Pituitary Tumor",
}


SUGGESTED_SPECIALTY = {
    "glioma":
        "Neurology / Neurosurgery",

    "meningioma":
        "Neurology / Neurosurgery",

    "no_tumor":
        "Neurology",

    "pituitary":
        "Endocrinology / Neurosurgery",
}


IMAGE_SIZE = 224

DROPOUT = 0.30

MAX_FILE_BYTES = (
    10
    * 1024
    * 1024
)

MAX_IMAGE_SIDE = 8192

MAX_DISPLAY_SIDE = 1024

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
}

ALLOWED_SUFFIXES = {
    ".jpg",
    ".jpeg",
    ".png",
}

MODEL_NAME = (
    "ResNet18 Brain MRI Classifier"
)

MODEL_VERSION = (
    "phase38-resnet18"
)

GRADCAM_TARGET_LAYER = (
    "layer4.1.conv2"
)

SAFETY_MESSAGE = (
    "This is AI-assisted screening support only. "
    "The result is not a medical diagnosis and must "
    "not replace interpretation by a qualified "
    "radiologist or clinician. Seek professional care "
    "for symptoms, concerning findings, or urgent "
    "medical problems."
)

MODEL_SCORE_NOTICE = (
    "Model score is the classifier's softmax output. "
    "It is not a calibrated probability that a patient "
    "has a disease."
)

GRADCAM_NOTICE = (
    "Grad-CAM highlights image regions that influenced "
    "this model prediction. It does not prove that a "
    "highlighted region is a tumor, lesion, or exact "
    "disease location."
)


# C:\Shubham\MediVision\backend\app\services\...
# parents[3] -> C:\Shubham\MediVision
PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parents[3]
)

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "brain_mri_resnet18.pth"
)


MODEL_LOCK = (
    threading.Lock()
)


# =========================================================
# EXCEPTIONS
# =========================================================


class MedicalImageValidationError(
    RuntimeError
):
    pass


class MedicalImageModelError(
    RuntimeError
):
    pass


# =========================================================
# INTERNAL RESULT
# =========================================================


@dataclass
class InferenceResult:
    predicted_class: str

    display_label: str

    model_score: float

    class_scores: dict[
        str,
        float,
    ]

    suggested_specialty: str

    heatmap_data_url: str

    overlay_data_url: str


# =========================================================
# MODEL
# =========================================================


def _build_model():
    model = resnet18(
        weights=None
    )

    input_features = (
        model.fc.in_features
    )

    model.fc = nn.Sequential(
        nn.Dropout(
            p=DROPOUT
        ),
        nn.Linear(
            input_features,
            len(
                CLASS_NAMES
            ),
        ),
    )

    return model


@lru_cache
def get_medical_image_model():
    if not MODEL_PATH.is_file():
        raise MedicalImageModelError(
            "Phase 38 model file was not found: "
            f"{MODEL_PATH}"
        )

    device = torch.device(
        "cuda"
        if torch.cuda.is_available()
        else "cpu"
    )

    try:
        checkpoint = torch.load(
            MODEL_PATH,
            map_location=device,
            weights_only=False,
        )

    except Exception as exc:
        raise MedicalImageModelError(
            "Unable to load the Phase 38 model."
        ) from exc

    saved_classes = (
        checkpoint.get(
            "class_names"
        )
        if isinstance(
            checkpoint,
            dict,
        )
        else None
    )

    if (
        saved_classes is not None
        and list(
            saved_classes
        )
        != CLASS_NAMES
    ):
        raise MedicalImageModelError(
            "The saved class mapping does not "
            "match the Phase 40 configuration."
        )

    if not isinstance(
        checkpoint,
        dict,
    ):
        raise MedicalImageModelError(
            "Unexpected Phase 38 checkpoint format."
        )

    state_dict = (
        checkpoint.get(
            "model_state_dict"
        )
        or checkpoint.get(
            "state_dict"
        )
    )

    if state_dict is None:
        tensor_values = all(
            torch.is_tensor(
                value
            )
            for value
            in checkpoint.values()
        )

        if tensor_values:
            state_dict = checkpoint

    if state_dict is None:
        raise MedicalImageModelError(
            "The Phase 38 checkpoint does not "
            "contain a model state dictionary."
        )

    model = _build_model()

    try:
        model.load_state_dict(
            state_dict
        )

    except Exception as exc:
        raise MedicalImageModelError(
            "The Phase 38 model architecture "
            "does not match the saved checkpoint."
        ) from exc

    model = model.to(
        device
    )

    model.eval()

    return (
        model,
        device,
    )


# =========================================================
# TRANSFORM
# =========================================================


@lru_cache
def get_eval_transform():
    return transforms.Compose(
        [
            transforms.Resize(
                (
                    IMAGE_SIZE,
                    IMAGE_SIZE,
                )
            ),

            transforms.ToTensor(),

            transforms.Normalize(
                mean=[
                    0.485,
                    0.456,
                    0.406,
                ],
                std=[
                    0.229,
                    0.224,
                    0.225,
                ],
            ),
        ]
    )


# =========================================================
# IMAGE VALIDATION
# =========================================================


def validate_and_load_image(
    *,
    file_bytes: bytes,
    filename: str,
    mime_type: str,
) -> Image.Image:
    if not file_bytes:
        raise MedicalImageValidationError(
            "The uploaded image is empty."
        )

    if len(
        file_bytes
    ) > MAX_FILE_BYTES:
        raise MedicalImageValidationError(
            "Image is too large. Maximum size is 10 MB."
        )

    normalized_mime = (
        mime_type
        .split(
            ";",
            1,
        )[0]
        .strip()
        .lower()
    )

    if (
        normalized_mime
        not in ALLOWED_MIME_TYPES
    ):
        raise MedicalImageValidationError(
            "Only JPG, JPEG and PNG images are supported."
        )

    suffix = (
        Path(
            filename
        )
        .suffix
        .lower()
    )

    if suffix not in ALLOWED_SUFFIXES:
        raise MedicalImageValidationError(
            "Only .jpg, .jpeg and .png files are supported."
        )

    try:
        with Image.open(
            io.BytesIO(
                file_bytes
            )
        ) as verification_image:
            verification_image.verify()

        image = Image.open(
            io.BytesIO(
                file_bytes
            )
        ).convert(
            "RGB"
        )

    except (
        UnidentifiedImageError,
        OSError,
    ) as exc:
        raise MedicalImageValidationError(
            "The uploaded file is not a valid supported image."
        ) from exc

    width, height = (
        image.size
    )

    if (
        width < 64
        or height < 64
    ):
        raise MedicalImageValidationError(
            "Image dimensions are too small."
        )

    if (
        width > MAX_IMAGE_SIDE
        or height > MAX_IMAGE_SIDE
    ):
        raise MedicalImageValidationError(
            "Image dimensions are too large."
        )

    return image


# =========================================================
# GRAD-CAM
# =========================================================


class GradCAM:
    def __init__(
        self,
        *,
        model,
        target_layer,
    ):
        self.model = model

        self.target_layer = (
            target_layer
        )

        self.activations = None

        self.gradients = None

        self.forward_handle = (
            target_layer
            .register_forward_hook(
                self._forward_hook
            )
        )

    def _forward_hook(
        self,
        module,
        inputs,
        output,
    ):
        self.activations = output

        if output.requires_grad:
            output.register_hook(
                self._save_gradient
            )

    def _save_gradient(
        self,
        gradient,
    ):
        self.gradients = gradient

    def close(
        self,
    ):
        if (
            self.forward_handle
            is not None
        ):
            self.forward_handle.remove()

            self.forward_handle = None

    def generate(
        self,
        *,
        input_tensor,
    ):
        self.activations = None

        self.gradients = None

        self.model.zero_grad(
            set_to_none=True
        )

        logits = self.model(
            input_tensor
        )

        probabilities = (
            torch.softmax(
                logits,
                dim=1,
            )
        )

        predicted_index = int(
            probabilities.argmax(
                dim=1
            ).item()
        )

        target_score = (
            logits[
                0,
                predicted_index,
            ]
        )

        target_score.backward()

        if self.activations is None:
            raise MedicalImageModelError(
                "Grad-CAM did not capture feature maps."
            )

        if self.gradients is None:
            raise MedicalImageModelError(
                "Grad-CAM did not capture gradients."
            )

        activations = (
            self.activations
            .detach()
        )

        gradients = (
            self.gradients
            .detach()
        )

        weights = (
            gradients.mean(
                dim=(
                    2,
                    3,
                ),
                keepdim=True,
            )
        )

        cam = (
            weights
            * activations
        ).sum(
            dim=1,
            keepdim=True,
        )

        cam = F.relu(
            cam
        )

        cam = F.interpolate(
            cam,
            size=(
                IMAGE_SIZE,
                IMAGE_SIZE,
            ),
            mode="bilinear",
            align_corners=False,
        )

        cam = cam[
            0,
            0,
        ]

        minimum = cam.min()

        maximum = cam.max()

        denominator = (
            maximum
            - minimum
        )

        if denominator.item() > 0:
            cam = (
                cam
                - minimum
            ) / denominator

        else:
            cam = torch.zeros_like(
                cam
            )

        return (
            cam.cpu().numpy(),
            predicted_index,
            probabilities[
                0
            ]
            .detach()
            .cpu()
            .numpy(),
        )


# =========================================================
# HEATMAP VISUALIZATION
# =========================================================


def _jet_rgb(
    heatmap: np.ndarray,
) -> np.ndarray:
    """
    Lightweight jet-style color mapping.

    Avoids adding matplotlib to the FastAPI runtime.
    """

    x = np.clip(
        heatmap,
        0.0,
        1.0,
    )

    red = np.clip(
        1.5
        - np.abs(
            4.0
            * x
            - 3.0
        ),
        0.0,
        1.0,
    )

    green = np.clip(
        1.5
        - np.abs(
            4.0
            * x
            - 2.0
        ),
        0.0,
        1.0,
    )

    blue = np.clip(
        1.5
        - np.abs(
            4.0
            * x
            - 1.0
        ),
        0.0,
        1.0,
    )

    rgb = np.stack(
        [
            red,
            green,
            blue,
        ],
        axis=-1,
    )

    return (
        rgb
        * 255.0
    ).astype(
        np.uint8
    )


def _image_to_data_url(
    image: Image.Image,
) -> str:
    buffer = io.BytesIO()

    image.save(
        buffer,
        format="PNG",
        optimize=True,
    )

    encoded = base64.b64encode(
        buffer.getvalue()
    ).decode(
        "ascii"
    )

    return (
        "data:image/png;base64,"
        + encoded
    )


def build_gradcam_images(
    *,
    original_image: Image.Image,
    heatmap: np.ndarray,
):
    display_image = (
        original_image
        .copy()
        .convert(
            "RGB"
        )
    )

    display_image.thumbnail(
        (
            MAX_DISPLAY_SIDE,
            MAX_DISPLAY_SIDE,
        )
    )

    heatmap_rgb = (
        _jet_rgb(
            heatmap
        )
    )

    heatmap_image = Image.fromarray(
        heatmap_rgb
    )

    heatmap_image = (
        heatmap_image.resize(
            display_image.size,
            Image.Resampling.BILINEAR,
        )
    )

    original_array = np.asarray(
        display_image,
        dtype=np.float32,
    )

    heatmap_array = np.asarray(
        heatmap_image,
        dtype=np.float32,
    )

    overlay_array = (
        0.55
        * original_array
        +
        0.45
        * heatmap_array
    )

    overlay_array = np.clip(
        overlay_array,
        0,
        255,
    ).astype(
        np.uint8
    )

    overlay_image = (
        Image.fromarray(
            overlay_array
        )
    )

    return (
        _image_to_data_url(
            heatmap_image
        ),
        _image_to_data_url(
            overlay_image
        ),
    )


# =========================================================
# INFERENCE
# =========================================================


def run_medical_image_inference(
    image: Image.Image,
) -> InferenceResult:
    (
        model,
        device,
    ) = get_medical_image_model()

    transform = (
        get_eval_transform()
    )

    input_tensor = (
        transform(
            image
        )
        .unsqueeze(
            0
        )
        .to(
            device
        )
    )

    # Shared model + temporary Grad-CAM hooks must not be
    # mutated by two requests simultaneously.
    with MODEL_LOCK:
        target_layer = (
            model
            .layer4[-1]
            .conv2
        )

        gradcam = GradCAM(
            model=model,
            target_layer=(
                target_layer
            ),
        )

        try:
            (
                heatmap,
                predicted_index,
                probabilities,
            ) = gradcam.generate(
                input_tensor=(
                    input_tensor
                )
            )

        finally:
            gradcam.close()

    predicted_class = (
        CLASS_NAMES[
            predicted_index
        ]
    )

    model_score = float(
        probabilities[
            predicted_index
        ]
    )

    class_scores = {
        class_name:
            float(
                probabilities[
                    index
                ]
            )

        for (
            index,
            class_name,
        ) in enumerate(
            CLASS_NAMES
        )
    }

    (
        heatmap_data_url,
        overlay_data_url,
    ) = build_gradcam_images(
        original_image=image,
        heatmap=heatmap,
    )

    return InferenceResult(
        predicted_class=(
            predicted_class
        ),
        display_label=(
            DISPLAY_NAMES[
                predicted_class
            ]
        ),
        model_score=(
            model_score
        ),
        class_scores=(
            class_scores
        ),
        suggested_specialty=(
            SUGGESTED_SPECIALTY[
                predicted_class
            ]
        ),
        heatmap_data_url=(
            heatmap_data_url
        ),
        overlay_data_url=(
            overlay_data_url
        ),
    )


# =========================================================
# PERSIST + AUDIT
# =========================================================


def create_screening_analysis(
    db: Session,
    *,
    patient,
    current_user,
    filename: str,
    mime_type: str,
    file_bytes: bytes,
    disclaimer_accepted: bool,
):
    if not disclaimer_accepted:
        raise MedicalImageValidationError(
            "You must accept the screening disclaimer "
            "before analysis."
        )

    safe_filename = (
        Path(
            filename
            or "medical-image"
        )
        .name[
            :255
        ]
    )

    image = validate_and_load_image(
        file_bytes=file_bytes,
        filename=safe_filename,
        mime_type=mime_type,
    )

    inference = (
        run_medical_image_inference(
            image
        )
    )

    analysis = (
        create_medical_image_analysis(
            db,
            patient_id=(
                patient.id
            ),
            original_filename=(
                safe_filename
            ),
            mime_type=mime_type,
            file_size_bytes=len(
                file_bytes
            ),
            predicted_class=(
                inference
                .predicted_class
            ),
            display_label=(
                inference
                .display_label
            ),
            model_score=(
                inference
                .model_score
            ),
            class_scores=(
                inference
                .class_scores
            ),
            suggested_specialty=(
                inference
                .suggested_specialty
            ),
            model_name=(
                MODEL_NAME
            ),
            model_version=(
                MODEL_VERSION
            ),
            gradcam_target_layer=(
                GRADCAM_TARGET_LAYER
            ),
            disclaimer_accepted=True,
        )
    )

    record_audit_event(
        db,
        user_id=(
            current_user.id
        ),
        action=(
            AuditAction
            .IMAGE_ANALYSIS_CREATED
        ),
        resource_type=(
            AuditResourceType
            .IMAGE_ANALYSIS
        ),
        resource_id=(
            analysis.id
        ),
        metadata={
            "model":
                MODEL_VERSION,

            "target_layer":
                GRADCAM_TARGET_LAYER,
        },
    )

    db.commit()

    db.refresh(
        analysis
    )

    return (
        analysis,
        inference,
    )
