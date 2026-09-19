import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SafetyBanner from "@/components/diagnosis/SafetyBanner";

describe("SafetyBanner", () => {
  it("renders ALLOW decision", () => {
    render(<SafetyBanner decision="ALLOW" reason="All checks passed." />);
    expect(screen.getByText("Safe to proceed")).toBeInTheDocument();
    expect(screen.getByText("All checks passed.")).toBeInTheDocument();
  });

  it("renders DEFER decision with modified action", () => {
    render(
      <SafetyBanner
        decision="DEFER"
        reason="Rain expected soon."
        modifiedAction="Wait 6 hours before spraying."
      />
    );
    expect(screen.getByText("Action deferred")).toBeInTheDocument();
    expect(screen.getByText(/Wait 6 hours/)).toBeInTheDocument();
  });

  it("renders BLOCK decision", () => {
    render(<SafetyBanner decision="BLOCK" reason="Missing crop context." />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Cannot recommend")).toBeInTheDocument();
  });

  it("renders ESCALATE decision", () => {
    render(<SafetyBanner decision="ESCALATE" reason="Conflicting evidence." />);
    expect(screen.getByText("Expert review needed")).toBeInTheDocument();
  });

  it("renders MODIFY decision", () => {
    render(<SafetyBanner decision="MODIFY" reason="High risk condition." />);
    expect(screen.getByText("Recommendation modified")).toBeInTheDocument();
  });

  it("has role=alert for accessibility", () => {
    render(<SafetyBanner decision="ALLOW" reason="OK" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
