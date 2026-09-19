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
  FarmerProfile,
  PresignedUrlResponse,
  RAGResponse,
  WeatherResponse,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE) {
  console.warn("VITE_API_BASE_URL is not set. API calls will fail.");
}

// ── Helper to check demo mode ────────────────────────────────────────

function isDemoMode(): boolean {
  return !API_BASE || localStorage.getItem("agro_demo_mode") === "true";
}

// ── Core fetch wrapper ─────────────────────────────────────────────

async function getIdToken(): Promise<string> {
  if (isDemoMode()) return "demo-jwt-token-12345";
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("No auth token available");
  return token;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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

function getDemoDiagnosis(crop = "Arecanut", location = "Mandya, Karnataka", growthStage = "Vegetative", symptoms = "Yellow leaves with brown spots"): DiagnosisResponse {
  return {
    diagnosis_id: `diag-demo-${Date.now()}`,
    farmer_id: "demo-farmer-001",
    crop: crop || "Arecanut",
    location: location || "Mandya, Karnataka",
    growth_stage: (growthStage as any) || "Vegetative",
    symptoms: symptoms || "Yellowing leaves with brown spots",
    image_key: "demo/arecanut_leaf.jpg",
    status: "COMPLETED",
    diagnosis: {
      disease_name: "Yellow Leaf Disease (YLD)",
      scientific_name: "Phytoplasma / Ganoderma lucidum",
      confidence_score: 94,
      risk_level: "HIGH",
      summary: `${crop || "Arecanut"} Yellow Leaf Disease detected with 94% confidence. Leaves show progressive yellowing from tip to base with stunted crown growth. Early intervention is strongly recommended to prevent yield reduction.`,
      organic_treatment: [
        {
          step: 1,
          title: "Trichoderma Viride Root Application",
          description: "Apply 50g Trichoderma Viride bio-fungicide mixed with 5kg organic compost per palm root zone twice annually.",
          dosage: "50g per tree",
          frequency: "Pre-monsoon and Post-monsoon",
          precautions: "Do not mix directly with chemical fungicides within 14 days of application.",
        },
        {
          step: 2,
          title: "Deep Soil Drainage Channel",
          description: "Construct 45cm deep drainage channels between palm rows to prevent water stagnation around feeder roots.",
          dosage: "N/A",
          frequency: "Continuous maintenance",
          precautions: "Avoid severing main structural roots during excavation.",
        }
      ],
      chemical_treatment: [
        {
          step: 1,
          title: "Root Feeding Hexaconazole 5% EC",
          description: "Prepare 2ml Hexaconazole 5% EC in 100ml water and feed through healthy active root tip.",
          dosage: "2ml in 100ml water per palm",
          frequency: "Every 45 days during monsoon",
          precautions: "Use protective gloves; handle chemical with care.",
        },
        {
          step: 2,
          title: "Soil Micronutrient Drenching",
          description: "Apply Magnesium Sulphate (50g) and Zinc Sulphate (25g) per palm to restore chlorophyll synthesis.",
          dosage: "75g mix per palm",
          frequency: "Every 6 months",
          precautions: "Apply in 1-meter radius ring from tree trunk.",
        }
      ],
      preventive_measures: [
        "Avoid root mechanical injuries during weeding and tilling.",
        "Maintain balanced NPK fertilizer ratio (100:40:140g per palm per year).",
        "Perform regular soil pH testing; maintain target pH between 6.0 and 6.8.",
      ],
    },
    created_at: new Date().toISOString(),
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
        diagnosis_id: "diag-demo-101",
        crop: "Arecanut",
        disease_name: "Yellow Leaf Disease (YLD)",
        risk_level: "HIGH",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        location: "Mandya, Karnataka",
      },
      {
        diagnosis_id: "diag-demo-102",
        crop: "Paddy / Rice",
        disease_name: "Paddy Blast (Pyricularia oryzae)",
        risk_level: "MEDIUM",
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        location: "Mandya, Karnataka",
      },
      {
        diagnosis_id: "diag-demo-103",
        crop: "Tomato",
        disease_name: "Early Blight (Alternaria solani)",
        risk_level: "LOW",
        created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        location: "Mandya, Karnataka",
      },
    ];
    return { diagnoses: list.slice(0, limit) };
  }
  const params = new URLSearchParams({ limit: String(limit) });
  if (startKey) params.set("startKey", startKey);
  return apiFetch<DiagnosisHistoryResponse>(`/diagnosis/history?${params}`);
}

// ── Profile ────────────────────────────────────────────────────────

let DEMO_PROFILE_STORE: FarmerProfile = {
  farmer_id: "demo-farmer-001",
  name: "Ramesh Kumar",
  location: "Mandya, Karnataka",
  preferred_crop: "Arecanut & Paddy",
  preferred_language: "kn",
  created_at: new Date().toISOString(),
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
        { title: "ICAR Agricultural Advisory Handbook", section: "Crop Health", page: 14 },
        { title: "CPCRI Arecanut & Coconut Technical Bulletin", section: "Disease Management", page: 8 },
      ],
      insufficient_evidence: false,
      question_type: "rag",
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
