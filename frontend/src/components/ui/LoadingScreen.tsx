import { Leaf } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

export default function LoadingScreen({ message = "Loading…" }: { message?: string }) {
  return (
    <div
      role="status"
      aria-label={message}
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50"
    >
      <div className="w-16 h-16 rounded-2xl bg-agro-600 flex items-center justify-center shadow-lg">
        <Leaf className="w-9 h-9 text-white" />
      </div>
      <LoadingSpinner size="md" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
