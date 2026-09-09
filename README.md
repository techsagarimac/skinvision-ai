# SkinVision AI

**Understand Your Skin Through AI Vision**

SkinVision AI is an AI-powered computer-vision application that analyzes a face photo or webcam frame, estimates **visible acne-like spots**, maps them to approximate facial regions, and offers conservative general skincare guidance.

This is **not** a medical diagnostic system. It does not diagnose acne, infection, cancer, or any other condition. It never prescribes medication.

---

## Features

- Upload a photo or capture a single webcam frame
- Face detection and landmark-based region estimates
- Under-eye darkness scan on the left and right sides
- Demo AI Detection that works without a trained model
- YOLO-ready detector interface for a custom model later
- Image quality notes (brightness, blur, framing)
- Visual overlay, region breakdown, and visible-spot level
- Optional saved statistics and a progress chart
- Earlier vs later detection comparison
- Browser speech playback of results
- Privacy-first design: images are not stored by default

## Architecture

```
frontend/   Next.js + React + TypeScript + Tailwind CSS
backend/    FastAPI + OpenCV + MediaPipe + Ultralytics YOLO
models/     Optional custom weights
datasets/   Optional licensed training data
training/   YOLO training entrypoint
```

The frontend talks to the backend over HTTP. They are loosely coupled.

See `docs/architecture.md` and `docs/api.md`.

## Installation

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

### Backend setup

macOS / Linux:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Windows:

```bat
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

If MediaPipe or Ultralytics fail to install, install the remaining packages from `backend/requirements-base.txt`. The API still starts in Demo AI Detection mode with OpenCV face detection.

On some macOS setups, MediaPipe 1.x Face Landmarker can crash the process because of a Metal runtime issue. Leave `USE_MEDIAPIPE_TASKS=false` (the default). OpenCV still detects faces. Set `USE_MEDIAPIPE_TASKS=true` only on platforms where the Tasks API is known to be stable.

## Environment variables

Root `.env.example` lists the shared keys.

Frontend (`frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend (`backend/.env`):

```
APP_NAME=SkinVision AI
APP_ENV=development
FRONTEND_ORIGIN=http://localhost:3000
DATABASE_URL=sqlite:///./data/skinvision.db
MODEL_PATH=../models/acne_yolo.pt
YOLO_CONFIDENCE=0.35
DETECTOR_MODE=auto
MAX_IMAGE_SIZE=1280
MAX_UPLOAD_BYTES=8388608
LOG_LEVEL=INFO
```

`DETECTOR_MODE=auto` uses YOLO when `MODEL_PATH` exists; otherwise it uses the mock detector.

## Running locally

Terminal 1:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Docker:

```bash
docker compose up --build
```

## Training a model

```bash
python training/train.py \
  --data datasets/data.yaml \
  --model yolov8n.pt \
  --epochs 100 \
  --imgsz 640
```

Do not use copyrighted datasets without a license. Full notes: `docs/model-training.md`.

## Using a custom YOLO model

1. Export weights to `models/acne_yolo.pt`
2. Set `MODEL_PATH` to that file
3. Restart the backend
4. Confirm `/api/health` reports `"detection_mode": "yolo"`

If the file is missing, the product stays on **Demo AI Detection**.

## API documentation

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

Written reference: `docs/api.md`

## Privacy considerations

- Images are analyzed for the requested purpose
- Images are not saved permanently by default
- Face recognition is not performed
- Identity is not inferred
- Users choose whether to save numeric analysis statistics

Details: `docs/privacy.md` and `/privacy`.

## Limitations

- Demo detections are simulated when no model is present
- Facial regions are approximate, not anatomical
- Visible-spot level is a count-based label, not medical severity
- Results vary with lighting, angle, occlusion, and camera quality
- Accuracy must not be claimed without a measured evaluation set

## Future improvements

- Custom trained visible-spot model
- Skin texture, redness, pore, and pigmentation visualizations
- Multilingual guidance
- Optional external voice API
- Personalized non-medical education content

None of those extensions should become medical diagnosis.
