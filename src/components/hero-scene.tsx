"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CHOICE, CORE, HERO_VIEW, INPUT_CURVES, NOUL, OUTPUT_CURVES, RESTING, SCORE, choiceX, pointOn, scoreAngle, type Curve } from "./hero-geometry";
import styles from "./hero-visual.module.css";

const PAPER = new THREE.Color("#fffefb");
const INK = new THREE.Color("#3c3a36");
const ACCENT = new THREE.Color("#d62f12");
const PER_INPUT = 6;
const PER_OUTPUT = 4;
const RESOLVE_EVERY = 3.4;
const NEEDLE = SCORE.r - 8;

interface Particle {
  curve: Curve;
  offset: number;
  speed: number;
}

function dotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#fff";
    context.beginPath();
    context.arc(16, 16, 14, 0, Math.PI * 2);
    context.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

/** A unit square with its origin at the top-left corner, to match SVG rects. */
function cornerPlane(): THREE.PlaneGeometry {
  return new THREE.PlaneGeometry(1, 1).translate(0.5, 0.5, 0);
}

function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * The moving half of the hero picture: inputs streaming into the core, and the
 * three typed answers re-resolving every few seconds. The still poster behind
 * it supplies every outline and label, so this draws nothing that is static.
 */
export function HeroScene({ onReady, onLost }: { onReady: () => void; onLost: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef({ onReady, onLost });
  callbacks.current = { onReady, onLost };

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.parentElement;
    if (!canvas || !frame) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      callbacks.current.onLost();
      return;
    }
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    // top = 0 and bottom = height flips y, so scene units are the poster's SVG units.
    const camera = new THREE.OrthographicCamera(0, HERO_VIEW.width, 0, HERO_VIEW.height, -10, 10);

    const particles: Particle[] = [
      ...INPUT_CURVES.flatMap((curve, index) => Array.from({ length: PER_INPUT }, (_, step) => ({ curve, offset: (step / PER_INPUT + index * 0.137) % 1, speed: 0.085 + ((index * 7) % 5) * 0.012 }))),
      ...OUTPUT_CURVES.flatMap((curve, index) => Array.from({ length: PER_OUTPUT }, (_, step) => ({ curve, offset: (step / PER_OUTPUT + index * 0.21) % 1, speed: 0.2 }))),
    ];
    const positions = new Float32Array(particles.length * 3);
    const colors = new Float32Array(particles.length * 3);
    const dots = new THREE.BufferGeometry();
    dots.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    dots.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const texture = dotTexture();
    const dotMaterial = new THREE.PointsMaterial({ size: 3.6 * pixelRatio, sizeAttenuation: false, map: texture, alphaTest: 0.4, transparent: true, vertexColors: true });
    scene.add(new THREE.Points(dots, dotMaterial));

    const accent = new THREE.MeshBasicMaterial({ color: ACCENT, side: THREE.DoubleSide });
    const plane = cornerPlane();

    const chosen = new THREE.Mesh(plane, accent);
    chosen.scale.set(CHOICE.size, CHOICE.size, 1);
    chosen.position.set(choiceX(RESTING.choice), CHOICE.y, 0);

    const bar = new THREE.Mesh(plane, accent);
    bar.position.set(NOUL.x, NOUL.y, 0);

    const needle = new THREE.Mesh(new THREE.PlaneGeometry(1, 2.2).translate(0.5, 0, 0), accent);
    needle.position.set(SCORE.cx, SCORE.cy, 0);
    needle.scale.set(NEEDLE, 1, 1);

    const pulseMaterial = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const pulse = new THREE.Mesh(new THREE.RingGeometry(CORE.r, CORE.r + 1.6, 64), pulseMaterial);
    pulse.position.set(CORE.x, CORE.y, 0);
    scene.add(chosen, bar, needle, pulse);

    const answer = { choice: RESTING.choice as number, score: RESTING.score as number, noul: RESTING.noul as number };
    const from = { ...answer };
    const to = { ...answer };
    let resolvedAt = 0;
    let round = 0;

    const resolve = (now: number) => {
      round += 1;
      Object.assign(from, answer);
      // Deterministic, so the scene looks the same on every visit.
      to.choice = (round * 3 + 1) % CHOICE.options;
      to.score = 0.18 + ((round * 0.37) % 0.74);
      to.noul = 0.12 + ((round * 0.53) % 0.84);
      resolvedAt = now;
    };

    const draw = (now: number) => {
      if (now - resolvedAt > RESOLVE_EVERY) resolve(now);
      const progress = Math.min((now - resolvedAt) / 0.9, 1);
      const eased = ease(progress);
      answer.score = from.score + (to.score - from.score) * eased;
      answer.noul = from.noul + (to.noul - from.noul) * eased;
      answer.choice = progress > 0.35 ? to.choice : from.choice;

      chosen.position.x = choiceX(answer.choice);
      bar.scale.set(Math.max(NOUL.width * answer.noul, 0.001), NOUL.height, 1);
      // y points down on screen, so a positive dial angle is a negative rotation.
      needle.rotation.z = -scoreAngle(answer.score);
      pulse.scale.setScalar(1 + eased * 0.5);
      pulseMaterial.opacity = round === 0 ? 0 : (1 - eased) * 0.7;

      particles.forEach((particle, index) => {
        const t = (particle.offset + now * particle.speed) % 1;
        const [x, y] = pointOn(particle.curve, t);
        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        // The page is paper-coloured, so blending towards paper reads as a fade.
        const fade = Math.min(t / 0.12, (1 - t) / 0.12, 1);
        scratch.copy(PAPER).lerp(INK, fade * 0.85);
        colors[index * 3] = scratch.r;
        colors[index * 3 + 1] = scratch.g;
        colors[index * 3 + 2] = scratch.b;
      });
      dots.attributes.position!.needsUpdate = true;
      dots.attributes.color!.needsUpdate = true;
      renderer.render(scene, camera);
      // Announce on the first frame however it was drawn, so the poster's own dots never double up.
      if (!announced) {
        announced = true;
        callbacks.current.onReady();
      }
    };

    const scratch = new THREE.Color();
    let elapsed = 0;
    let last = 0;
    let running = false;
    let visible = true;
    let announced = false;

    const tick = (time: number) => {
      // Clamp the step so a paused tab resumes where it stopped instead of jumping.
      elapsed += last ? Math.min((time - last) / 1000, 0.1) : 0;
      last = time;
      draw(elapsed);
    };
    const sync = () => {
      const shouldRun = visible && document.visibilityState === "visible";
      if (shouldRun === running) return;
      running = shouldRun;
      last = 0;
      renderer.setAnimationLoop(shouldRun ? tick : null);
    };

    const fit = () => {
      renderer.setSize(frame.clientWidth, frame.clientHeight, false);
      // Point size is in device pixels, so it has to follow the frame like everything else.
      dotMaterial.size = 3.6 * pixelRatio * Math.max(frame.clientWidth / HERO_VIEW.width, 0.6);
    };
    const resize = new ResizeObserver(() => {
      fit();
      if (!running) draw(elapsed);
    });
    resize.observe(frame);
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      sync();
    });
    watcher.observe(frame);
    document.addEventListener("visibilitychange", sync);

    const lost = (event: Event) => {
      event.preventDefault();
      callbacks.current.onLost();
    };
    canvas.addEventListener("webglcontextlost", lost);

    fit();
    sync();

    return () => {
      renderer.setAnimationLoop(null);
      resize.disconnect();
      watcher.disconnect();
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", lost);
      dots.dispose();
      plane.dispose();
      needle.geometry.dispose();
      pulse.geometry.dispose();
      texture.dispose();
      dotMaterial.dispose();
      accent.dispose();
      pulseMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
