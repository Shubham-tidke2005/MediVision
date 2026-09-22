from torchvision import transforms

from phase38_config import (
    IMAGE_SIZE,
)


# ImageNet normalization used with pretrained ResNet18.
IMAGENET_MEAN = (
    0.485,
    0.456,
    0.406,
)

IMAGENET_STD = (
    0.229,
    0.224,
    0.225,
)


def build_train_transform():
    """
    Conservative augmentation for academic MRI
    classification work.

    We avoid aggressive transformations that could
    create unrealistic medical images.
    """

    return transforms.Compose(
        [
            transforms.Resize(
                (
                    IMAGE_SIZE,
                    IMAGE_SIZE,
                )
            ),

            transforms.RandomRotation(
                degrees=8
            ),

            transforms.RandomAffine(
                degrees=0,
                translate=(
                    0.04,
                    0.04,
                ),
                scale=(
                    0.95,
                    1.05,
                ),
            ),

            transforms.ColorJitter(
                brightness=0.08,
                contrast=0.08,
            ),

            transforms.ToTensor(),

            transforms.Normalize(
                mean=IMAGENET_MEAN,
                std=IMAGENET_STD,
            ),
        ]
    )


def build_eval_transform():
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
                mean=IMAGENET_MEAN,
                std=IMAGENET_STD,
            ),
        ]
    )
