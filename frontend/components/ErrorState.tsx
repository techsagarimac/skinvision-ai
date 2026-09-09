interface ErrorStateProps {
  title?: string;
  message: string;
  details?: string[];
  onRetry?: () => void;
}

export function ErrorState({
  title = "We could not finish that step",
  message,
  details = [],
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4" role="alert">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted">{message}</p>
      {details.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          {details.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {onRetry ? (
        <button type="button" className="btn-secondary mt-3" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
