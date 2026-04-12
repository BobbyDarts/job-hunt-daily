// /src/lib/chart-utils.ts

import type { ApplicationStatus } from "@/types";

/**
 * Maps each application status to a chart color using the shadcn chart CSS
 * variables. These resolve automatically in both light and dark mode.
 */
export const STATUS_CHART_COLORS: Record<ApplicationStatus, string> = {
  applied: "var(--chart-1)",
  interviewing: "var(--chart-2)",
  offer: "var(--chart-3)",
  accepted: "var(--chart-4)",
  rejected: "var(--chart-5)",
  withdrew: "var(--muted-foreground)",
};

/**
 * Returns the chart color for a given application status.
 *
 * @param status The application status
 * @returns A CSS color string compatible with Chart.js
 */
export function getStatusChartColor(status: ApplicationStatus): string {
  return STATUS_CHART_COLORS[status];
}

/**
 * Resolves a CSS variable string (e.g. `var(--chart-1)`) to its computed value.
 * Required for Chart.js which renders to canvas and cannot resolve CSS variables directly.
 *
 * @param variable CSS variable string, e.g. `var(--chart-1)`
 * @returns The resolved color value string
 */
export function resolveChartColor(variable: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable.replace("var(", "").replace(")", ""))
    .trim();
}
