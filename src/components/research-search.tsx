"use client";

import { ArrowRightIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchItem {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string;
  tags: string[];
}

export function ResearchSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const normalized = query.trim().toLocaleLowerCase();
  const results = useMemo(() => {
    if (!normalized) return items.slice(0, 5);
    return items.filter((item) => `${item.title} ${item.description} ${item.type} ${item.tags.join(" ")}`.toLocaleLowerCase().includes(normalized)).slice(0, 8);
  }, [items, normalized]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <section className="site-container research-search-section">
      <div className="search-intro">
          <p className="atlas-label">Find a thread</p>
          <h2>
            Search across every research layer.
          </h2>
          <p>
            Claims, projects, product ideas, source posts, and long-form synthesis are indexed together.
          </p>
      </div>
      <div className="search-interface">
          <label htmlFor="research-search" className="sr-only">Search the research</label>
          <div className="search-input-row">
            <MagnifyingGlassIcon size={19} aria-hidden="true" />
            <input
              ref={inputRef}
              id="research-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try ‘calibration’, ‘agent routing’, or ‘Home Assistant’"
              className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="search-clear" aria-label="Clear search">
                <XIcon size={16} />
              </button>
            ) : <kbd>⌘K</kbd>}
          </div>

          <div className="search-results">
            {results.length ? results.map((item) => (
              <Link key={item.id} href={item.href}>
                <span>{item.type}</span>
                <span className="min-w-0">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <ArrowRightIcon size={16} aria-hidden="true" />
              </Link>
            )) : (
              <div className="search-empty">
                <p>No matching research</p>
                <span>Try a broader technical term or project name.</span>
              </div>
            )}
          </div>
      </div>
    </section>
  );
}
