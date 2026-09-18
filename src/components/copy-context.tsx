"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useState } from "react";

/**
 * Hands an agent the same cited record the page is showing, so a coding agent
 * does not have to scrape the rendered HTML to reuse it.
 */
export function CopyContext({ context, label = "Copy context for agent" }: { context: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(context);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 1_800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 border border-ink/20 bg-paper px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-accent hover:text-accent active:scale-[0.99]"
    >
      {state === "copied" ? <CheckIcon size={12} weight="bold" /> : <CopyIcon size={12} />}
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}</span>
    </button>
  );
}
