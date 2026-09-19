import { useNavigate } from "react-router-dom";
import { Scan, Clock, CloudSun, BookOpen, AlertTriangle, ChevronRight, Leaf } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useWeather } from "@/hooks/useWeather";
import { useDiagnosisHistory } from "@/hooks/useDiagnosis";
import WeatherCard from "@/components/diagnosis/WeatherCard";
import RiskBadge from "@/components/ui/RiskBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { DiagnosisSummary } from "@/types";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { weather, isLoading: weatherLoading } = useWeather(profile?.location);
  const { history, isLoading: historyLoading } = useDiagnosisHistory(5);

  const greeting = getGreeting();
  const farmerName = profile?.name || user?.username || "Farmer";

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header greeting */}
      <div className="px-4 pt-6 pb-4">
        <p className="text-sm text-gray-500">{greeting}</p>
        <h1 className="text-2xl font-bold text-gray-900">{farmerName} 👋</h1>
        {profile?.location && (
          <p className="text-sm text-gray-400 mt-0.5">{profile.location}</p>
        )}
      </div>

      {/* Primary CTA */}
      <div className="px-4 mb-6">
        <button
          onClick={() => navigate("/diagnosis")}
          className="w-full bg-agro-600 hover:bg-agro-700 active:bg-agro-800 text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg transition-colors"
          aria-label="Scan your crop"
        >
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Scan className="w-7 h-7" />
          </div>
          <div className="text-left">
            <p className="font-bold text-lg leading-tight">Scan Your Crop</p>
            <p className="text-agro-100 text-sm mt-0.5">Upload a photo for AI diagnosis</p>
          </div>
          <ChevronRight className="w-5 h-5 ml-auto opacity-70" />
        </button>
      </div>

      {/* Weather card */}
      <section className="px-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
          <CloudSun className="w-4 h-4" /> Weather
        </h2>
        {weatherLoading ? (
          <div className="card flex items-center justify-center h-24">
            <LoadingSpinner size="sm" />
          </div>
        ) : weather ? (
          <WeatherCard weather={weather} />
        ) : (
          <div className="card text-sm text-gray-400 text-center py-4">
            Set your location in Profile to see weather
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="px-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction icon={<BookOpen className="w-5 h-5" />} label="Ask Advisory" sub="Get farming answers"
            color="bg-blue-50 text-blue-700" onClick={() => navigate("/assistant")} />
          <QuickAction icon={<Clock className="w-5 h-5" />} label="My History" sub="Past diagnoses"
            color="bg-earth-50 text-earth-700" onClick={() => navigate("/history")} />
        </div>
      </section>

      {/* Recent diagnoses */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Diagnoses</h2>
          <button onClick={() => navigate("/history")} className="text-xs text-agro-600 font-medium">
            See all
          </button>
        </div>

        {historyLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="card h-20 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="card flex flex-col items-center py-8 gap-2 text-center">
            <Leaf className="w-10 h-10 text-agro-200" />
            <p className="text-sm font-medium text-gray-600">No diagnoses yet</p>
            <p className="text-xs text-gray-400">Scan your first crop to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((d) => (
              <DiagnosisCard key={d.diagnosisId} diagnosis={d}
                onClick={() => navigate(`/diagnosis/${d.diagnosisId}/result`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function QuickAction({
  icon, label, sub, color, onClick,
}: { icon: React.ReactNode; label: string; sub: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="card flex flex-col items-start gap-2 p-4 hover:ring-2 hover:ring-agro-300 transition-all text-left">
      <span className={`p-2 rounded-lg ${color}`}>{icon}</span>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </button>
  );
}

function DiagnosisCard({ diagnosis, onClick }: { diagnosis: DiagnosisSummary; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="card w-full flex items-center gap-3 hover:ring-2 hover:ring-agro-200 transition-all text-left">
      <div className="w-10 h-10 rounded-lg bg-agro-100 flex items-center justify-center flex-shrink-0">
        <Leaf className="w-5 h-5 text-agro-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{diagnosis.crop}</p>
          <RiskBadge level={diagnosis.riskLevel} size="xs" />
        </div>
        <p className="text-xs text-gray-500 truncate">{diagnosis.possibleCondition}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(diagnosis.createdAt)}</p>
      </div>
      {diagnosis.safetyDecision === "ESCALATE" && (
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
      )}
      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </button>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
