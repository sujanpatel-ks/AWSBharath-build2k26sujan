import { CheckCircle2, AlertTriangle, XCircle, Clock, ArrowUpCircle } from "lucide-react";
import clsx from "clsx";
import type { SafetyDecision } from "@/types";

interface Props {
  decision: SafetyDecision;
  reason: string;
  modifiedAction?: string | null;
}

const CONFIG: Record<SafetyDecision, {
  Icon: typeof CheckCircle2;
  title: string;
  bg: string;
  border: string;
  text: string;
  iconColor: string;
}> = {
  ALLOW: {
    Icon: CheckCircle2,
    title: "Safe to proceed",
    bg: "bg-green-50", border: "border-green-200", text: "text-green-800", iconColor: "text-green-500",
  },
  MODIFY: {
    Icon: AlertTriangle,
    title: "Recommendation modified",
    bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", iconColor: "text-amber-500",
  },
  DEFER: {
    Icon: Clock,
    title: "Action deferred",
    bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", iconColor: "text-blue-500",
  },
  BLOCK: {
    Icon: XCircle,
    title: "Cannot recommend",
    bg: "bg-red-50", border: "border-red-200", text: "text-red-800", iconColor: "text-red-500",
  },
  ESCALATE: {
    Icon: ArrowUpCircle,
    title: "Expert review needed",
    bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", iconColor: "text-purple-500",
  },
};

export default function SafetyBanner({ decision, reason, modifiedAction }: Props) {
  const cfg = CONFIG[decision] ?? CONFIG.MODIFY;
  const { Icon } = cfg;

  return (
    <div
      role="alert"
      className={clsx(
        "rounded-xl border p-4 flex gap-3",
        cfg.bg, cfg.border
      )}
    >
      <Icon className={clsx("w-5 h-5 mt-0.5 flex-shrink-0", cfg.iconColor)} aria-hidden="true" />
      <div className="flex-1 min-w-0 space-y-1">
        <p className={clsx("text-sm font-semibold", cfg.text)}>{cfg.title}</p>
        <p className={clsx("text-sm leading-relaxed", cfg.text, "opacity-90")}>{reason}</p>
        {modifiedAction && decision === "DEFER" && (
          <div className={clsx("mt-2 text-xs rounded-lg bg-white/60 p-2.5 leading-relaxed", cfg.text)}>
            <span className="font-medium">Revised action: </span>{modifiedAction}
          </div>
        )}
      </div>
    </div>
  );
}
