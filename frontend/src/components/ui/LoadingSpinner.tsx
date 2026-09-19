import clsx from "clsx";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };

export default function LoadingSpinner({ size = "md", className }: Props) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx(
        "inline-block border-2 border-agro-600 border-t-transparent rounded-full animate-spin",
        SIZES[size],
        className
      )}
    />
  );
}
