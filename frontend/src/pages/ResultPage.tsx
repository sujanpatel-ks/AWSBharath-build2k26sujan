import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, ArrowUpCircle,
  ChevronDown, ChevronUp, BookOpen, CloudSun, ShieldCheck, Leaf, Share2
} from "lucide-react";
import toast from "react-hot-toast";
import { getDiagnosis } from "@/api/client";
import LoadingScreen from "@/components/ui/LoadingScreen";
import RiskBadge from "@/components/ui/RiskBadge";
import SafetyBanner from "@/components/diagnosis/SafetyBanner";
import EvidenceCard from "@/components/diagnosis/EvidenceCard";
import WeatherCard from "@/components/diagnosis/WeatherCard";
import type { DiagnosisResponse } from "@/types";

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<DiagnosisResponse | null>(
    (location.state as { result?: DiagnosisResponse })?.result ?? null
  );
  const [loading, setLoading] = useState(!result);
  const [expandEvidence, setExpandEvidence] = useState(false);
  const [expandActions, setExpandActions] = useState(true);

  useEffect(() => {
    if (!result && id) {
      getDiagnosis(id)
        .then(setResult)
        .catch(() => toast.error("Could not load diagnosis"))
        .finally(() => setLoading(false));
    }
  }, [id, result]);

  if (loading) return <LoadingScreen message="Loading diagnosis…" />;
  if (!result)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-600 text-center">Diagnosis not found.</p>
        <button className="btn-primary" onClick={() => navigate("/history")}>Back to History</button>
      </div>
    );

  const confidencePct = Math.round(result.confidence * 100);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">{formatDate(result.created_at)}</p>
          <h1 className="page-header">{result.crop} Diagnosis</h1>
          <p className="text-sm text-gray-500">{result.possible_condition}</p>
        </div>
      </div>

      {/* Condition card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Detected Condition</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{result.possible_condition}</p>
          </div>
          <RiskBadge level={result.risk_level} size="md" />
        </div>

        {/* Confidence bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>AI Confidence</span>
            <span className="font-semibold">{confidencePct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${confidencePct}%`,
                backgroundColor: confidencePct >= 70 ? "#22c55e" : confidencePct >= 40 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* Observations */}
        {result.observations.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Observations</p>
            <ul className="space-y-1.5">
              {result.observations.map((obs, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-agro-500 flex-shrink-0" />
                  {obs}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Safety banner — always visible */}
      <SafetyBanner decision={result.safety_status} reason={result.safety_reason}
        modifiedAction={result.recommendation?.action_plan[0]} />

      {/* Weather */}
      {result.weather_context && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
            <CloudSun className="w-3.5 h-3.5" /> Weather Context
          </p>
          <WeatherCard weather={result.weather_context} />
        </div>
      )}

      {/* Recommendation */}
      {result.recommendation && (
        <div className="card space-y-4">
          <button className="w-full flex items-center justify-between"
            onClick={() => setExpandActions(!expandActions)} aria-expanded={expandActions}>
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-agro-600" /> Recommended Actions
            </p>
            {expandActions ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {expandActions && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">{result.recommendation.summary}</p>

              {result.recommendation.action_plan.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">What to do now</p>
                  <ol className="space-y-2">
                    {result.recommendation.action_plan.map((action, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-800">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-agro-100 text-agro-700 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {result.recommendation.dosage_instructions && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Dosage</p>
                  <p className="text-sm text-amber-800">{result.recommendation.dosage_instructions}</p>
                </div>
              )}

              {result.recommendation.timing_instructions && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Timing</p>
                  <p className="text-sm text-gray-700">{result.recommendation.timing_instructions}</p>
                </div>
              )}

              {result.recommendation.precautions.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Precautions
                  </p>
                  <ul className="space-y-1">
                    {result.recommendation.precautions.map((p, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendation.follow_up_days && (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <Clock className="w-4 h-4" />
                  <span>Check again in <strong>{result.recommendation.follow_up_days} days</strong></span>
                </div>
              )}

              {result.needs_expert_review && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2.5 text-sm text-blue-700">
                  <ArrowUpCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Consult your local agricultural extension officer for expert review</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Evidence */}
      {result.evidence.length > 0 && (
        <div>
          <button className="w-full flex items-center justify-between py-1"
            onClick={() => setExpandEvidence(!expandEvidence)} aria-expanded={expandEvidence}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Evidence & Sources ({result.evidence.length})
            </p>
            {expandEvidence ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {expandEvidence && (
            <div className="mt-2 space-y-2">
              {result.evidence.map((e, i) => <EvidenceCard key={i} evidence={e} />)}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={() => navigate("/diagnosis")}>
          <Leaf className="w-4 h-4" /> New Scan
        </button>
        <button className="btn-secondary flex-1" onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          toast.success("Link copied");
        }}>
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
