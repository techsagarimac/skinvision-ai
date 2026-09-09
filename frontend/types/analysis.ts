export type FacialRegion =
  | "forehead"
  | "left_cheek"
  | "right_cheek"
  | "nose"
  | "chin";

export type ImageQuality = "good" | "acceptable" | "poor";

export type DetectionMode = "demo" | "yolo";

export type VisibleSpotLevel = "low" | "moderate" | "high";

export type DarkCircleLevel = "none" | "low" | "moderate" | "high";

export type UnderEyeRegion = "left_under_eye" | "right_under_eye";

export interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  category: "visible_spot";
  region: FacialRegion;
}

export interface RegionCounts {
  forehead: number;
  left_cheek: number;
  right_cheek: number;
  nose: number;
  chin: number;
}

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Landmark {
  x: number;
  y: number;
}

export interface ImageQualityReport {
  level: ImageQuality;
  brightness: number;
  blur_score: number;
  face_size_ratio: number;
  alignment_ok: boolean;
  instructions: string[];
}

export interface AnalysisSummary {
  visible_spot_level: VisibleSpotLevel;
  level_label: string;
  disclaimer: string;
}

export interface UnderEyeEstimate {
  region: UnderEyeRegion;
  box: FaceBox;
  darkness_score: number;
  confidence: number;
  visible: boolean;
}

export interface DarkCircleReport {
  detected: boolean;
  level: DarkCircleLevel;
  level_label: string;
  disclaimer: string;
  left: UnderEyeEstimate;
  right: UnderEyeEstimate;
}

export interface DarkCircleHistory {
  detected: boolean;
  level: DarkCircleLevel;
  left_score: number;
  right_score: number;
}

export interface AnalysisResult {
  face_detected: boolean;
  face_count: number;
  image_quality: ImageQuality;
  image_quality_report: ImageQualityReport;
  detection_mode: DetectionMode;
  total_visible_spots: number;
  regions: RegionCounts;
  detections: Detection[];
  landmarks: Landmark[];
  face_box: FaceBox | null;
  summary: AnalysisSummary;
  dark_circles: DarkCircleReport;
  guidance: string[];
  error_code?: string | null;
  message?: string | null;
}

export interface HistoryRecord {
  id: number;
  created_at: string;
  visible_spot_count: number;
  region_data: RegionCounts;
  image_quality: ImageQuality;
  detection_mode: DetectionMode;
  dark_circle_data?: DarkCircleHistory | null;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  detection_mode: DetectionMode;
  face_engine: string;
  app: string;
}

export interface ApiErrorBody {
  error_code: string;
  message: string;
  details?: string[];
}

export const REGION_LABELS: Record<FacialRegion, string> = {
  forehead: "Forehead",
  left_cheek: "Left cheek",
  right_cheek: "Right cheek",
  nose: "Nose",
  chin: "Chin",
};

export const REGION_ORDER: FacialRegion[] = [
  "forehead",
  "left_cheek",
  "right_cheek",
  "nose",
  "chin",
];

export const EMPTY_REGIONS: RegionCounts = {
  forehead: 0,
  left_cheek: 0,
  right_cheek: 0,
  nose: 0,
  chin: 0,
};

export const UNDER_EYE_LABELS: Record<UnderEyeRegion, string> = {
  left_under_eye: "Left under-eye",
  right_under_eye: "Right under-eye",
};
