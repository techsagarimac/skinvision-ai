# API

Base URL in local development: `http://localhost:8000`

All error responses use:

```json
{
  "error_code": "NO_FACE",
  "message": "Human-readable explanation",
  "details": []
}
```

Stack traces are never returned to clients.

## GET /api/health

```json
{
  "status": "ok",
  "detection_mode": "demo",
  "face_engine": "mediapipe",
  "app": "SkinVision AI"
}
```

## POST /api/analyze

`multipart/form-data` field `file`.

Accepted types: JPEG, PNG, WebP. Default size limit: 8 MB.

Success includes detections in normalized coordinates (`x`, `y`, `width`,
`height` in `0..1`), region counts, landmarks, image quality, guidance,
visible-spot level, and an under-eye darkness estimate (`dark_circles`).

Common error codes:

- `UNSUPPORTED_IMAGE`
- `IMAGE_TOO_LARGE`
- `CORRUPTED_IMAGE`
- `NO_FACE`
- `MULTIPLE_FACES`

## GET /api/history

Returns `{ "items": [ ... ] }` ordered by time.

## GET /api/history/{id}

Single saved record.

## POST /api/history

Body:

```json
{
  "visible_spot_count": 8,
  "region_data": {
    "forehead": 2,
    "left_cheek": 3,
    "right_cheek": 2,
    "nose": 0,
    "chin": 1
  },
  "image_quality": "good",
  "detection_mode": "demo"
}
```

## DELETE /api/history/{id}

Removes a saved statistics record.
