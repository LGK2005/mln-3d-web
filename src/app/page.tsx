"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/Scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="animate-spin"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "var(--imperial-gold)",
        }}
      />
    </div>
  ),
});

const GoldParticles = dynamic(() => import("@/components/GoldParticles"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* 3D Canvas Background — will be replaced by video later */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 z-10 civ-bg-overlay" />

      {/* Floating gold particles */}
      <div className="absolute inset-0 z-20">
        <GoldParticles count={25} />
      </div>

      {/* Main Content */}
      <div className="relative z-30 w-full h-full flex flex-col items-center justify-center px-16">
        {/* Decorative top ornament */}
        <div
          className="mb-12 flex flex-col items-center opacity-80 animate-fade-in-up"
          style={{ animationDelay: "0s" }}
        >
          <div
            style={{
              width: "1px",
              height: "64px",
              background: "var(--imperial-gold)",
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              border: "1px solid var(--imperial-gold)",
              transform: "rotate(45deg)",
              marginTop: "4px",
            }}
          />
        </div>

        {/* Title block */}
        <div
          className="animate-fade-in-up opacity-0 text-center"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          <h1
            className="text-display-lg glow-text-gold relative"
            style={{
              color: "#ffffff",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            <span className="relative z-10">TRIẾT HỌC MÁC-LÊNIN</span>
          </h1>

          {/* Subtitle */}
          <div
            className="text-headline-md glow-text-gold mt-6"
            style={{
              color: "#ffffff",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            LÝ LUẬN NHẬN THỨC
          </div>

          {/* Decorative underline with diamond */}
          <div
            className="mt-8 flex items-center justify-center"
            style={{ maxWidth: "600px", margin: "32px auto 0" }}
          >
            <div
              style={{ flex: 1, height: "1px", background: "var(--imperial-gold)" }}
            />
            <div
              style={{
                width: "16px",
                height: "16px",
                background: "var(--deep-crimson)",
                transform: "rotate(45deg)",
                margin: "0 8px",
                border: "1px solid var(--imperial-gold)",
              }}
            />
            <div
              style={{ flex: 1, height: "1px", background: "var(--imperial-gold)" }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="flex flex-col md:flex-row gap-8 mt-16 items-center justify-center w-full animate-fade-in-up opacity-0"
          style={{
            maxWidth: "800px",
            animationDelay: "0.5s",
            animationFillMode: "forwards",
          }}
        >
          {/* TRẢI NGHIỆM 3D */}
          <Link href="/explore" className="w-full md:w-auto">
            <button
              id="explore-3d-btn"
              className="group relative w-full md:w-auto overflow-hidden btn-metal font-label"
              style={{
                padding: "20px 48px",
                background: "var(--deep-crimson)",
                color: "var(--on-secondary)",
                border: "2px solid var(--imperial-gold)",
                borderRadius: "9999px",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                cursor: "pointer",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span
                  className="group-hover:bg-white transition-colors"
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--imperial-gold)",
                  }}
                />
                TRẢI NGHIỆM 3D
                <span
                  className="group-hover:bg-white transition-colors"
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--imperial-gold)",
                  }}
                />
              </span>
              {/* Shimmer sweep */}
              <div
                className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)",
                  zIndex: 0,
                }}
              />
            </button>
          </Link>

          {/* TRÒ CHƠI QUIZ (Placeholder) */}
          <button
            id="quiz-btn"
            className="group relative w-full md:w-auto overflow-hidden btn-metal font-label"
            style={{
              padding: "20px 48px",
              background: "var(--parchment)",
              color: "var(--gold-dark)",
              border: "2px solid var(--imperial-gold)",
              borderRadius: "9999px",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              cursor: "not-allowed",
              opacity: 0.7,
            }}
            disabled
            title="Sắp ra mắt"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--deep-crimson)",
                }}
              />
              TRÒ CHƠI QUIZ
              <span
                className="text-label-md"
                style={{
                  background: "var(--deep-crimson)",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  marginLeft: "4px",
                }}
              >
                SẮP RA MẮT
              </span>
            </span>
          </button>
        </div>

        {/* Decorative bottom ornament */}
        <div
          className="mt-16 flex flex-col items-center opacity-80 animate-fade-in-up"
          style={{ animationDelay: "0.7s" }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              border: "1px solid var(--imperial-gold)",
              transform: "rotate(45deg)",
              marginBottom: "4px",
            }}
          />
          <div
            style={{
              width: "1px",
              height: "64px",
              background: "var(--imperial-gold)",
            }}
          />
        </div>
      </div>
    </main>
  );
}
