import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-sm font-semibold tracking-[0.16em]">SKINVISION AI</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Visual analysis of visible skin spots. Not a medical diagnostic system.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/analyze" className="text-muted hover:text-ink">
            Analyze
          </Link>
          <Link href="/history" className="text-muted hover:text-ink">
            History
          </Link>
          <Link href="/privacy" className="text-muted hover:text-ink">
            Privacy
          </Link>
          <a href="#how-it-works" className="text-muted hover:text-ink">
            How it works
          </a>
        </div>
      </div>
      <div className="border-t border-line/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted sm:px-6">
          For persistent, painful, severe, rapidly changing, or concerning symptoms, consult a qualified
          dermatologist.
        </p>
      </div>
    </footer>
  );
}
