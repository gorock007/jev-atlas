import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppNavigation } from "@/components/app-navigation";
import { loadAnalysis } from "@/lib/research-data";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteDescription = "An evidence-first interface for exploring Jev research, claims, projects, patterns, and opportunities.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Jev Atlas", template: "%s · Jev Atlas" },
  description: siteDescription,
  openGraph: {
    siteName: "Jev Atlas",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffefb",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  // The same analysis the homepage corpus numbers read, so the footer cannot go stale.
  const analysis = await loadAnalysis();
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
            <p>{analysis ? `${analysis.dataset.totalPosts} posts · ${analysis.claims.length} claims · ${analysis.ideas.length} hypotheses` : null}</p>
            <a href="#main-content">Back to top ↑</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
