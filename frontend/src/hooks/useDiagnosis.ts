import { useState } from "react";
import { useQuery } from "react-query";
import { getDiagnosis, getDiagnosisHistory } from "@/api/client";
import type { DiagnosisResponse, DiagnosisSummary } from "@/types";

// ── Single diagnosis ───────────────────────────────────────────────
export function useDiagnosis(id: string | undefined) {
  const { data, isLoading, error } = useQuery<DiagnosisResponse>(
    ["diagnosis", id],
    () => getDiagnosis(id!),
    { enabled: !!id, staleTime: 10 * 60 * 1000 }
  );
  return { diagnosis: data, isLoading, error };
}

// ── Diagnosis history with manual pagination ──────────────────────
export function useDiagnosisHistory(pageSize = 20) {
  const [allItems, setAllItems] = useState<DiagnosisSummary[]>([]);
  const [nextKey, setNextKey] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { isLoading, error } = useQuery(
    ["diagnosis-history", pageSize],
    () => getDiagnosisHistory(pageSize),
    {
      staleTime: 2 * 60 * 1000,
      onSuccess(data) {
        setAllItems(data.diagnoses);
        setNextKey(data.nextKey ?? undefined);
      },
    }
  );

  async function loadMore() {
    if (!nextKey || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const more = await getDiagnosisHistory(pageSize, nextKey);
      setAllItems((prev) => [...prev, ...more.diagnoses]);
      setNextKey(more.nextKey ?? undefined);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return {
    history: allItems,
    isLoading,
    error,
    hasMore: !!nextKey,
    loadMore,
    isLoadingMore,
  };
}
