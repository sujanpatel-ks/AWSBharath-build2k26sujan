import { useQuery, useMutation, useQueryClient } from "react-query";
import { getProfile, updateProfile } from "@/api/client";
import type { FarmerProfile } from "@/types";
import toast from "react-hot-toast";

export function useProfile() {
  const qc = useQueryClient();

  const { data: profile, isLoading, error } = useQuery<FarmerProfile>(
    ["profile"],
    getProfile,
    { staleTime: 10 * 60 * 1000, retry: 1 }
  );

  const mutation = useMutation(
    (updates: Partial<FarmerProfile>) => updateProfile(updates),
    {
      onSuccess(updated) {
        qc.setQueryData(["profile"], updated);
        toast.success("Profile updated");
      },
      onError() {
        toast.error("Failed to update profile");
      },
    }
  );

  return {
    profile,
    isLoading,
    error,
    updateProfile: mutation.mutate,
    isUpdating: mutation.isLoading,
  };
}
