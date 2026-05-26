"use client";

import { ReactNode } from "react";
import { BookOpen } from "lucide-react";

interface SidePanelProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function SidePanel({
  title,
  subtitle,
  children,
}: SidePanelProps) {
  return (
    <aside
      className="fixed left-0 top-0 h-full z-40 flex flex-col parchment-bg art-deco-border animate-slide-in-left opacity-0"
      style={{
        width: "400px",
        paddingTop: "var(--gutter)",
        paddingBottom: "var(--gutter)",
        borderRight: "4px solid var(--gold-dark)",
        boxShadow: "40px 0 60px rgba(0, 0, 0, 0.4)",
        animationDelay: "0.3s",
        animationFillMode: "forwards",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex flex-col items-center text-center"
        style={{
          padding: "0 32px 24px",
          borderBottom: "2px solid var(--imperial-gold)",
        }}
      >
        <BookOpen
          size={44}
          strokeWidth={1.5}
          style={{ color: "var(--gold-dark)", marginBottom: "8px" }}
        />
        <h1
          className="text-headline-md"
          style={{
            color: "var(--gold-dark)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </h1>
        <p
          className="text-label-md"
          style={{
            color: "var(--on-surface-variant)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginTop: "8px",
          }}
        >
          {subtitle}
        </p>

        {/* Art Deco diamond divider */}
        <div
          className="relative mt-4"
          style={{ width: "96px", height: "1px", background: "var(--gold-dark)" }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(45deg)",
              width: "8px",
              height: "8px",
              background: "var(--gold-dark)",
            }}
          />
        </div>
      </div>

      {/* ── Content Area (Scrollable) ── */}
      <div
        className="flex-1 overflow-y-auto parchment-scroll"
        style={{ padding: "24px 32px", color: "var(--on-surface)" }}
      >
        {children}
      </div>
    </aside>
  );
}
