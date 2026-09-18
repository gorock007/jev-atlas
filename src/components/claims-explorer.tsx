"use client";

import { ArrowRightIcon, ArrowSquareOutIcon, CaretDownIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { knowledgeSlug } from "@/knowledge/paths";
import { safeHref } from "@/lib/format";
import type { ClaimStatus, ResearchClaim } from "@/types";

const ORDER: ClaimStatus[] = ["Demonstrated", "Plausible", "Vendor Claim", "Speculative", "Disputed"];

function statusClass(status: ClaimStatus): string {
  if (status === "Demonstrated") return "bg-ink text-paper";
  if (status === "Vendor Claim") return "border border-accent/35 bg-accent-soft/55 text-[#7a3b23]";
  if (status === "Disputed") return "border border-ink/20 bg-shell text-ink";
  return "border border-ink/15 bg-paper text-muted";
}

export function ClaimsExplorer({ claims }: { claims: ResearchClaim[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ClaimStatus | "All">("All");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return claims.filter((claim) => (status === "All" || claim.status === status) && (!needle || `${claim.claim} ${claim.evidence} ${claim.counterarguments} ${claim.openQuestions}`.toLocaleLowerCase().includes(needle)));
  }, [claims, query, status]);

  return (
    <div className="py-8">
      <div className="flex flex-col gap-4 border-b border-ink/15 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["All", ...ORDER] as const).map((item) => {
            const count = item === "All" ? claims.length : claims.filter((claim) => claim.status === item).length;
            if (item !== "All" && count === 0) return null;
            return (
              <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-full px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${status === item ? "bg-ink text-paper" : "border border-ink/15 text-muted hover:border-ink/35 hover:text-ink"}`}>
                {item} <span className="ml-1 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
        <label className="flex min-w-0 items-center gap-2 border-b border-ink/30 px-1 py-2 focus-within:border-accent lg:w-72">
          <MagnifyingGlassIcon size={16} className="shrink-0 text-muted" />
          <span className="sr-only">Search claims</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search claims" className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-muted/65 focus:outline-none" />
        </label>
      </div>

      <div className="divide-y divide-ink/12 border-b border-ink/12">
        {filtered.map((claim, index) => (
          <details key={claim.claim} className="group py-6 open:py-8">
            <summary className="grid cursor-pointer list-none grid-cols-[2.25rem_1fr_auto] gap-3 sm:grid-cols-[3rem_8.5rem_1fr_auto] sm:gap-5">
              <span className="pt-1 font-mono text-[9px] text-muted">{String(index + 1).padStart(2, "0")}</span>
              <span className={`hidden w-fit self-start rounded-full px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] sm:block ${statusClass(claim.status)}`}>{claim.status}</span>
              <span>
                <span className="mb-2 inline-block sm:hidden"><span className={`rounded-full px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${statusClass(claim.status)}`}>{claim.status}</span></span>
                <span className="block max-w-[72ch] text-base font-medium leading-6 tracking-[-0.025em] text-ink sm:text-lg">{claim.claim}</span>
              </span>
              <CaretDownIcon size={17} className="mt-1 text-muted transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="ml-[2.25rem] mt-6 grid gap-6 border-l border-accent/45 pl-5 sm:ml-[13rem] lg:grid-cols-2 lg:gap-x-12">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">Evidence</p>
                <p className="mt-2 text-sm leading-6 text-muted">{claim.evidence}</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">Counterargument</p>
                <p className="mt-2 text-sm leading-6 text-muted">{claim.counterarguments}</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">Open question</p>
                <p className="mt-2 text-sm leading-6 text-muted">{claim.openQuestions}</p>
              </div>
              <div className="lg:col-span-2">
                <Link href={`/claims/${knowledgeSlug(claim.claim)}`} className="inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-xs font-medium text-ink hover:border-accent hover:text-accent">
                  Open the claim record <ArrowRightIcon size={12} />
                </Link>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">Sources</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {claim.sources.map((source, sourceIndex) => (
                    <a key={source} href={safeHref(source)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border-b border-ink/25 py-1 text-xs font-medium text-ink hover:border-accent hover:text-accent">
                      Source {sourceIndex + 1} <ArrowSquareOutIcon size={12} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </details>
        ))}
        {!filtered.length ? <div className="py-20 text-center"><p className="text-sm font-medium text-ink">No claims match this view.</p><p className="mt-1 text-xs text-muted">Clear the search or select another status.</p></div> : null}
      </div>
    </div>
  );
}
