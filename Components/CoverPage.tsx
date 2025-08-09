// components/CoverPage.tsx

import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function CoverPage({
  show,
  onFinish,
  colors = {
    bg: "#0b0f14",
    lampOffOutline: "#3ea6ff", // bluish outline when off
    lampOn: "#20c20e",         // green glow when on
    text: "#00adfdff",
  },
}: {
  show: boolean;
  onFinish: () => void;
  colors?: {
    bg: string;
    lampOffOutline: string;
    lampOn: string;
    text: string;
  };
}) {
  const [lampOn, setLampOn] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [progress, setProgress] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  // progress bar config (blocky style like Snake)
  const TOTAL_BLOCKS = 30;
  const filledBlocks = useMemo(
    () => Math.round((progress / 100) * TOTAL_BLOCKS),
    [progress]
  );

  // Lock scroll while cover is shown
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  // Start glow + progress when lamp is clicked
  const handleClickBulb = () => {
    if (lampOn) return;
    setLampOn(true);

    // Animate progress 0 -> 100 over glowMs
    const glowMs = 2000; // keep in sync with glow motion timing below
    startRef.current = null;

    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.min(100, Math.round((elapsed / glowMs) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // After glow completes, slide up
        setSliding(true);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ y: 0 }}
      animate={{ y: sliding ? "-100%" : "0%" }}
      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.8 }}
      onAnimationComplete={() => {
        if (sliding) onFinish();
      }}
      style={{ background: colors.bg }}
    >
      {/* Center content */}
      <div className="h-full w-full flex items-center justify-center relative select-none">
        {/* Radial glow behind lamp (ramps up when lampOn) */}
        <motion.div
          className="absolute"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={lampOn ? { scale: 3.2, opacity: 1 } : { scale: 0.2, opacity: 0.15 }}
          transition={{ duration: 2.0, ease: "easeOut" }} // MUST match glowMs (2000ms)
          style={{
            width: 280,
            height: 280,
            borderRadius: "9999px",
            background: `radial-gradient(closest-side, rgba(32,194,14,0.55), rgba(32,194,14,0.15), rgba(32,194,14,0))`,
            filter: "blur(12px)",
          }}
        />

        {/* Lamp composed with SVG: triangle shade, circle bulb, stem, base */}
        <div className="relative flex flex-col items-center">
          <svg width="200" height="220" viewBox="0 0 200 220" role="img" aria-label="Lamp">
            {/* Triangle shade (pointing down) */}
            <polygon
              points="40,40 160,40 100,115"
              fill={lampOn ? "rgba(32,194,14,0.08)" : "transparent"}
              stroke={lampOn ? colors.lampOn : colors.lampOffOutline}
              strokeWidth="2"
            />
            {/* Bulb (click target) */}
            <g onClick={handleClickBulb} style={{ cursor: "pointer" }}>
              <circle
                cx="100"
                cy="70"
                r="22"
                fill={lampOn ? colors.lampOn : "transparent"}
                stroke={lampOn ? colors.lampOn : colors.lampOffOutline}
                strokeWidth="3"
              />
            </g>
            {/* Stem line from shade tip to base */}
            <line
              x1="100"
              y1="115"
              x2="100"
              y2="175"
              stroke={lampOn ? colors.lampOn : colors.lampOffOutline}
              strokeWidth="2"
            />
            {/* Base line */}
            <line
              x1="70"
              y1="190"
              x2="130"
              y2="190"
              stroke={lampOn ? colors.lampOn : colors.lampOffOutline}
              strokeWidth="3"
            />
          </svg>

          {/* Click hint */}
          <div
            className="font-mono text-sm mt-1"
            style={{ color: colors.text, opacity: lampOn ? 0 : 0.85 }}
          >
            Click The Bulb To Enter
          </div>
        </div>

        {/* Progress area (bottom) */}
        <div
          className="absolute bottom-8 left-10 right-0 flex items-center justify-center"
          aria-hidden={!lampOn}
        >

          {/* Block progress bar */}
          <div className="flex items-center">
            <div
              className="flex items-center"
              style={{
                padding: 4,
                borderRadius: 6,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${colors.lampOffOutline}22`,
              }}
            >
              {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => {
                const filled = i < filledBlocks;
                return (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      marginRight: i === TOTAL_BLOCKS - 1 ? 0 : 4,
                      background: filled ? colors.lampOn : "transparent",
                      border: `1px solid ${filled ? colors.lampOn : colors.lampOffOutline}55`,
                      borderRadius: 2,
                      boxShadow: filled ? `0 0 6px ${colors.lampOn}66` : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Optional "Loading..." text above the bar (kept if you like it) */}
        <motion.div
          className="absolute bottom-16 font-mono text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: lampOn ? 0.9 : 0 }}
          style={{ color: colors.text }}
        >
          Loading... {progress}%
        </motion.div>
      </div>
    </motion.div>
  );
}