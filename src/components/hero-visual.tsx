"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CHOICE, CORE, HERO_VIEW, INPUT_CURVES, NOUL, OUTPUT_CURVES, OUTPUT_Y, RESTING, SCORE, choiceX, curvePath, pointOn, scoreTip } from "./hero-geometry";
import styles from "./hero-visual.module.css";

// three.js is only fetched once the browser has shown it can and should animate.
const HeroScene = dynamic(() => import("./hero-scene").then((module) => module.HeroScene), { ssr: false });

const POSTER_DOTS = [0.12, 0.3, 0.48, 0.66, 0.84];

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** The whole picture as a still. It is the fallback, and the live scene's backdrop. */
function HeroPoster({ live }: { live: boolean }) {
  const [needleX, needleY] = scoreTip(RESTING.score);
  return (
    <svg viewBox={`0 0 ${HERO_VIEW.width} ${HERO_VIEW.height}`} className={styles.poster} role="img" aria-label="Many small inputs flow into Jev and leave as three typed answers: one option picked from a list, a position on a dial, and a probability.">
      {INPUT_CURVES.map((curve, index) => <path key={index} d={curvePath(curve)} className={styles.stream} />)}
      {OUTPUT_CURVES.map((curve, index) => <path key={index} d={curvePath(curve)} className={styles.outflow} />)}

      <circle cx={CORE.x} cy={CORE.y} r={CORE.r} className={styles.core} />
      <circle cx={CORE.x} cy={CORE.y} r={CORE.r - 9} className={styles.coreInner} />
      <text x={CORE.x} y={CORE.y + CORE.r + 20} textAnchor="middle" className={styles.caption}>Jev</text>
      <text x="6" y="14" className={styles.caption}>Your app’s state</text>

      <text x={CHOICE.x} y={OUTPUT_Y[0] - 26} className={styles.caption}>Choice</text>
      {Array.from({ length: CHOICE.options }, (_, index) => <rect key={index} x={choiceX(index)} y={CHOICE.y} width={CHOICE.size} height={CHOICE.size} className={styles.outline} />)}

      <text x={CHOICE.x} y={OUTPUT_Y[1] - 38} className={styles.caption}>Score</text>
      <path d={`M${SCORE.cx - SCORE.r} ${SCORE.cy}A${SCORE.r} ${SCORE.r} 0 0 1 ${SCORE.cx + SCORE.r} ${SCORE.cy}`} className={styles.outline} />
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
        const [x1, y1] = scoreTip(tick, SCORE.r);
        const [x2, y2] = scoreTip(tick, SCORE.r + 6);
        return <path key={tick} d={`M${x1} ${y1}L${x2} ${y2}`} className={styles.outline} />;
      })}
      <circle cx={SCORE.cx} cy={SCORE.cy} r="2.5" className={styles.pivot} />

      <text x={NOUL.x} y={OUTPUT_Y[2] - 22} className={styles.caption}>Noul</text>
      <rect x={NOUL.x} y={NOUL.y} width={NOUL.width} height={NOUL.height} className={styles.outline} />
      <text x={NOUL.x} y={NOUL.y + NOUL.height + 14} className={styles.scale}>0</text>
      <text x={NOUL.x + NOUL.width} y={NOUL.y + NOUL.height + 14} textAnchor="end" className={styles.scale}>1</text>

      <g className={live ? styles.hidden : undefined}>
        {INPUT_CURVES.flatMap((curve, index) => POSTER_DOTS.map((t) => {
          const [x, y] = pointOn(curve, (t + index * 0.137) % 1);
          return <circle key={`${index}-${t}`} cx={x} cy={y} r="1.7" className={styles.dot} />;
        }))}
        <rect x={choiceX(RESTING.choice)} y={CHOICE.y} width={CHOICE.size} height={CHOICE.size} className={styles.accent} />
        <path d={`M${SCORE.cx} ${SCORE.cy}L${needleX} ${needleY}`} className={styles.needle} />
        <rect x={NOUL.x} y={NOUL.y} width={NOUL.width * RESTING.noul} height={NOUL.height} className={styles.accent} />
      </g>
    </svg>
  );
}

export function HeroVisual() {
  const [animate, setAnimate] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let idle = 0;
    const decide = () => {
      const allowed = !reduced.matches && canUseWebGL();
      setAnimate(allowed);
      if (!allowed) setLive(false);
    };
    // Wait for an idle moment so the scene never competes with the first paint.
    if ("requestIdleCallback" in window) idle = window.requestIdleCallback(decide, { timeout: 1500 });
    else decide();
    reduced.addEventListener("change", decide);
    return () => {
      if (idle) window.cancelIdleCallback(idle);
      reduced.removeEventListener("change", decide);
    };
  }, []);

  return (
    <div className={styles.frame}>
      <HeroPoster live={live} />
      {animate ? <HeroScene onReady={() => setLive(true)} onLost={() => { setLive(false); setAnimate(false); }} /> : null}
    </div>
  );
}
