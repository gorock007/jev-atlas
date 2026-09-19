"use client";

import { useEffect, useRef, useState } from "react";

interface ExplainerVideoProps {
  sources: Array<{ src: string; type: string }>;
  poster: string;
  label: string;
  className?: string | undefined;
}

/**
 * A silent, seamless loop. It plays only while it is on screen, and never on
 * its own under reduced motion — there it stays on the poster and shows
 * controls, so playing it is the visitor's choice.
 */
export function ExplainerVideo({ sources, poster, label, className }: ExplainerVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let watcher: IntersectionObserver | null = null;

    const apply = () => {
      watcher?.disconnect();
      watcher = null;
      setManual(reduced.matches);
      if (reduced.matches) {
        video.pause();
        return;
      }
      watcher = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) video.pause();
        // A refused play() (battery saver, browser policy) just leaves the poster up.
        else video.play().catch(() => setManual(true));
      }, { threshold: 0.25 });
      watcher.observe(video);
    };

    apply();
    reduced.addEventListener("change", apply);
    return () => {
      watcher?.disconnect();
      reduced.removeEventListener("change", apply);
    };
  }, []);

  return (
    <video ref={ref} className={className} muted loop playsInline preload="metadata" controls={manual} poster={poster} aria-label={label}>
      {sources.map((source) => <source key={source.src} src={source.src} type={source.type} />)}
    </video>
  );
}
