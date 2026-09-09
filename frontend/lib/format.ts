export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function qualityLabel(level: string): string {
  if (level === "good") return "Good";
  if (level === "acceptable") return "Acceptable";
  return "Needs improvement";
}
