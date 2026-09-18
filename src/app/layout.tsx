import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppNavigation } from "@/components/app-navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Jev Atlas", template: "%s · Jev Atlas" },
  description: "An evidence-first interface for exploring Jev research, claims, projects, patterns, and opportunities.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffefb",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <AppNavigation />
        <main id="main-content" className="min-h-[100dvh]">
          {children}
        </main>
        <footer className="site-footer">
          <div className="site-footer-inner">
            <p><span>J</span> Jev Atlas <b>/</b> Independent research</p>
            <p>165 posts · 9 claims · 31 hypotheses</p>
            <a href="#main-content">Back to top ↑</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
