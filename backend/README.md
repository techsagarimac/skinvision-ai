# SkinVision AI backend

FastAPI service for visual face analysis.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The API listens on `http://localhost:8000`.

If MediaPipe or Ultralytics cannot be installed on your Python version, install
the remaining packages. The server still starts: OpenCV provides face detection
and Demo AI Detection provides spot estimates.

## Environment

See `.env.example`. Important keys:

- `MODEL_PATH` — YOLO weights. Missing file → demo mode
- `YOLO_CONFIDENCE`
- `MAX_IMAGE_SIZE`
- `FRONTEND_ORIGIN`
- `DATABASE_URL`

## Checks

```bash
python -c "from app.main import app; print(app.title)"
```
