import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Camera,
  CloudSun,
  Leaf,
  Scan,
  Sprout,
  Wind,
} from "lucide-react";
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
  const { history, isLoading: historyLoading } = useDiagnosisHistory(3);
  const farmerName = profile?.name || user?.username || "Farmer";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="agro-eyebrow mb-2">Welcome back</p>
          <h1 className="font-display text-3xl font-black tracking-tight text-[#191c1d]">
            {farmerName} <span className="text-[#2b6954]">↗</span>
          </h1>
          <p className="mt-1 text-sm font-medium text-[#707974]">
            {profile?.location || "Your farm intelligence workspace"}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#bfc9c3]/50 bg-white text-[#003527] shadow-sm">
          <Sprout className="h-6 w-6" />
        </div>
      </header>

      <section className="relative mb-6 overflow-hidden rounded-[32px] bg-[#003527] p-6 text-white shadow-[0_22px_45px_rgba(0,53,39,0.24)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[22px] border-[#80bea6]/15" />
        <div className="pointer-events-none absolute -bottom-24 -right-4 h-48 w-48 rounded-full bg-[#2b6954]/40 blur-2xl" />
        <div className="relative z-10 max-w-md">
          <div className="mb-5 flex items-center gap-2 text-[#b0f0d6]">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]">Offline ready</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#b0f0d6]" />
            <span className="text-xs font-semibold text-white/70">AI crop health</span>
          </div>
          <h2 className="font-display text-3xl font-black leading-tight sm:text-4xl">
            See what your crop is telling you.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#b0f0d6]/80">
            Capture a leaf, get a clear diagnosis, and turn the result into a safer treatment plan.
          </p>
          <button
            onClick={() => navigate("/diagnosis")}
            className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-[#003527] shadow-xl transition hover:bg-[#b0f0d6]"
          >
            <Scan className="h-5 w-5" />
            Start a crop scan
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3">
        <button onClick={() => navigate("/diagnosis")} className="group rounded-[26px] border border-[#bfc9c3]/50 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b0f0d6]/45 text-[#003527]"><Camera className="h-5 w-5" /></span>
          <p className="font-display text-lg font-black text-[#191c1d]">Scan leaf</p>
          <p className="mt-1 text-xs font-medium text-[#707974]">Instant crop check</p>
        </button>
        <button onClick={() => navigate("/assistant")} className="group rounded-[26px] border border-[#bfc9c3]/50 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffdbcc]/55 text-[#944a23]"><BookOpen className="h-5 w-5" /></span>
          <p className="font-display text-lg font-black text-[#191c1d]">Ask AgroCare</p>
          <p className="mt-1 text-xs font-medium text-[#707974]">Practical advisory</p>
        </button>
      </section>

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <div><p className="agro-eyebrow">Farm conditions</p><h2 className="mt-1 font-display text-xl font-black text-[#191c1d]">Today’s field signal</h2></div>
          <CloudSun className="h-6 w-6 text-[#2b6954]" />
        </div>
        {weatherLoading ? (
          <div className="card flex h-28 items-center justify-center"><LoadingSpinner size="sm" /></div>
        ) : weather ? (
          <WeatherCard weather={weather} />
        ) : (
          <div className="card flex items-center gap-3 text-sm text-[#707974]"><Wind className="h-5 w-5 text-[#2b6954]" />Set your farm location to see local weather.</div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <div><p className="agro-eyebrow">Your field notes</p><h2 className="mt-1 font-display text-xl font-black text-[#191c1d]">Recent diagnoses</h2></div>
          <button onClick={() => navigate("/history")} className="text-xs font-black uppercase tracking-widest text-[#2b6954]">See all</button>
        </div>
        {historyLoading ? (
          <div className="space-y-3"><div className="card h-20 animate-pulse bg-[#edeeef]" /><div className="card h-20 animate-pulse bg-[#edeeef]" /></div>
        ) : history.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 py-8 text-center"><Leaf className="h-10 w-10 text-[#b0f0d6]" /><p className="font-bold text-[#404944]">No diagnoses yet</p><p className="text-xs text-[#707974]">Your first scan will appear here.</p></div>
        ) : (
          <div className="space-y-3">{history.map((diagnosis) => <DiagnosisCard key={diagnosis.diagnosisId} diagnosis={diagnosis} onClick={() => navigate(`/diagnosis/${diagnosis.diagnosisId}/result`)} />)}</div>
        )}
      </section>
    </div>
  );
}

function DiagnosisCard({ diagnosis, onClick }: { diagnosis: DiagnosisSummary; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card flex w-full items-center gap-3 text-left transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#b0f0d6]/45 text-[#003527]"><Leaf className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-black text-[#191c1d]">{diagnosis.crop}</p><RiskBadge level={diagnosis.riskLevel} size="xs" /></div><p className="truncate text-xs font-medium text-[#707974]">{diagnosis.possibleCondition}</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#bfc9c3]">{formatDate(diagnosis.createdAt)}</p></div>
      <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-[#2b6954]" />
    </button>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
