import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EvidenceCard from "@/components/diagnosis/EvidenceCard";

describe("EvidenceCard", () => {
  it("renders source name", () => {
    render(<EvidenceCard evidence={{ source: "Arecanut Disease Guide", text: "Snippet", score: 0.89 }} />);
    expect(screen.getByText("Arecanut Disease Guide")).toBeInTheDocument();
  });

  it("renders evidence text snippet", () => {
    render(<EvidenceCard evidence={{ source: "Guide", text: "Yellow leaf disease text", score: 0.75 }} />);
    expect(screen.getByText("Yellow leaf disease text")).toBeInTheDocument();
  });

  it("shows match percentage", () => {
    render(<EvidenceCard evidence={{ source: "Guide", text: "Text", score: 0.82 }} />);
    expect(screen.getByText("82% match")).toBeInTheDocument();
  });

  it("hides match percentage when score is 0", () => {
    render(<EvidenceCard evidence={{ source: "Guide", text: "Text", score: 0 }} />);
    expect(screen.queryByText(/% match/)).not.toBeInTheDocument();
  });
});
