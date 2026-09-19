"use client";

import { ListIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/start", label: "Start here" },
  { href: "/map", label: "Build ideas" },
  { href: "/fit", label: "Fit check" },
  { href: "/claims", label: "Claims" },
  { href: "/agent", label: "For agents" },
];

const moreLinks = [
  { href: "/guide", label: "Ask well" },
  { href: "/cost", label: "Cost" },
  { href: "/projects", label: "Projects" },
  { href: "/patterns", label: "Patterns" },
  { href: "/ideas", label: "Ideas" },
  { href: "/evidence", label: "Evidence" },
  { href: "/library", label: "Library" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const more = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    setOpen(false);
    if (more.current) more.current.open = false;
  }, [pathname]);
  // The "More" menu is a native <details>, so it opens without JavaScript; this only adds dismissal.
  useEffect(() => {
    const dismiss = (event: Event) => {
      const menu = more.current;
      if (!menu?.open) return;
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !menu.contains(event.target as Node)) menu.open = false;
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="masthead" aria-label="Jev Atlas home">
          <span className="masthead-mark" aria-hidden="true">J</span>
          <span className="masthead-name">Jev Atlas</span>
          <span className="masthead-rule" aria-hidden="true" />
          <span className="masthead-note">Field notes</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>{item.label}</Link>)}
          <details className="nav-more" ref={more}>
            <summary data-current={moreLinks.some((item) => isActive(pathname, item.href)) ? "true" : undefined}>More</summary>
            <div className="nav-more-panel">
              {moreLinks.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>{item.label}</Link>)}
            </div>
          </details>
        </nav>

        <Link href="/#research-search" className="header-search" aria-label="Search the research index">
          <MagnifyingGlassIcon size={15} aria-hidden="true" />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </Link>

        <button type="button" className="menu-button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>
          {open ? <XIcon size={20} /> : <ListIcon size={21} />}
        </button>
      </div>

      {open ? (
        <div className="mobile-nav-panel">
          <nav aria-label="Mobile navigation">
            {links.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>{item.label}</Link>)}
          </nav>
          <nav aria-label="More sections" className="mobile-nav-more">
            {moreLinks.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>{item.label}</Link>)}
          </nav>
          <Link href="/#research-search" className="mobile-search"><MagnifyingGlassIcon size={17} /> Search the index</Link>
        </div>
      ) : null}
    </header>
  );
}
