export function FaceScanVisual() {
  const landmarks = [
    [50, 18],
    [34, 28],
    [66, 28],
    [28, 42],
    [72, 42],
    [38, 40],
    [62, 40],
    [50, 48],
    [50, 58],
    [32, 62],
    [68, 62],
    [40, 78],
    [60, 78],
    [50, 88],
  ];

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-line/10 bg-panel/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgb(var(--accent)/0.10),transparent_58%)]" />
      <svg viewBox="0 0 100 120" className="relative h-full w-full" role="img" aria-label="Stylized face analysis visualization">
        <defs>
          <linearGradient id="scan" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(var(--accent))" stopOpacity="0.45" />
            <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="58" rx="28" ry="36" fill="none" stroke="rgb(var(--line))" strokeOpacity="0.22" strokeWidth="0.6" />
        <ellipse cx="50" cy="58" rx="22" ry="30" fill="none" stroke="rgb(var(--accent))" strokeOpacity="0.35" strokeWidth="0.4" />
        <path d="M38 46c3 3 7 4 12 4s9-1 12-4" fill="none" stroke="rgb(var(--line))" strokeOpacity="0.25" strokeWidth="0.5" />
        <path d="M42 74c2.5 4 5.5 6 8 6s5.5-2 8-6" fill="none" stroke="rgb(var(--line))" strokeOpacity="0.25" strokeWidth="0.5" />
        {landmarks.map(([x, y], index) => (
          <circle
            key={`${x}-${y}-${index}`}
            cx={x}
            cy={y}
            r={index % 3 === 0 ? 0.9 : 0.55}
            fill="rgb(var(--accent))"
            className="animate-pulseSoft"
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
        <g className="origin-center motion-safe:animate-scan">
          <rect x="18" y="16" width="64" height="10" fill="url(#scan)" />
          <line x1="18" y1="21" x2="82" y2="21" stroke="rgb(var(--accent))" strokeOpacity="0.55" strokeWidth="0.35" />
        </g>
      </svg>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted">
        <span>Face mesh</span>
        <span>Visual scan</span>
      </div>
    </div>
  );
}
