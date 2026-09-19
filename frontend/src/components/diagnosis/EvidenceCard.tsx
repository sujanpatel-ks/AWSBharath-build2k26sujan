import { BookOpen, ExternalLink } from "lucide-react";
import type { Evidence } from "@/types";

interface Props {
  evidence: Evidence;
}

export default function EvidenceCard({ evidence }: Props) {
  const scorePercent = Math.round(evidence.score * 100);

  return (
    <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-3 space-y-2">
      {/* Source header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-agro-600 flex-shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold text-agro-700 truncate">{evidence.source}</span>
        </div>
        {scorePercent > 0 && (
          <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">
            {scorePercent}% match
          </span>
        )}
      </div>

      {/* Snippet */}
      {evidence.text && (
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
          {evidence.text}
        </p>
      )}
    </div>
  );
}
