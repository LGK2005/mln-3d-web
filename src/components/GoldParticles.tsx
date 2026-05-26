"use client";

import { useEffect, useRef } from "react";

interface Particle {
  size: number;
  left: number;
  duration: number;
  delay: number;
}

export default function GoldParticles({ count = 25 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedRef = useRef(false);

  useEffect(() => {
    if (generatedRef.current || !containerRef.current) return;
    generatedRef.current = true;

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        size: Math.random() * 3 + 1,
        left: Math.random() * 100,
        duration: Math.random() * 18 + 10,
        delay: Math.random() * 15,
      });
    }

    particles.forEach((p) => {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.width = `${p.size}px`;
      el.style.height = `${p.size}px`;
      el.style.left = `${p.left}%`;
      el.style.bottom = "-10px";
      el.style.background = "#d4af37";
      el.style.borderRadius = "50%";
      el.style.pointerEvents = "none";
      el.style.opacity = "0";
      el.style.zIndex = "15";
      el.style.animation = `float ${p.duration}s linear ${p.delay}s infinite`;
      containerRef.current?.appendChild(el);
    });
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  );
}
