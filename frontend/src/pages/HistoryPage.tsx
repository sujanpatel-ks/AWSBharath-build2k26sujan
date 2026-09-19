import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, ChevronRight, Search, Filter } from "lucide-react";
import { useDiagnosisHistory } from "@/hooks/useDiagnosis";
import RiskBadge from "@/components/ui/RiskBadge";
import SafetyDecisionIcon from "@/components/ui/SafetyDecisionIcon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { RiskLevel } from "@/types";

type FilterLevel = RiskLevel | "ALL";

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, isLoading, loadMore, hasMore, isLoadingMore } = useDiagnosisHistory(20);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterLevel>("ALL");

  const filtered = history.filter((d) => {
    const matchSearch =
      !search ||
      d.crop.toLowerCase().includes(search.toLowerCase()) ||
      d.possibleCondition.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || d.riskLevel === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-8 sm:px-6">
      <div className="mb-6">
        <p className="agro-eyebrow mb-2">Field notes</p>
        <h1 className="page-header text-3xl">Diagnosis History</h1>
        <p className="page-subheader mt-1">Every crop scan, treatment signal, and safety decision.</p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="field-input pl-9" placeholder="Search crop or condition…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Risk filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as FilterLevel[]).map((level) => (
          <button key={level}
            onClick={() => setFilter(level)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              filter === level
                ? "bg-agro-600 text-white border-agro-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-agro-400"
            }`}>
            {level === "ALL" ? (
              <><Filter className="w-3 h-3 inline mr-1" />All</>
            ) : level}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <Leaf className="w-14 h-14 text-agro-200" />
          <p className="text-gray-600 font-medium">
            {search || filter !== "ALL" ? "No matching diagnoses" : "No diagnoses yet"}
          </p>
          <p className="text-sm text-gray-400">
            {search || filter !== "ALL"
              ? "Try a different search or filter"
              : "Scan your first crop to see history here"}
          </p>
          {!search && filter === "ALL" && (
            <button className="btn-primary mt-2" onClick={() => navigate("/diagnosis")}>
              <Leaf className="w-4 h-4" /> Scan Crop
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <button key={d.diagnosisId}
              onClick={() => navigate(`/diagnosis/${d.diagnosisId}/result`)}
              className="card w-full flex items-center gap-3 hover:ring-2 hover:ring-agro-200 transition-all text-left">
              <div className="w-11 h-11 rounded-xl bg-agro-100 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5 text-agro-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-gray-900 truncate">{d.crop}</span>
                  <RiskBadge level={d.riskLevel} size="xs" />
                </div>
                <p className="text-xs text-gray-600 truncate">{d.possibleCondition}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-400">{formatDate(d.createdAt)}</p>
                  {d.location && <span className="text-xs text-gray-300">·</span>}
                  {d.location && <p className="text-xs text-gray-400 truncate">{d.location}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <SafetyDecisionIcon decision={d.safetyDecision} />
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </button>
          ))}

          {hasMore && (
            <button className="btn-secondary w-full" onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? <LoadingSpinner size="sm" /> : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

