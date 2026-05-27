"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Settings, Brain, Play, Pause, ArrowLeft } from "lucide-react";
import SidePanel from "@/components/SidePanel";
import TimelineBar from "@/components/TimelineBar";
import SettingsPanel from "@/components/SettingsPanel";
import type { TimelineNode } from "@/components/TimelineBar";
import { defaultSettings } from "@/components/sceneConfig";
import type { SceneSettings } from "@/components/sceneConfig";

const InteractiveScene = dynamic(
  () => import("@/components/InteractiveScene"),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: "var(--ink-black)" }}
      >
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
  }
);

/* ─── Timeline data ─── */
const timelineNodes: TimelineNode[] = [
  { id: "cam-giac", label: "Cảm giác" },
  { id: "tri-giac", label: "Tri giác" },
  { id: "bieu-tuong", label: "Biểu tượng" },
  { id: "khai-niem", label: "Khái niệm" },
  { id: "thuc-tien", label: "Thực tiễn" },
];

/* ─── Model descriptions for each node ─── */
const modelDescriptions: Record<string, string> = {
  "cam-giac": "Hình cầu phát sáng — biểu tượng cho nhận thức đơn giản nhất, phản ánh từng thuộc tính riêng lẻ.",
  "tri-giac": "Các hình cầu quay quanh tâm — biểu tượng cho sự tổng hợp nhiều cảm giác thành hình ảnh hoàn chỉnh.",
  "bieu-tuong": "Khối đa diện biến dạng — biểu tượng cho hình ảnh tinh thần được tái hiện từ trí nhớ.",
  "khai-niem": "Khung dây hình học lồng nhau — biểu tượng cho tư duy trừu tượng, nắm bắt thuộc tính bản chất.",
  "thuc-tien": "Các nút xoắn lồng ghép — biểu tượng cho hoạt động vật chất có mục đích cải biến hiện thực.",
};

/* ─── Lesson content per timeline node ─── */
const lessonContent: Record<
  string,
  { sections: { title: string; description: string }[] }
> = {
  "cam-giac": {
    sections: [
      {
        title: "Cảm giác là gì?",
        description:
          "Cảm giác là hình thức đầu tiên và giản đơn nhất của nhận thức cảm tính. Nó phản ánh từng thuộc tính riêng lẻ của sự vật, hiện tượng khi chúng tác động trực tiếp vào các giác quan.",
      },
      {
        title: "Vai trò của cảm giác",
        description:
          "Cảm giác là nguồn gốc của mọi sự hiểu biết, là kết quả của sự chuyển hoá năng lượng kích thích bên ngoài thành sự kiện ý thức.",
      },
    ],
  },
  "tri-giac": {
    sections: [
      {
        title: "Tri giác là gì?",
        description:
          "Tri giác là sự tổng hợp của nhiều cảm giác, cho ta hình ảnh hoàn chỉnh hơn về sự vật. Nó phản ánh sự vật trong tính chỉnh thể của nó.",
      },
      {
        title: "Đặc điểm của tri giác",
        description:
          "Tri giác vẫn mang tính trực tiếp và cụ thể, nhưng đã phong phú hơn cảm giác vì nó phản ánh được nhiều thuộc tính cùng lúc.",
      },
    ],
  },
  "bieu-tuong": {
    sections: [
      {
        title: "Biểu tượng là gì?",
        description:
          "Biểu tượng là hình thức cao nhất của nhận thức cảm tính. Nó là hình ảnh về sự vật được tái hiện trong óc khi sự vật không còn trực tiếp tác động vào các giác quan.",
      },
      {
        title: "Vai trò cầu nối",
        description:
          'Biểu tượng là khâu trung gian giữa nhận thức cảm tính và nhận thức lý tính. Ở biểu tượng đã bắt đầu có tính chất khái quát, nhưng vẫn mang tính trực quan.',
      },
    ],
  },
  "khai-niem": {
    sections: [
      {
        title: "Khái niệm là gì?",
        description:
          "Khái niệm là hình thức cơ bản của tư duy trừu tượng, phản ánh những thuộc tính bản chất, chung của một lớp sự vật, hiện tượng.",
      },
      {
        title: "Phán đoán và Suy luận",
        description:
          "Từ khái niệm, con người tiến tới phán đoán (liên kết các khái niệm) và suy luận (rút ra tri thức mới từ những tri thức đã có).",
      },
    ],
  },
  "thuc-tien": {
    sections: [
      {
        title: "Thực tiễn là gì?",
        description:
          "Thực tiễn là toàn bộ hoạt động vật chất có mục đích, mang tính lịch sử - xã hội của con người nhằm cải biến tự nhiên và xã hội.",
      },
      {
        title: "Vai trò của thực tiễn",
        description:
          "Thực tiễn là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn của chân lý. Nhận thức phải quay về thực tiễn để kiểm nghiệm.",
      },
    ],
  },
};

export default function ExplorePage() {
  const [activeNode, setActiveNode] = useState("bieu-tuong");
  const [settings, setSettings] = useState<SceneSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [playTrigger, setPlayTrigger] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentLesson = lessonContent[activeNode];
  const currentNodeLabel =
    timelineNodes.find((n) => n.id === activeNode)?.label ?? "";
  const currentModelDesc = modelDescriptions[activeNode] ?? "";

  const handlePlay = useCallback(() => {
    if (isPlaying) return;
    setPlayTrigger((prev) => prev + 1);
    setIsPlaying(true);
    // Reset after animation completes (~3s)
    setTimeout(() => setIsPlaying(false), 3000);
  }, [isPlaying]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "var(--ink-black)" }}
    >
      {/* ── 3D Background ── */}
      <div className="absolute inset-0 z-0">
        <InteractiveScene
          activeNodeId={activeNode}
          settings={settings}
          playTrigger={playTrigger}
        />
      </div>

      {/* ── Abstract overlay patterns ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          opacity: settings.backgroundOpacity,
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,175,55,0.04) 10px, rgba(212,175,55,0.04) 20px)",
          mixBlendMode: "screen",
        }}
      />

      {/* ── UI Layer ── */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {/* Left Side Panel */}
        <div className="pointer-events-auto">
          <SidePanel title="Lý luận nhận thức" subtitle="Duy vật biện chứng">
          {/* Section header */}
          <section className="mb-8">
            <h2
              className="text-label-lg flex items-center gap-2 mb-6"
              style={{ color: "var(--gold-dark)" }}
            >
              <Brain size={16} strokeWidth={2} />
              Nội dung bài học
            </h2>

            {/* Current node indicator */}
            <div
              className="mb-4 pb-4"
              style={{ borderBottom: "1px solid var(--outline-variant)" }}
            >
              <p
                className="text-label-md"
                style={{
                  color: "var(--deep-crimson)",
                  letterSpacing: "0.1em",
                  marginBottom: "4px",
                }}
              >
                ĐANG XEM
              </p>
              <p
                className="text-headline-md"
                style={{ color: "var(--gold-dark)", fontSize: "24px" }}
              >
                {currentNodeLabel}
              </p>
            </div>

            {/* Lesson content */}
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {currentLesson?.sections.map((section, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3"
                  style={{ lineHeight: 1.6 }}
                >
                  <span
                    className="font-label"
                    style={{
                      color: "var(--deep-crimson)",
                      fontWeight: 700,
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  >
                    {String.fromCharCode(97 + i)}.
                  </span>
                  <div>
                    <p className="text-body-md" style={{ fontWeight: 700 }}>
                      {section.title}
                    </p>
                    <p
                      className="text-body-md"
                      style={{
                        color: "var(--on-surface-variant)",
                        fontSize: "15px",
                        marginTop: "4px",
                      }}
                    >
                      {section.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Model description */}
          <section>
            <div className="art-deco-divider mb-6">
              <div className="diamond" />
            </div>
            <div
              style={{
                padding: "12px 16px",
                background: "var(--surface-container-low)",
                borderLeft: "3px solid var(--imperial-gold)",
              }}
            >
              <p
                className="text-label-md"
                style={{
                  color: "var(--gold-dark)",
                  marginBottom: "6px",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                MÔ HÌNH 3D
              </p>
              <p
                className="text-body-md"
                style={{
                  color: "var(--on-surface-variant)",
                  fontSize: "14px",
                  lineHeight: 1.5,
                }}
              >
                {currentModelDesc}
              </p>
            </div>
          </section>
        </SidePanel>
      </div>

        {/* ── Top-right action buttons ── */}
        <div
          className="fixed z-50 flex items-center gap-3 pointer-events-auto"
          style={{ top: "64px", right: "64px" }}
        >
          {/* Back to main menu button */}
          <Link href="/">
            <button
              id="back-to-home-btn"
              className="parchment-bg art-deco-border flex items-center justify-center group transition-all"
              style={{
                width: "48px",
                height: "48px",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
              title="Quay lại màn hình chính"
            >
              <ArrowLeft
                size={20}
                strokeWidth={1.8}
                className="transition-transform duration-300 group-hover:-translate-x-1"
                style={{ color: "var(--gold-dark)" }}
              />
            </button>
          </Link>

          {/* Play Animation button */}
          <button
            id="play-animation-btn"
            onClick={handlePlay}
            className="parchment-bg art-deco-border flex items-center justify-center group transition-all"
            style={{
              width: "48px",
              height: "48px",
              cursor: isPlaying ? "not-allowed" : "pointer",
              boxShadow: isPlaying
                ? "0 0 20px rgba(212, 175, 55, 0.4), 0 4px 20px rgba(0,0,0,0.3)"
                : "0 4px 20px rgba(0,0,0,0.3)",
              opacity: isPlaying ? 0.8 : 1,
            }}
            title={isPlaying ? "Đang phát..." : "Phát animation"}
            disabled={isPlaying}
          >
            {isPlaying ? (
              <Pause
                size={20}
                strokeWidth={1.8}
                style={{ color: "var(--deep-crimson)" }}
              />
            ) : (
              <Play
                size={20}
                strokeWidth={1.8}
                className="transition-transform duration-300 group-hover:scale-110"
                style={{ color: "var(--gold-dark)", marginLeft: "2px" }}
              />
            )}
          </button>

          {/* Settings button */}
          <button
            id="settings-btn"
            onClick={() => setShowSettings(true)}
            className="parchment-bg art-deco-border flex items-center justify-center group transition-colors"
            style={{
              width: "48px",
              height: "48px",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
            title="Cài đặt"
          >
            <Settings
              size={20}
              strokeWidth={1.8}
              className="transition-transform duration-500 group-hover:rotate-90"
              style={{ color: "var(--gold-dark)" }}
            />
          </button>
        </div>

        {/* Settings Panel */}
        <div className="pointer-events-auto">
          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            settings={settings}
            onSettingsChange={setSettings}
          />
        </div>

        {/* Timeline Bar */}
        <div className="pointer-events-auto">
          <TimelineBar
            nodes={timelineNodes}
            activeNodeId={activeNode}
            onNodeClick={setActiveNode}
          />
        </div>
      </div>
    </div>
  );
}
