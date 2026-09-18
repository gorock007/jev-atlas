import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 sm:px-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Not in the index</p>
      <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-ink">That research artifact does not exist.</h1>
      <p className="mt-5 text-sm leading-6 text-muted">Return to the library to browse the generated documents.</p>
      <Link href="/library" className="mt-8 inline-flex bg-ink px-5 py-3 text-sm font-medium text-paper active:translate-y-px">Open the library</Link>
    </div>
  );
}
