import clsx from "clsx";
import type { RiskLevel } from "@/types";

interface Props {
  level: RiskLevel;
  size?: "xs" | "sm" | "md";
}

const CONFIG: Record<RiskLevel, { label: string; classes: string }> = {
  LOW:      { label: "Low Risk",      classes: "bg-green-100 text-green-700 ring-green-200" },
  MEDIUM:   { label: "Medium Risk",   classes: "bg-amber-100 text-amber-700 ring-amber-200" },
  HIGH:     { label: "High Risk",     classes: "bg-red-100 text-red-700 ring-red-200" },
  CRITICAL: { label: "Critical Risk", classes: "bg-red-900 text-red-100 ring-red-800" },
};

const SIZE: Record<"xs" | "sm" | "md", string> = {
  xs: "px-1.5 py-0.5 text-[10px] font-semibold",
  sm: "px-2 py-1 text-xs font-semibold",
  md: "px-2.5 py-1 text-sm font-semibold",
};

export default function RiskBadge({ level, size = "sm" }: Props) {
  const { label, classes } = CONFIG[level] ?? CONFIG.MEDIUM;
  return (
    <span
      className={clsx("inline-flex items-center rounded-full ring-1", SIZE[size], classes)}
      aria-label={label}
    >
      {level}
    </span>
  );
}
