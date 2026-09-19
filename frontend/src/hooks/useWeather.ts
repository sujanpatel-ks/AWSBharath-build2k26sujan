import { useQuery } from "react-query";
import { getWeatherByLocation } from "@/api/client";
import type { WeatherResponse } from "@/types";

// Location name → weather context (cached 30 min)
export function useWeather(location: string | undefined) {
  const { data, isLoading, error } = useQuery<WeatherResponse>(
    ["weather", location],
    () => getWeatherByLocation(location!),
    {
      enabled: !!location,
      staleTime: 30 * 60 * 1000,
      retry: 1,
    }
  );
  return { weather: data, isLoading, error };
}
