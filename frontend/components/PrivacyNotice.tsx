export function PrivacyNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs leading-relaxed text-muted">
        Images are analyzed for this request and are not saved permanently by default. Face recognition is
        not performed.
      </p>
    );
  }

  return (
    <div className="glass-panel p-6">
      <p className="eyebrow">Privacy</p>
      <h3 className="mt-2 font-display text-xl font-semibold">Your image stays in your control</h3>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
        <li>Images are analyzed only for the requested visual analysis.</li>
        <li>Images are not saved permanently by default.</li>
        <li>Face recognition is not performed and identity is not inferred.</li>
        <li>You choose whether to save analysis statistics such as spot counts.</li>
      </ul>
    </div>
  );
}
