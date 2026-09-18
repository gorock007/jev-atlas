"use client";

import { ListIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "The atlas" },
  { href: "/start", label: "Start here" },
  { href: "/claims", label: "Claims" },
  { href: "/projects", label: "Projects" },
  { href: "/patterns", label: "Patterns" },
  { href: "/ideas", label: "Ideas" },
  { href: "/map", label: "Map" },
  { href: "/evidence", label: "Evidence" },
  { href: "/library", label: "Library" },
  { href: "/agent", label: "For agents" },
];

export function AppNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
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
        <Link href="/" className="masthead" aria-label="Jev Research Atlas home">
          <span className="masthead-mark" aria-hidden="true">J</span>
          <span className="masthead-name">Jev Research Atlas</span>
          <span className="masthead-rule" aria-hidden="true" />
          <span className="masthead-note">Field notes</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>{item.label}</Link>;
          })}
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
            {links.map((item, index) => {
              const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
                  <span>{String(index + 1).padStart(2, "0")}</span>{item.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/#research-search" className="mobile-search"><MagnifyingGlassIcon size={17} /> Search the index</Link>
        </div>
      ) : null}
    </header>
  );
}
