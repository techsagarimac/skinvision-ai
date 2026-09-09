# Training a custom visible-spot model

SkinVision AI can run without any trained weights using **Demo AI Detection**.
Use this folder when you have a licensed dataset and want to replace `MockDetector`
with `YOLODetector`.

## Command

```bash
python training/train.py \
  --data datasets/data.yaml \
  --model yolov8n.pt \
  --epochs 100 \
  --imgsz 640 \
  --batch 16
```

Copy `dataset.yaml.example` to `datasets/data.yaml` and edit the paths.

Do not download or include copyrighted datasets unless you have a license that
allows training and redistribution.

See `docs/model-training.md` for the full workflow, evaluation metrics, and
deployment notes.
