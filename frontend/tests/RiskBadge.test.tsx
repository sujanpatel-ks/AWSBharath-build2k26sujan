import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RiskBadge from "@/components/ui/RiskBadge";

describe("RiskBadge", () => {
  it("renders LOW with correct label", () => {
    render(<RiskBadge level="LOW" />);
    expect(screen.getByText("LOW")).toBeInTheDocument();
    expect(screen.getByLabelText("Low Risk")).toBeInTheDocument();
  });

  it("renders CRITICAL with correct label", () => {
    render(<RiskBadge level="CRITICAL" />);
    expect(screen.getByLabelText("Critical Risk")).toBeInTheDocument();
  });

  it("renders all four risk levels without crashing", () => {
    const { unmount } = render(
      <>
        <RiskBadge level="LOW" />
        <RiskBadge level="MEDIUM" />
        <RiskBadge level="HIGH" />
        <RiskBadge level="CRITICAL" />
      </>
    );
    expect(screen.getByText("LOW")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
    unmount();
  });

  it("applies xs size class", () => {
    render(<RiskBadge level="MEDIUM" size="xs" />);
    const badge = screen.getByText("MEDIUM");
    expect(badge.className).toMatch(/text-\[10px\]/);
  });
});
