// AgroCare AI — Shared TypeScript types
// Mirror the backend Pydantic schemas exactly

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SafetyDecision = "ALLOW" | "MODIFY" | "BLOCK" | "DEFER" | "ESCALATE";

export type GrowthStage =
  | "Seedling"
  | "Vegetative"
  | "Flowering"
  | "Fruiting"
  | "Harvesting"
  | "Post-Harvest";

// ── Evidence ──────────────────────────────────────────────────────
export interface Evidence {
  text: string;
  source: string;
  score: number;
}

// ── Weather ───────────────────────────────────────────────────────
export interface WeatherContext {
  summary: string;
  spray_window_safe: boolean;
  rain_expected_hours: number | null;
  temperature_celsius: number | null;
  humidity_percent: number | null;
  advisory: string;
}

// ── Safety ────────────────────────────────────────────────────────
export interface SafetyValidationResult {
  decision: SafetyDecision;
  reason: string;
  modified_action: string | null;
  checks_performed: string[];
}

// ── Recommendation ────────────────────────────────────────────────
export interface Recommendation {
  summary: string;
  action_plan: string[];
  dosage_instructions: string | null;
  timing_instructions: string | null;
  precautions: string[];
  sources: Evidence[];
  needs_expert_review: boolean;
  follow_up_days: number | null;
}

// ── Complete Diagnosis Response ───────────────────────────────────
export interface DiagnosisResponse {
  diagnosis_id: string;
  farmer_id: string;
  created_at: string;
  crop: string;
  possible_condition: string;
  confidence: number;
  observations: string[];
  risk_level: RiskLevel;
  evidence: Evidence[];
  weather_context: WeatherContext | null;
  safety_status: SafetyDecision;
  safety_reason: string;
  recommendation: Recommendation | null;
  needs_expert_review: boolean;
  workflow_complete: boolean;
}

// ── History ───────────────────────────────────────────────────────
export interface DiagnosisSummary {
  diagnosisId: string;
  crop: string;
  possibleCondition: string;
  confidence: string;
  riskLevel: RiskLevel;
  safetyDecision: SafetyDecision;
  createdAt: string;
  location: string;
}

export interface DiagnosisHistoryResponse {
  diagnoses: DiagnosisSummary[];
  count: number;
  nextKey: string | null;
}

// ── Upload ────────────────────────────────────────────────────────
export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  bucket: string;
  expiresIn: number;
  maxFileSizeBytes: number;
}

// ── Profile ───────────────────────────────────────────────────────
export interface FarmerProfile {
  farmerId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  farmSizeAcres: number | null;
  primaryCrops: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Farm {
  farmId: string;
  farmName: string;
  areaAcres: number;
  soilType: string;
  irrigationType: string;
  location: string;
  primaryCrops: string[];
  createdAt: string;
}

// ── RAG ───────────────────────────────────────────────────────────
export interface RAGResponse {
  answer: string;
  sources: Evidence[];
  confidence: number;
  question_type: "static" | "dynamic";
  insufficient_evidence: boolean;
}

// ── Weather API ───────────────────────────────────────────────────
export type WeatherResponse = WeatherContext;

// ── API Error ─────────────────────────────────────────────────────
export interface ApiError {
  error: string;
  message: string;
  requestId: string;
  timestamp: string;
}

// ── Diagnosis form state ──────────────────────────────────────────
export interface DiagnosisFormValues {
  crop: string;
  location: string;
  growthStage: GrowthStage;
  symptoms: string;
  imageFile: File | null;
}
