# Architecture

SkinVision AI is a loosely coupled monorepo.

```
Browser (Next.js)
    │  HTTP + multipart image
    ▼
FastAPI
    │
    ├── Image validation / resize
    ├── Face analysis (MediaPipe or OpenCV)
    ├── Image quality estimates
    ├── AcneDetector (MockDetector or YOLODetector)
    ├── Guidance engine
    └── Optional SQLite history (statistics only)
```

## Frontend

Next.js App Router, TypeScript, Tailwind CSS.

Routes:

- `/` landing
- `/analyze` capture, upload, results
- `/history` saved statistics and trend
- `/compare` earlier vs later detection change
- `/privacy` privacy policy

The camera captures a single frame. Frames are not streamed to the backend.

Images are resized on the client before upload.

## Backend

FastAPI services live under `backend/app/services/`.

| Service | Role |
| --- | --- |
| `image_io` | Type, size, and decode checks |
| `face_analysis` | Face count, box, landmarks, region boxes |
| `image_quality` | Conservative brightness / blur / framing notes |
| `acne_detector` | Shared detection interface |
| `guidance` | Non-medical guidance and visible-spot level |
| `analysis_engine` | Orchestration |

## Detector switch

`DETECTOR_MODE=auto` loads YOLO when `MODEL_PATH` exists and is readable.
Otherwise `MockDetector` runs and the API reports `detection_mode: "demo"`.

Both detectors return the same `Detection` schema with normalized coordinates.

## Data

SQLite stores analysis statistics only:

- visible spot count
- region totals
- image quality label
- detection mode
- timestamp

Original images are not persisted.

## Future modules

The detector and analysis result schema can accept additional non-diagnostic
visualizations later (texture, redness, pores, pigmentation, multilingual
guidance, or an external voice API) without changing the product’s medical
boundary: no diagnosis, no prescriptions.
