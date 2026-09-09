import type {
  AnalysisResult,
  DarkCircleHistory,
  HealthResponse,
  HistoryRecord,
} from "@/types/analysis";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiRequestError extends Error {
  status: number;
  errorCode: string;
  details: string[];

  constructor(message: string, status: number, errorCode: string, details: string[] = []) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }
}

async function parseError(response: Response): Promise<ApiRequestError> {
  try {
    const body = (await response.json()) as {
      error_code?: string;
      message?: string;
      details?: string[];
    };
    return new ApiRequestError(
      body.message || "The analysis service could not complete that request.",
      response.status,
      body.error_code || "REQUEST_FAILED",
      body.details || [],
    );
  } catch {
    return new ApiRequestError(
      "The analysis service could not complete that request.",
      response.status,
      "REQUEST_FAILED",
    );
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiRequestError(
      "The analysis service is unavailable. Check that the backend is running, then try again.",
      0,
      "BACKEND_UNAVAILABLE",
    );
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getApiBaseUrl(): string {
  return API_URL;
}

export async function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health");
}

export async function analyzeImage(file: Blob, filename = "capture.jpg"): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("file", file, filename);
  return request<AnalysisResult>("/api/analyze", {
    method: "POST",
    body: form,
  });
}

export async function listHistory(): Promise<HistoryRecord[]> {
  const data = await request<{ items: HistoryRecord[] }>("/api/history");
  return data.items;
}

export async function getHistoryItem(id: number): Promise<HistoryRecord> {
  return request<HistoryRecord>(`/api/history/${id}`);
}

export async function saveHistory(payload: {
  visible_spot_count: number;
  region_data: AnalysisResult["regions"];
  image_quality: AnalysisResult["image_quality"];
  detection_mode: AnalysisResult["detection_mode"];
  dark_circle_data?: DarkCircleHistory;
}): Promise<HistoryRecord> {
  return request<HistoryRecord>("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteHistory(id: number): Promise<void> {
  await request<void>(`/api/history/${id}`, { method: "DELETE" });
}
