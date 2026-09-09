#!/usr/bin/env python3
"""Train a YOLO visible-spot detector with Ultralytics.

Example:
  python training/train.py --data datasets/data.yaml --model yolov8n.pt --epochs 100 --imgsz 640
"""

from __future__ import annotations

import argparse
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train a YOLO model for visible-spot detection.")
    parser.add_argument("--data", required=True, help="Path to dataset YAML")
    parser.add_argument("--model", default="yolov8n.pt", help="Base YOLO weights or architecture")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--project", default="runs/detect")
    parser.add_argument("--name", default="skinvision-yolo")
    parser.add_argument("--device", default=None, help="cuda, cpu, or device index")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data_path = Path(args.data)
    if not data_path.is_file():
        raise SystemExit(f"Dataset YAML not found: {data_path}")

    try:
        from ultralytics import YOLO
    except ImportError as exc:
        raise SystemExit("Install ultralytics before training: pip install ultralytics") from exc

    model = YOLO(args.model)
    model.train(
        data=str(data_path),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=args.project,
        name=args.name,
        device=args.device,
    )
    print("Training finished. Review runs/ and export the best weights into models/.")


if __name__ == "__main__":
    main()
