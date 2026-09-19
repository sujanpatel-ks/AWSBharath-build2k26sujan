/**
 * AgroCare AI — Typed API client
 * All calls go through API Gateway with Cognito JWT.
 * Never exposes AWS credentials or hard-codes endpoints.
 */

import { fetchAuthSession } from "aws-amplify/auth";
import type {
  ApiError,
  DiagnosisFormValues,
  DiagnosisHistoryResponse,
  DiagnosisResponse,
  DiagnosisSummary,
  FarmerProfile,
  PresignedUrlResponse,
  RAGResponse,
  WeatherResponse,
} from "@/types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");
const DEMO_MODE_ENABLED = import.meta.env.VITE_ENABLE_DEMO_MODE === "true";

if (!API_BASE) {
  console.error(
    "VITE_API_BASE_URL is not set. Configure the AWS API Gateway URL before using the application."
  );
}

// ── Helper to check demo mode ────────────────────────────────────────

function isDemoMode(): boolean {
  return DEMO_MODE_ENABLED && localStorage.getItem("agro_demo_mode") === "true";
}

// ── Core fetch wrapper ─────────────────────────────────────────────

async function getIdToken(): Promise<string> {
  if (isDemoMode()) return "demo-jwt-token-12345";
  if (!API_BASE) {
    throw new Error("AWS API is not configured. Set VITE_API_BASE_URL and rebuild the frontend.");
  }
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("No auth token available");
  return token;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_BASE) {
    throw new Error("AWS API is not configured. Set VITE_API_BASE_URL and rebuild the frontend.");
  }
  const token = await getIdToken();
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = data as ApiError;
    throw new ApiClientError(
      err.message || "Request failed",
      response.status,
      err.error || "API_ERROR"
    );
  }

  return data as T;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

// ── Demo Mock Storage ──────────────────────────────────────────────

const DEMO_DIAGNOSES_STORE: Record<string, DiagnosisResponse> = {};

function getDemoDiagnosis(crop = "Arecanut", _location = "Mandya, Karnataka", _growthStage = "Vegetative", _symptoms = "Yellow leaves with brown spots"): DiagnosisResponse {
  return {
    diagnosis_id: `diag-demo-${Date.now()}`,
    farmer_id: "demo-farmer-001",
    created_at: new Date().toISOString(),
    crop: crop || "Arecanut",
    possible_condition: "Yellow Leaf Disease (YLD)",
    confidence: 94,
    observations: [
      "Leaves show progressive yellowing from tip to base",
      "Stunted crown growth and root decay observed",
      "Early intervention recommended to prevent yield reduction"
    ],
    risk_level: "HIGH",
    evidence: [
      {
        source: "CPCRI Technical Bulletin No. 42",
        text: "Yellow leaf disease symptoms in arecanut are characterized by foliar chlorosis starting from inner whorls.",
        score: 0.94
      }
    ],
    weather_context: {
      summary: "28°C, 65% humidity, Partly cloudy",
      spray_window_safe: true,
      rain_expected_hours: null,
      temperature_celsius: 28,
      humidity_percent: 65,
      advisory: "Conditions appear suitable for field operations."
    },
    safety_status: "ALLOW",
    safety_reason: "Recommended treatment is within approved ICAR dosage guidelines.",
    recommendation: {
      summary: "Apply Trichoderma Viride mixed with organic compost and establish 45cm deep drainage channels.",
      action_plan: [
        "Apply 50g Trichoderma Viride bio-fungicide mixed with 5kg organic compost per palm root zone twice annually.",
        "Construct 45cm deep drainage channels between palm rows to prevent water stagnation.",
        "Feed Hexaconazole 5% EC (2ml in 100ml water) through healthy root tip if fungal spread continues."
      ],
      dosage_instructions: "50g Trichoderma per palm; 2ml Hexaconazole per 100ml water.",
      timing_instructions: "Apply during clear weather morning window before 11 AM.",
      precautions: [
        "Do not mix chemical fungicides directly with bio-agents.",
        "Wear protective gloves during chemical application."
      ],
      sources: [
        {
          source: "ICAR Crop Advisory Handbook",
          text: "Standard integrated pest management protocol for arecanut plantation.",
          score: 0.92
        }
      ],
      needs_expert_review: false,
      follow_up_days: 7
    },
    needs_expert_review: false,
    workflow_complete: true
  };
}

// ── Upload ─────────────────────────────────────────────────────────

export async function getPresignedUploadUrl(
  filename: string,
  contentType: string
): Promise<PresignedUrlResponse> {
  if (isDemoMode()) {
    return {
      uploadUrl: "https://httpbin.org/put",
      key: `demo/${Date.now()}_${filename}`,
      bucket: "agrocare-crop-images-demo",
      expiresIn: 900,
      maxFileSizeBytes: 10 * 1024 * 1024
    };
  }
  const params = new URLSearchParams({ filename, contentType });
  return apiFetch<PresignedUrlResponse>(`/upload/presigned?${params}`);
}

export async function uploadImageToS3(
  presignedUrl: string,
  file: File
): Promise<void> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 400));
    return;
  }
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) {
    throw new ApiClientError("Image upload to S3 failed", response.status, "UPLOAD_FAILED");
  }
}

// ── Diagnosis ──────────────────────────────────────────────────────

export async function createDiagnosis(
  imageKey: string,
  form: DiagnosisFormValues
): Promise<DiagnosisResponse> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 1200));
    const demoResult = getDemoDiagnosis(form.crop, form.location, form.growthStage, form.symptoms);
    DEMO_DIAGNOSES_STORE[demoResult.diagnosis_id] = demoResult;
    return demoResult;
  }
  return apiFetch<DiagnosisResponse>("/diagnosis", {
    method: "POST",
    body: JSON.stringify({
      image_key: imageKey,
      crop: form.crop,
      location: form.location,
      growth_stage: form.growthStage,
      symptoms: form.symptoms || undefined,
    }),
  });
}

export async function getDiagnosis(id: string): Promise<DiagnosisResponse> {
  if (isDemoMode()) {
    if (DEMO_DIAGNOSES_STORE[id]) return DEMO_DIAGNOSES_STORE[id];
    const mock = getDemoDiagnosis();
    mock.diagnosis_id = id;
    return mock;
  }
  return apiFetch<DiagnosisResponse>(`/diagnosis/${id}`);
}

export async function getDiagnosisHistory(
  limit = 20,
  startKey?: string
): Promise<DiagnosisHistoryResponse> {
  if (isDemoMode()) {
    const list: DiagnosisSummary[] = [
      {
        diagnosisId: "diag-demo-101",
        crop: "Arecanut",
        possibleCondition: "Yellow Leaf Disease (YLD)",
        confidence: "94%",
        riskLevel: "HIGH",
        safetyDecision: "ALLOW",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        location: "Mandya, Karnataka",
      },
      {
        diagnosisId: "diag-demo-102",
        crop: "Paddy / Rice",
        possibleCondition: "Paddy Blast (Pyricularia oryzae)",
        confidence: "88%",
        riskLevel: "MEDIUM",
        safetyDecision: "ALLOW",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        location: "Mandya, Karnataka",
      },
      {
        diagnosisId: "diag-demo-103",
        crop: "Tomato",
        possibleCondition: "Early Blight (Alternaria solani)",
        confidence: "76%",
        riskLevel: "LOW",
        safetyDecision: "ALLOW",
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        location: "Mandya, Karnataka",
      },
    ];
    return { diagnoses: list.slice(0, limit), count: list.length, nextKey: null };
  }
  const params = new URLSearchParams({ limit: String(limit) });
  if (startKey) params.set("startKey", startKey);
  return apiFetch<DiagnosisHistoryResponse>(`/diagnosis/history?${params}`);
}

// ── Profile ────────────────────────────────────────────────────────

let DEMO_PROFILE_STORE: FarmerProfile = {
  farmerId: "demo-farmer-001",
  name: "Ramesh Kumar",
  email: "ramesh.farmer@agrocare.ai",
  phone: "+91 9876543210",
  location: "Mandya, Karnataka",
  farmSizeAcres: 4.5,
  primaryCrops: ["Arecanut", "Paddy"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function getProfile(): Promise<FarmerProfile> {
  if (isDemoMode()) {
    return DEMO_PROFILE_STORE;
  }
  return apiFetch<FarmerProfile>("/profile");
}

export async function updateProfile(
  updates: Partial<FarmerProfile>
): Promise<FarmerProfile> {
  if (isDemoMode()) {
    DEMO_PROFILE_STORE = { ...DEMO_PROFILE_STORE, ...updates };
    return DEMO_PROFILE_STORE;
  }
  return apiFetch<FarmerProfile>("/profile", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// ── Agricultural knowledge ─────────────────────────────────────────

export async function queryKnowledge(
  question: string,
  crop?: string,
  location?: string
): Promise<RAGResponse> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 800));
    const lower = question.toLowerCase();
    let answer = `For ${question}, ensure recommended crop nutrition balance and disease monitoring. For fungal or leaf spot symptoms, bio-fungicides like Trichoderma or Pseudomonas fluorescens are effective organic controls.`;
    
    if (lower.includes("yellow leaf") || lower.includes("arecanut")) {
      answer = "Yellow Leaf Disease in Arecanut is managed through root feeding of Hexaconazole (5% EC) 2ml in 100ml water per tree, paired with 50g Trichoderma Viride in organic compost. Ensure deep field drainage channels to prevent root rot.";
    } else if (lower.includes("dap") || lower.includes("fertilizer") || lower.includes("rice")) {
      answer = "DAP (Di-ammonium Phosphate) should be applied as basal dose during land preparation for rice (approx 50kg/acre). Avoid applying DAP directly on foliage to prevent fertilizer burn.";
    } else if (lower.includes("curl") || lower.includes("tomato")) {
      answer = "Tomato Leaf Curl virus is spread by whiteflies. Control whitefly population using neem oil spray (5ml/L) or yellow sticky traps. Remove severely infected plants early to prevent spread.";
    }

    return {
      answer,
      sources: [
        { text: "ICAR Agricultural Advisory Handbook: Crop Health and integrated management.", source: "ICAR Handbook", score: 0.92 },
        { text: "CPCRI Arecanut & Coconut Technical Bulletin on disease management.", source: "CPCRI Bulletin", score: 0.88 },
      ],
      confidence: 0.91,
      insufficient_evidence: false,
      question_type: "static",
    };
  }
  return apiFetch<RAGResponse>("/agriculture/query", {
    method: "POST",
    body: JSON.stringify({ question, crop, location }),
  });
}

// ── Weather ────────────────────────────────────────────────────────

export async function getWeather(
  lat: number,
  lon: number
): Promise<WeatherResponse> {
  if (isDemoMode()) {
    return getWeatherByLocation("Mandya, Karnataka");
  }
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  return apiFetch<WeatherResponse>(`/weather?${params}`);
}

export async function getWeatherByLocation(
  location: string
): Promise<WeatherResponse> {
  if (isDemoMode()) {
    return {
      location: location || "Mandya, Karnataka",
      temperature: 28,
      condition: "Partly Cloudy",
      humidity: 65,
      wind_speed: 12,
      advisory: "Favorable conditions for agricultural operations today. Moderate rain forecasted in 2 days — plan pesticide sprays accordingly.",
      forecast: [
        { day: "Today", temp_high: 29, temp_low: 21, condition: "Partly Cloudy", rain_chance: 15 },
        { day: "Tomorrow", temp_high: 28, temp_low: 20, condition: "Light Rain", rain_chance: 45 },
        { day: "Day 3", temp_high: 27, temp_low: 20, condition: "Thunderstorms", rain_chance: 75 },
      ],
    } as any;
  }
  const params = new URLSearchParams({ location });
  return apiFetch<WeatherResponse>(`/weather?${params}`);
}
