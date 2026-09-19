import { CheckCircle2, AlertTriangle, XCircle, Clock, ArrowUpCircle } from "lucide-react";
import type { SafetyDecision } from "@/types";

interface Props {
  decision: SafetyDecision;
  size?: number;
}

export default function SafetyDecisionIcon({ decision, size = 16 }: Props) {
  const props = { width: size, height: size };
  switch (decision) {
    case "ALLOW":    return <CheckCircle2  {...props} className="text-green-500" aria-label="Allowed" />;
    case "MODIFY":   return <AlertTriangle {...props} className="text-amber-500" aria-label="Modified" />;
    case "DEFER":    return <Clock         {...props} className="text-blue-500"  aria-label="Deferred" />;
    case "BLOCK":    return <XCircle       {...props} className="text-red-500"   aria-label="Blocked" />;
    case "ESCALATE": return <ArrowUpCircle {...props} className="text-purple-500" aria-label="Escalated" />;
    default:         return <AlertTriangle {...props} className="text-gray-400"  />;
  }
}
