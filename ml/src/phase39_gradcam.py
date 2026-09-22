import torch
import torch.nn.functional as F


class GradCAM:
    """Grad-CAM for one image and one selected output class."""

    def __init__(self, *, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.activations = None
        self.gradients = None
        self._forward_handle = target_layer.register_forward_hook(
            self._forward_hook
        )

    def _forward_hook(self, module, inputs, output):
        self.activations = output
        if output.requires_grad:
            output.register_hook(self._save_gradient)

    def _save_gradient(self, gradient):
        self.gradients = gradient

    def remove_hooks(self):
        if self._forward_handle is not None:
            self._forward_handle.remove()
            self._forward_handle = None

    def generate(self, *, input_tensor: torch.Tensor, class_index=None):
        self.activations = None
        self.gradients = None
        self.model.zero_grad(set_to_none=True)

        logits = self.model(input_tensor)
        probabilities = torch.softmax(logits, dim=1)
        predicted_index = int(probabilities.argmax(dim=1).item())
        target_index = predicted_index if class_index is None else int(class_index)

        if not 0 <= target_index < logits.shape[1]:
            raise ValueError("Grad-CAM target class index is out of range.")

        logits[0, target_index].backward()

        if self.activations is None:
            raise RuntimeError("Grad-CAM did not capture activations.")
        if self.gradients is None:
            raise RuntimeError("Grad-CAM did not capture gradients.")

        activations = self.activations.detach()
        gradients = self.gradients.detach()
        weights = gradients.mean(dim=(2, 3), keepdim=True)
        cam = (weights * activations).sum(dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = F.interpolate(
            cam,
            size=(input_tensor.shape[-2], input_tensor.shape[-1]),
            mode="bilinear",
            align_corners=False,
        )[0, 0]

        minimum = cam.min()
        maximum = cam.max()
        denominator = maximum - minimum
        if denominator.item() > 0:
            cam = (cam - minimum) / denominator
        else:
            cam = torch.zeros_like(cam)

        return (
            cam.cpu(),
            predicted_index,
            probabilities[0].detach().cpu(),
            target_index,
        )
