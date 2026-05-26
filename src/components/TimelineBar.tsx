"use client";

import { useState } from "react";

export interface TimelineNode {
  id: string;
  label: string;
}

interface TimelineBarProps {
  nodes: TimelineNode[];
  activeNodeId: string;
  onNodeClick?: (nodeId: string) => void;
}

export default function TimelineBar({
  nodes,
  activeNodeId,
  onNodeClick,
}: TimelineBarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeIndex = nodes.findIndex((n) => n.id === activeNodeId);
  const progressPercent =
    nodes.length > 1 ? (activeIndex / (nodes.length - 1)) * 100 : 0;

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 animate-slide-in-bottom opacity-0"
      style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
    >
      {/* Background */}
      <div
        className="relative w-full flex flex-col items-center justify-center"
        style={{
          height: "120px",
          background: "rgba(255, 249, 237, 0.92)",
          backdropFilter: "blur(20px)",
          borderTop: "2px solid var(--imperial-gold)",
          boxShadow: "0 -15px 50px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Track background line */}
        <div
          className="absolute"
          style={{
            left: "var(--margin-edge)",
            right: "var(--margin-edge)",
            top: "38%",
            height: "2px",
            background: "var(--outline-variant)",
          }}
        />

        {/* Active progress glow */}
        <div
          className="absolute transition-all duration-500 ease-out"
          style={{
            left: "var(--margin-edge)",
            top: "38%",
            height: "2px",
            width: `calc((100% - var(--margin-edge) * 2) * ${progressPercent / 100})`,
            background: "var(--imperial-gold)",
            boxShadow: "0 0 8px rgba(212, 175, 55, 0.6)",
          }}
        />

        {/* Nodes */}
        <div
          className="relative w-full flex justify-between items-center z-10"
          style={{
            maxWidth: "1200px",
            paddingLeft: "var(--gutter)",
            paddingRight: "var(--gutter)",
          }}
        >
          {nodes.map((node) => {
            const isActive = node.id === activeNodeId;
            const isHovered = node.id === hoveredId;

            if (isActive) {
              return (
                <div
                  key={node.id}
                  className="relative flex flex-col items-center z-20 cursor-pointer"
                  onClick={() => onNodeClick?.(node.id)}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Diamond slider handle */}
                  <div
                    className="animate-pulse-glow transition-transform hover:scale-110"
                    style={{
                      width: "28px",
                      height: "28px",
                      background: "var(--imperial-gold)",
                      transform: "rotate(45deg)",
                      border: "2px solid var(--parchment)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        background: "var(--parchment)",
                      }}
                    />
                  </div>
                  {/* Label */}
                  <span
                    className="text-label-md font-bold mt-2"
                    style={{
                      color: "var(--gold-dark)",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {node.label}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={node.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onNodeClick?.(node.id)}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ transform: "translateY(-4px)" }}
              >
                {/* Circle node */}
                <div
                  className="transition-all duration-300"
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: isHovered
                      ? "var(--imperial-gold)"
                      : "var(--parchment)",
                    border: "2px solid var(--imperial-gold)",
                    marginBottom: "14px",
                  }}
                />
                {/* Label */}
                <span
                  className="text-label-md transition-colors duration-300"
                  style={{
                    color: isHovered
                      ? "var(--gold-dark)"
                      : "var(--on-surface-variant)",
                    letterSpacing: "0.08em",
                    fontSize: "12px",
                  }}
                >
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
