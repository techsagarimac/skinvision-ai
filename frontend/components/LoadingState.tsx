interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Working…" }: LoadingStateProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted" role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line/20 border-t-accent" />
      <span>{label}</span>
    </div>
  );
}
