export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] animate-pulse px-5 py-14 sm:px-10 lg:px-16">
      <div className="h-2 w-28 bg-ink/10" />
      <div className="mt-7 h-12 w-full max-w-xl bg-ink/10" />
      <div className="mt-4 h-12 w-4/5 max-w-lg bg-ink/10" />
      <div className="mt-14 grid gap-8 sm:grid-cols-2">
        <div className="h-36 border-t border-ink/10 bg-ink/[0.03]" />
        <div className="h-36 border-t border-ink/10 bg-ink/[0.03]" />
      </div>
      <div className="mt-12 space-y-4">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 border-b border-ink/10 bg-ink/[0.02]" />)}</div>
    </div>
  );
}
