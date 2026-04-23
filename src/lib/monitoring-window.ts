export type MonitoringWindow = "24h" | "7d" | "30d" | "90d";

export const MONITORING_WINDOW_OPTIONS: Array<{ value: MonitoringWindow; label: string; helper: string }> = [
  { value: "24h", label: "Last 24h", helper: "Tight breaking-news scan" },
  { value: "7d", label: "Last 7d", helper: "Default weekly monitoring" },
  { value: "30d", label: "Last 30d", helper: "Broader narrative watch" },
  { value: "90d", label: "Last 90d", helper: "Long-tail issue tracking" },
];

const WINDOW_HOURS: Record<MonitoringWindow, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
  "90d": 24 * 90,
};

export function isMonitoringWindow(value: string | null): value is MonitoringWindow {
  return value !== null && value in WINDOW_HOURS;
}

export function getMonitoringWindowStart(window: MonitoringWindow) {
  return new Date(Date.now() - WINDOW_HOURS[window] * 60 * 60 * 1000).toISOString();
}

export function formatMonitoringWindow(window: MonitoringWindow) {
  return MONITORING_WINDOW_OPTIONS.find((option) => option.value === window)?.label ?? window;
}

export function getMoreRecentWindowStart(...starts: Array<string | null | undefined>) {
  const valid = starts.filter(Boolean).map((value) => new Date(value as string).getTime());
  if (valid.length === 0) return new Date(0).toISOString();
  return new Date(Math.max(...valid)).toISOString();
}