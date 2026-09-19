import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import LoadingScreen from "@/components/ui/LoadingScreen";

describe("LoadingSpinner", () => {
  it("renders with accessible role", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });
});

describe("LoadingScreen", () => {
  it("renders the message", () => {
    render(<LoadingScreen message="Fetching diagnosis…" />);
    expect(screen.getByText("Fetching diagnosis…")).toBeInTheDocument();
  });

  it("renders default message", () => {
    render(<LoadingScreen />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});
