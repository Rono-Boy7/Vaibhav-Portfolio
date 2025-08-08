// components/SnakeGame.tsx

import React, { useEffect, useRef, useState } from "react";

type Colors = {
  bg: string;
  grid: string;
  snake: string;
  snakeHead: string;
  food: string;
  text: string;
  accent: string;
};

export default function SnakeGame({
  onExit,
  colors,
}: {
  onExit: () => void;
  colors: Colors;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cellSize = 16;
  const tickMs = 90;
  const gridPadding = 8;

  const [score, setScore] = useState(0);
  const [muted, setMuted] = useState(false); // 🔇 mute state

  const dirRef = useRef({ x: 1, y: 0 });
  const nextDirRef = useRef({ x: 1, y: 0 });
  const snakeRef = useRef([{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }]);
  const foodRef = useRef({ x: 10, y: 8 });
  const gridRef = useRef({ cols: 0, rows: 0 });
  const timerRef = useRef<number | null>(null);

  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const ensureAudio = async () => {
    if (!audioCtxRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      if (!Ctx) return;
      audioCtxRef.current = new Ctx();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = muted ? 0 : 0.06; // volume respects mute state
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === "suspended") {
      try { await audioCtxRef.current.resume(); } catch {}
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setMuted((prev) => {
      const newMute = !prev;
      if (masterGainRef.current) {
        masterGainRef.current.gain.value = newMute ? 0 : 0.06;
      }
      return newMute;
    });
  };

  const tone = (freq: number, dur: number, type: OscillatorType = "sine", vol = 1, startOffset = 0) => {
    if (muted) return; // respect mute state
    const ctx = audioCtxRef.current;
    const gainMaster = masterGainRef.current;
    if (!ctx || !gainMaster) return;
    const t0 = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.8 * vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(gain);
    gain.connect(gainMaster);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  };

  const playStep = () => tone(900, 0.03, "square", 0.5);
  const playEat = () => {
    tone(380, 0.06, "triangle", 0.9, 0);
    tone(520, 0.08, "triangle", 0.9, 0.05);
  };
  const playGameOver = () => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master || muted) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, t0);
    osc.frequency.exponentialRampToValueAtTime(120, t0 + 0.6);
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.linearRampToValueAtTime(0.5, t0 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + 0.62);
  };

  // Resize and grid
  const resize = () => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const w = Math.floor((wrapper.clientWidth - gridPadding * 2) / cellSize) * cellSize + gridPadding * 2;
    const h = Math.floor((wrapper.clientHeight - 64 - gridPadding * 2) / cellSize) * cellSize + gridPadding * 2;

    canvas.width = Math.max(w, cellSize * 16 + gridPadding * 2);
    canvas.height = Math.max(h, cellSize * 14 + gridPadding * 2);

    const cols = Math.floor((canvas.width - gridPadding * 2) / cellSize);
    const rows = Math.floor((canvas.height - gridPadding * 2) / cellSize);
    gridRef.current = { cols, rows };
  };

  const placeFood = () => {
    const { cols, rows } = gridRef.current;
    if (cols === 0 || rows === 0) return;
    while (true) {
      const fx = Math.floor(Math.random() * cols);
      const fy = Math.floor(Math.random() * rows);
      if (!snakeRef.current.some((s) => s.x === fx && s.y === fy)) {
        foodRef.current = { x: fx, y: fy };
        break;
      }
    }
  };

  const draw = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { cols, rows } = gridRef.current;

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c++) {
      const x = gridPadding + c * cellSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, gridPadding);
      ctx.lineTo(x, gridPadding + rows * cellSize);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      const y = gridPadding + r * cellSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(gridPadding, y);
      ctx.lineTo(gridPadding + cols * cellSize, y);
      ctx.stroke();
    }

    ctx.fillStyle = colors.food;
    ctx.fillRect(
      gridPadding + foodRef.current.x * cellSize + 2,
      gridPadding + foodRef.current.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4
    );

    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? colors.snakeHead : colors.snake;
      ctx.fillRect(
        gridPadding + seg.x * cellSize + 1,
        gridPadding + seg.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    });

    ctx.fillStyle = colors.text;
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.fillText(`Score: ${score}  (Use Arrow Keys To Control Snake)`, gridPadding, 14);
  };

  const step = () => {
    const cur = dirRef.current;
    const nxt = nextDirRef.current;
    if (cur.x + nxt.x !== 0 || cur.y + nxt.y !== 0) {
      dirRef.current = nxt;
    }

    const { cols, rows } = gridRef.current;
    const head = snakeRef.current[0];
    const newHead = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

    newHead.x = (newHead.x + cols) % cols;
    newHead.y = (newHead.y + rows) % rows;

    if (snakeRef.current.some((s, i) => i !== 0 && s.x === newHead.x && s.y === newHead.y)) {
      playGameOver();
      snakeRef.current = [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }];
      dirRef.current = { x: 1, y: 0 };
      nextDirRef.current = { x: 1, y: 0 };
      setScore(0);
      placeFood();
      draw();
      return;
    }

    snakeRef.current = [newHead, ...snakeRef.current];

    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      setScore((s) => s + 1);
      playEat();
      placeFood();
    } else {
      snakeRef.current.pop();
      playStep();
    }

    draw();
  };

  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      await ensureAudio();

      if (e.key === "Escape") {
        onExit();
        return;
      }
      if (e.key.toLowerCase() === "m") {
        toggleMute();
        return;
      }
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") nextDirRef.current = { x: 0, y: -1 };
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") nextDirRef.current = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") nextDirRef.current = { x: -1, y: 0 };
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") nextDirRef.current = { x: 1, y: 0 };
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onPointer = () => { ensureAudio(); };
    el.addEventListener("pointerdown", onPointer);
    return () => el.removeEventListener("pointerdown", onPointer);
  }, []);

  useEffect(() => {
    resize();
    placeFood();
    draw();
    const onResize = () => {
      resize();
      draw();
    };
    window.addEventListener("resize", onResize);

    timerRef.current = window.setInterval(step, tickMs);

    return () => {
      window.removeEventListener("resize", onResize);
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="h-full w-full relative" style={{ background: colors.bg }}>
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2"
        style={{ color: colors.text }}
      >
        <div className="font-mono text-sm">
          <span style={{ color: colors.snakeHead }}>Snake</span>{" "}
          <span style={{ color: colors.text }}>
            | Score: {score} (Use Arrow Keys To Control Snake)
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleMute}
            className="font-mono text-xs px-2 py-1 rounded"
            style={{
              background: "transparent",
              border: `1px solid ${colors.accent}`,
              color: colors.accent,
            }}
            title="M"
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={onExit}
            className="font-mono text-xs px-2 py-1 rounded"
            style={{
              background: "transparent",
              border: `1px solid ${colors.accent}`,
              color: colors.accent,
            }}
            title="Esc"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ top: 32 }} />
    </div>
  );
}