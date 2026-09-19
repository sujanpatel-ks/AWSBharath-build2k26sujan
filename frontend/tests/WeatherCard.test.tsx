import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WeatherCard from "@/components/diagnosis/WeatherCard";
import type { WeatherContext } from "@/types";

const safeWeather: WeatherContext = {
  summary: "28°C, 65% humidity, Partly cloudy",
  spray_window_safe: true,
  rain_expected_hours: null,
  temperature_celsius: 28,
  humidity_percent: 65,
  advisory: "Conditions appear suitable for field operations.",
};

const unsafeWeather: WeatherContext = {
  summary: "26°C, 88% humidity, Rain expected",
  spray_window_safe: false,
  rain_expected_hours: 3,
  temperature_celsius: 26,
  humidity_percent: 88,
  advisory: "Rain expected in approximately 3 hours — avoid spraying.",
};

describe("WeatherCard", () => {
  it("renders summary text", () => {
    render(<WeatherCard weather={safeWeather} />);
    expect(screen.getByText(safeWeather.summary)).toBeInTheDocument();
  });

  it("shows suitable indicator when spray is safe", () => {
    render(<WeatherCard weather={safeWeather} />);
    expect(screen.getAllByText(/Suitable for field operations/i).length).toBeGreaterThan(0);
  });

  it("shows warning when spray is unsafe", () => {
    render(<WeatherCard weather={unsafeWeather} />);
    expect(screen.getByText(/Unfavourable conditions/i)).toBeInTheDocument();
  });

  it("shows rain hours when available", () => {
    render(<WeatherCard weather={unsafeWeather} />);
    expect(screen.getByText(/Rain in ~3h/)).toBeInTheDocument();
  });

  it("shows advisory text", () => {
    render(<WeatherCard weather={unsafeWeather} />);
    expect(screen.getByText(/avoid spraying/i)).toBeInTheDocument();
  });

  it("hides stats when compact=true", () => {
    render(<WeatherCard weather={unsafeWeather} compact={true} />);
    expect(screen.queryByText(/Rain in ~3h/)).not.toBeInTheDocument();
  });
});


