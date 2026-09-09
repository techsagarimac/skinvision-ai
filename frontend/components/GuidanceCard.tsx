export function GuidanceCard({ items }: { items: string[] }) {
  return (
    <section className="glass-panel p-6">
      <p className="eyebrow">General guidance</p>
      <h3 className="mt-2 font-display text-xl font-semibold">Conservative skincare notes</h3>
      <p className="mt-1 text-xs text-muted">
        These suggestions are general and educational. They are not treatment instructions or a prescription.
      </p>
      <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
