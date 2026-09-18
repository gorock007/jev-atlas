"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 sm:px-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Research view unavailable</p>
      <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-ink">This page could not read the local artifacts.</h1>
      <p className="mt-5 max-w-xl text-sm leading-6 text-muted">Confirm the research pipeline has generated its outputs, then try loading the page again.</p>
      <button type="button" onClick={reset} className="mt-8 bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5 active:translate-y-px">Try again</button>
    </div>
  );
}
