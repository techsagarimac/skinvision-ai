# Model training and evaluation

This document describes how to train a custom YOLO detector for **visible
spots**. The resulting model still does not diagnose acne or any disease.

## 1. Dataset acquisition

Collect or license still images of faces with visible spots. Prefer written
consent and a documented license.

## 2. Dataset licensing

Do not scrape copyrighted photos. Do not include clinical datasets unless the
license and ethics review allow your use case.

## 3. Image collection

Capture diversity across:

- lighting
- skin tones
- camera quality
- face angles
- distances

Homogeneous data inflates metrics and fails in real captures.

## 4. Annotation

Label each visible spot with a bounding box. Use one class, `visible_spot`,
unless you later add non-diagnostic subclasses.

## 5. YOLO directory format

```
datasets/
  images/train
  images/val
  images/test
  labels/train
  labels/val
  labels/test
  data.yaml
```

Each label file uses YOLO lines: `class x_center y_center width height`
with normalized values.

## 6. Train / validation split

Keep a held-out validation set and a final test set. Avoid leaking the same
person or near-duplicate frames across splits.

## 7. Training

```bash
python training/train.py \
  --data datasets/data.yaml \
  --model yolov8n.pt \
  --epochs 100 \
  --imgsz 640 \
  --batch 16
```

## 8. Validation

Review precision, recall, and confusion during training. Inspect false
positives on texture, pores, and highlights.

## 9. Testing

Evaluate on the held-out test set and on stressed captures (low light, motion,
strong flash, profile views).

## 10. Model export

Copy the best `.pt` file into `models/` and set `MODEL_PATH`.

## 11. Deployment

Restart the backend. `/api/health` should report `detection_mode: "yolo"`.
If the file is missing, the API stays in demo mode.

## Metrics

| Metric | Meaning |
| --- | --- |
| Precision | Of predicted spots, how many match annotations |
| Recall | Of annotated spots, how many were found |
| mAP50 | Mean average precision at IoU 0.50 |
| mAP50-95 | Mean average precision across IoU 0.50–0.95 |
| False positives | Marks that are not visible spots |
| False negatives | Visible spots the model missed |

Do not claim product accuracy until you publish measured results on a
documented test set.

Diverse evaluation is required because lighting, skin tone, camera quality,
angle, and distance all change appearance.
