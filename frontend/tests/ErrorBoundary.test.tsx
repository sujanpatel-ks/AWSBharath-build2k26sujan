import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// Component that always throws
function BombComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test explosion");
  return <p>All good</p>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders fallback UI on error", () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/Test explosion/)).toBeInTheDocument();
  });

  it("shows a reload button on error", () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
  });

  it("renders custom fallback if provided", () => {
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  });
});
