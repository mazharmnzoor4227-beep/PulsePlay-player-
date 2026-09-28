import { engine } from "@/lib/player-engine";
import { useEffect, useRef } from "react";

export function Visualizer({ hue = 205 }: { hue?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const bins = new Uint8Array(128);

    const draw = () => {
      const { width, height } = canvas;
      const analyser = engine.getAnalyser();
      if (analyser) analyser.getByteFrequencyData(bins);
      ctx.clearRect(0, 0, width, height);
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, `hsla(${hue}, 80%, 18%, 1)`);
      g.addColorStop(1, `hsla(${hue}, 40%, 6%, 1)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      const n = 28;
      const gap = 4;
      const w = (width - gap * (n + 1)) / n;
      for (let i = 0; i < n; i++) {
        const v = bins[Math.floor((i / n) * bins.length)] ?? 0;
        const h = Math.max(6, (v / 255) * height * 0.72);
        const x = gap + i * (w + gap);
        ctx.fillStyle = `hsla(${hue}, 90%, ${58 + (v / 255) * 20}%, 0.9)`;
        ctx.beginPath();
        ctx.roundRect(x, height - h - 16, w, h, 4);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.55)`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 64; i++) {
        const v = bins[i] ?? 0;
        const x = (i / 63) * width;
        const y = height * 0.38 - (v / 255) * height * 0.22;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth * devicePixelRatio;
      canvas.height = parent.clientHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [hue]);

  return <canvas ref={ref} className="size-full" />;
}
