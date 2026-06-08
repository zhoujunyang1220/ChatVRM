import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

/* ── sound ── */
function playClick() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.connect(g1);
    g1.connect(ctx.destination);
    osc1.frequency.value = 900;
    osc1.type = "square";
    g1.gain.setValueAtTime(0.1, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.03);

    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.frequency.value = 2200;
    osc2.type = "sine";
    g2.gain.setValueAtTime(0.08, ctx.currentTime + 0.04);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc2.start(ctx.currentTime + 0.04);
    osc2.stop(ctx.currentTime + 0.09);
  } catch { /* no audio */ }
}

const THRESHOLD_PX = 50;
const VB_H = 116;
const RENDER_H = 136;
const SCALE = VB_H / RENDER_H; // SVG units per screen pixel
const TH_SVG = THRESHOLD_PX * SCALE;
const BASE_END = 72;

/* ─── component ─── */
type Props = { isOn: boolean; onToggle: () => void; hue: number };

export const ThemeToggle = ({ isOn, onToggle, hue }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStart_ = useRef(0);
  const rawRef = useRef(0);       // raw SVG pull while dragging

  // active=false → spring-back pending (value still at pulled position)
  // active=true  → user is dragging
  const [ctrl, setCtrl] = useState({ active: false, svg: 0 });
  const dragging = ctrl.active;
  const pullSvg = ctrl.svg;       // displayed visually

  /* ---- pointer events ---- */
  const onDown = useCallback((e: React.PointerEvent) => {
    dragStart_.current = e.clientY;
    rawRef.current = 0;
    setCtrl({ active: true, svg: 0 });
    svgRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const d = (e.clientY - dragStart_.current) * SCALE;
    const clamped = Math.max(0, d);
    rawRef.current = clamped;
    setCtrl(prev => ({ ...prev, svg: clamped }));
  }, [dragging]);

  const onUp = useCallback(() => {
    if (!dragging) return;
    const wasOver = rawRef.current >= TH_SVG;
    const lastPull = rawRef.current;

    // 1) deactivate — spring transition kicks in on next renders
    setCtrl({ active: false, svg: lastPull });

    // 2) next frame — move target to 0, spring animates from lastPull→0
    requestAnimationFrame(() => {
      setCtrl(prev => (prev.active ? prev : { active: false, svg: 0 }));
    });

    if (wasOver) {
      playClick();
      onToggle();
    }
  }, [dragging, onToggle]);

  /* ---- visual helpers ---- */
  const endY = BASE_END + pullSvg;
  const midY = 58 + pullSvg * 0.25;
  const cordPath = `M38 48 Q42 ${midY} 36 ${endY - 1}`;
  const isOver = pullSvg >= TH_SVG;
  const accent = `hsl(${hue}, 80%, 55%)`;
  const pupilOff = isOn ? -1.8 : 1.8;

  return (
    <div
      className="fixed z-50 select-none"
      style={{
        top: `calc(12px + var(--safe-area-top, 0px))`,
        right: `calc(12px + var(--safe-area-right, 0px))`,
        filter: isOn
          ? `drop-shadow(0 0 20px ${accent}44)`
          : "drop-shadow(0 0 6px rgba(0,0,0,0.1))",
      }}
    >
      <svg
        ref={svgRef}
        width={70}
        height={RENDER_H}
        viewBox={`0 0 56 ${VB_H}`}
        style={{ display: "block", touchAction: "none", cursor: "grab" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
      >
        <defs>
          <linearGradient id="aluBase" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6a6a6a" />
            <stop offset="30%" stopColor="#b0b0b0" />
            <stop offset="60%" stopColor="#d0d0d0" />
            <stop offset="100%" stopColor="#8a8a8a" />
          </linearGradient>
          <linearGradient id="aluStem" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#555" />
            <stop offset="40%" stopColor="#bbb" />
            <stop offset="100%" stopColor="#777" />
          </linearGradient>
          <linearGradient id="aluShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8c8c8" />
            <stop offset="100%" stopColor="#8a8a8a" />
          </linearGradient>
          <radialGradient id="glowHalo" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor={isOn ? `${accent}33` : "transparent"} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="sg"><feGaussianBlur in="SourceGraphic" stdDeviation="3" /></filter>
          <filter id="sg2"><feGaussianBlur in="SourceGraphic" stdDeviation="6" /></filter>
        </defs>

        {/* glow */}
        <ellipse cx="28" cy="34" rx="28" ry="26" fill="url(#glowHalo)" filter="url(#sg2)" />

        {/* base shadow */}
        <ellipse cx="28" cy="110" rx="18" ry="3" fill="rgba(0,0,0,0.15)" />
        {/* base */}
        <path d="M13 106 L16 98 L40 98 L43 106 Z" fill="url(#aluBase)" />
        <rect x="22" y="106" width="12" height="2" rx="1" fill={`hsl(${hue}, 60%, 30%)`} opacity={0.7} />
        {/* stem */}
        <rect x="26" y="38" width="4" height="60" rx="2" fill="url(#aluStem)" />

        {/* ——— shade (with eyes) ——— */}
        <g
          style={{
            transformOrigin: "28px 36px",
            transition: "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <path d="M16 22 L40 22 L50 50 L6 50 Z" fill="url(#aluShade)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" filter="url(#sg)" />
          {isOn && <path d="M18 26 L38 26 L46 48 L10 48 Z" fill={`${accent}18`} />}
          <path d="M6 50 L50 50" fill="none" stroke={isOn ? accent : "#666"} strokeWidth="2" strokeLinecap="round" />

          {/* eyes */}
          <ellipse cx="19" cy="34" rx="5" ry="6" fill="#f0f0f0" />
          <circle cx="19" cy={34 + pupilOff} r="2.5" fill={isOn ? "#222" : "#555"} />
          <ellipse cx="37" cy="34" rx="5" ry="6" fill="#f0f0f0" />
          <circle cx="37" cy={34 + pupilOff} r="2.5" fill={isOn ? "#222" : "#555"} />
          {isOn && (
            <>
              <circle cx="17.5" cy="32.5" r="1" fill="white" opacity={0.8} />
              <circle cx="35.5" cy="32.5" r="1" fill="white" opacity={0.8} />
            </>
          )}
        </g>

        {/* light beam */}
        <path d="M10 50 L-2 82 L58 82 L46 50 Z" fill={`${accent}22`} style={{ opacity: isOn ? 1 : 0, transition: "opacity 0.5s ease" }} />
        <path d="M14 50 L6 76 L50 76 L42 50 Z" fill={`${accent}11`} style={{ opacity: isOn ? 1 : 0, transition: "opacity 0.6s ease" }} />

        {/* ——— PULL CORD (stays connected to lamp) ——— */}
        {/* invisible hit area */}
        <path d={cordPath} fill="none" stroke="transparent" strokeWidth="28" strokeLinecap="round" style={{ cursor: "grab" }} pointerEvents="stroke" />

        {/* visible cord — top is FIXED at M38 48, bottom extends when pulled */}
        <motion.path
          d={cordPath}
          animate={{ d: cordPath }}
          transition={
            dragging
              ? { duration: 0 }
              : { type: "spring", stiffness: 220, damping: 18, mass: 0.6 }
          }
          fill="none"
          stroke={isOver ? accent : isOn ? "#b8a060" : "#8a7a5a"}
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ pointerEvents: "none" }}
        />

        {/* toggle ball */}
        <motion.circle
          cx={36}
          cy={endY}
          r={isOver ? 4 : 3.5}
          animate={{ cx: 36, cy: endY, r: isOver ? 4 : 3.5 }}
          transition={
            dragging
              ? { duration: 0 }
              : { type: "spring", stiffness: 220, damping: 18, mass: 0.6 }
          }
          fill={isOver ? accent : isOn ? "#d4a840" : "#b08050"}
          stroke={isOver ? "white" : isOn ? "#8a6e10" : "#7a5a3a"}
          strokeWidth="0.6"
          style={{ pointerEvents: "none" }}
        />
      </svg>
    </div>
  );
};
