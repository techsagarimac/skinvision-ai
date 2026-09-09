# Models

Place exported YOLO weights here, for example:

```
models/acne_yolo.pt
```

Then set:

```
MODEL_PATH=../models/acne_yolo.pt
DETECTOR_MODE=auto
```

If the file is missing, the backend uses Demo AI Detection automatically and
does not crash.

`face_landmarker.task` is optional. MediaPipe 1.x Tasks are disabled by default
(`USE_MEDIAPIPE_TASKS=false`) because some macOS environments abort when the
Metal-backed landmarker starts. OpenCV still detects faces.
