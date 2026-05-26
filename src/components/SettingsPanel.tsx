"use client";

import { X, RotateCcw } from "lucide-react";
import type { SceneSettings } from "./sceneConfig";
import { defaultSettings } from "./sceneConfig";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SceneSettings;
  onSettingsChange: (settings: SceneSettings) => void;
}

/* ─── Toggle Switch ─── */
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label
      className="flex items-center justify-between cursor-pointer group"
      style={{ padding: "12px 0" }}
    >
      <span
        className="text-body-md"
        style={{ color: "var(--on-surface)", fontSize: "15px" }}
      >
        {label}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: "44px",
          height: "24px",
          borderRadius: "12px",
          background: checked ? "var(--imperial-gold)" : "var(--outline-variant)",
          position: "relative",
          transition: "background 0.3s ease",
          border: "1px solid",
          borderColor: checked ? "var(--gold-dark)" : "var(--outline)",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "22px" : "2px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: checked ? "var(--parchment)" : "var(--surface-dim)",
            transition: "left 0.3s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </button>
    </label>
  );
}

/* ─── Range Slider ─── */
function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ padding: "12px 0" }}>
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-body-md"
          style={{ color: "var(--on-surface)", fontSize: "15px" }}
        >
          {label}
        </span>
        <span
          className="text-label-md"
          style={{
            color: "var(--gold-dark)",
            fontWeight: 700,
            fontSize: "13px",
          }}
        >
          {formatValue ? formatValue(value) : value.toFixed(1)}
        </span>
      </div>
      <div style={{ position: "relative", height: "20px" }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            width: "100%",
            height: "4px",
            appearance: "none",
            background: `linear-gradient(to right, var(--imperial-gold) 0%, var(--imperial-gold) ${percent}%, var(--outline-variant) ${percent}%, var(--outline-variant) 100%)`,
            borderRadius: "2px",
            outline: "none",
            cursor: "pointer",
            marginTop: "8px",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Settings Panel ─── */
export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: SettingsPanelProps) {
  const update = (partial: Partial<SceneSettings>) =>
    onSettingsChange({ ...settings, ...partial });

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 parchment-bg flex flex-col transition-transform duration-500 ease-out"
        style={{
          width: "340px",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          borderLeft: "4px solid var(--gold-dark)",
          boxShadow: isOpen ? "-20px 0 60px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "24px 24px 20px",
            borderBottom: "2px solid var(--imperial-gold)",
          }}
        >
          <h2
            className="text-label-lg"
            style={{ color: "var(--gold-dark)", letterSpacing: "0.15em" }}
          >
            CÀI ĐẶT
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center transition-colors"
            style={{
              width: "32px",
              height: "32px",
              border: "1px solid var(--outline-variant)",
              background: "transparent",
              cursor: "pointer",
              color: "var(--on-surface-variant)",
            }}
            aria-label="Đóng"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto parchment-scroll"
          style={{ padding: "16px 24px" }}
        >
          {/* Section: Hiển thị */}
          <div style={{ marginBottom: "24px" }}>
            <p
              className="text-label-md"
              style={{
                color: "var(--deep-crimson)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "8px",
                fontSize: "12px",
              }}
            >
              HIỂN THỊ
            </p>
            <div
              style={{
                borderBottom: "1px solid var(--outline-variant)",
              }}
            >
              <Toggle
                label="Hiệu ứng hạt"
                checked={settings.showParticles}
                onChange={(v) => update({ showParticles: v })}
              />
            </div>
            <div
              style={{
                borderBottom: "1px solid var(--outline-variant)",
              }}
            >
              <Toggle
                label="Vòng quỹ đạo"
                checked={settings.showRings}
                onChange={(v) => update({ showRings: v })}
              />
            </div>
          </div>

          {/* Section: Chuyển động */}
          <div style={{ marginBottom: "24px" }}>
            <p
              className="text-label-md"
              style={{
                color: "var(--deep-crimson)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "8px",
                fontSize: "12px",
              }}
            >
              CHUYỂN ĐỘNG
            </p>
            <div
              style={{
                borderBottom: "1px solid var(--outline-variant)",
              }}
            >
              <Toggle
                label="Tự động xoay"
                checked={settings.autoRotate}
                onChange={(v) => update({ autoRotate: v })}
              />
            </div>
            <Slider
              label="Tốc độ xoay"
              value={settings.rotationSpeed}
              min={0.1}
              max={2.0}
              step={0.1}
              onChange={(v) => update({ rotationSpeed: v })}
              formatValue={(v) => `${v.toFixed(1)}x`}
            />
          </div>

          {/* Section: Nền */}
          <div style={{ marginBottom: "24px" }}>
            <p
              className="text-label-md"
              style={{
                color: "var(--deep-crimson)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "8px",
                fontSize: "12px",
              }}
            >
              HIỆU ỨNG NỀN
            </p>
            <Slider
              label="Độ sáng pattern"
              value={settings.backgroundOpacity}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => update({ backgroundOpacity: v })}
              formatValue={(v) => `${Math.round(v * 100)}%`}
            />
          </div>
        </div>

        {/* Footer: Reset */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "2px solid var(--imperial-gold)",
          }}
        >
          <button
            onClick={() => onSettingsChange(defaultSettings)}
            className="flex items-center justify-center gap-2 w-full font-label transition-colors"
            style={{
              padding: "12px",
              background: "transparent",
              border: "2px solid var(--outline-variant)",
              color: "var(--on-surface-variant)",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--imperial-gold)";
              e.currentTarget.style.color = "var(--gold-dark)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--outline-variant)";
              e.currentTarget.style.color = "var(--on-surface-variant)";
            }}
          >
            <RotateCcw size={14} strokeWidth={2} />
            KHÔI PHỤC MẶC ĐỊNH
          </button>
        </div>
      </div>
    </>
  );
}
