import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight, Gift, Copy } from "lucide-react";

export default function ScratchCard({ card, onReveal, onRedeem }) {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [revealed, setRevealed] = useState(card.status !== "available");
  const [copyStatus, setCopyStatus] = useState("");
  const sparkleGlints = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        left: `${Math.random() * 90 + 5}%`,
        top: `${Math.random() * 90 + 5}%`,
        blur: `${Math.random() * 2 + 1}px`,
      })),
    []
  );

  useEffect(() => {
    const status = card.status ?? "available";
    setRevealed(status !== "available");
    setCopyStatus("");

    if (status === "available") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, "#d4d4d4");
      gradient.addColorStop(0.4, "#f3f3f3");
      gradient.addColorStop(1, "#b8b8b8");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.fillStyle = "rgba(255,255,255,0.1)";
      for (let i = 0; i < 90; i++) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        const w = 2 + Math.random() * 8;
        const h = 1 + Math.random() * 3;
        ctx.fillRect(x, y, w, h);
      }

      ctx.fillStyle = "#111827";
      ctx.font = "700 19px Inter";
      ctx.textAlign = "center";
      ctx.fillText("SCRATCH HERE", rect.width / 2, rect.height / 2 - 8);
    }
  }, [card.id, card.status]);

  const computeScratchPercentage = (context, width, height) => {
    try {
      const imageData = context.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let scratched = 0;
      let total = 0;
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          total += 1;
          const idx = (y * width + x) * 4;
          if (pixels[idx + 3] < 128) scratched += 1;
        }
      }
      return scratched / total;
    } catch (err) {
      return 0;
    }
  };

  const scratchAt = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext("2d");
    const radius = 36;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";

    const percentage = computeScratchPercentage(ctx, canvas.width, canvas.height);
    if (percentage > 0.62) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setRevealed(true);
      onReveal?.(card.id);
    }
  };

  const handlePointerDown = (event) => {
    if (revealed || card.status !== "available") return;
    setIsScratching(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    scratchAt((event.clientX - rect.left) * (canvas.width / rect.width), (event.clientY - rect.top) * (canvas.height / rect.height));
  };

  const handlePointerMove = (event) => {
    if (!isScratching) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    scratchAt((event.clientX - rect.left) * (canvas.width / rect.width), (event.clientY - rect.top) * (canvas.height / rect.height));
  };

  const handlePointerUp = () => {
    setIsScratching(false);
  };

  const handleCopyCode = async () => {
    if (!card.code) return;
    try {
      await navigator.clipboard.writeText(card.code);
      setCopyStatus("Copied");
      window.setTimeout(() => setCopyStatus(""), 1500);
    } catch {
      setCopyStatus("Unable to copy");
      window.setTimeout(() => setCopyStatus(""), 1500);
    }
  };

  const displayReward = card.rewardText || (card.rewardType === "Cashback" ? `₹${card.rewardValue} Cashback` : card.title);
  const status = card.status ?? "available";
  const statusLabel = status === "available" ? "Scratch to unlock" : status === "unlocked" ? "Ready to collect" : "Collected";

  return (
    <div className="rounded-[32px] border border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 shadow-2xl shadow-slate-950/30">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
            <Sparkles size={14} /> Scratch Ticket
          </div>
          <h3 className="text-2xl font-semibold text-white">{card.title}</h3>
          <p className="max-w-xl text-sm leading-6 text-slate-300">{card.description || "Your reward is waiting behind the silver panel."}</p>
        </div>
        <div className="rounded-full bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-200">{statusLabel}</div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-slate-700 bg-slate-950 p-5 text-white shadow-inner shadow-slate-950/20">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-300">{card.brand || "FoodBridge"}</div>
            <p className="text-3xl font-bold tracking-tight text-white">{displayReward}</p>
            <p className="text-sm text-slate-400">{card.condition || "Redeem within 7 days"}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/90 p-3">
                <p className="text-[10px] uppercase tracking-[0.32em] text-slate-500">Expires</p>
                <p className="mt-2 text-sm font-semibold text-white">{card.expiry || "7 days"}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 p-3">
                <p className="text-[10px] uppercase tracking-[0.32em] text-slate-500">Type</p>
                <p className="mt-2 text-sm font-semibold text-white">{card.rewardType || "Reward"}</p>
              </div>
            </div>
            {revealed && card.code && (
              <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-3">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-100">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Reward code</p>
                    <p className="mt-2 font-semibold tracking-[0.05em] text-white">{card.code}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/95 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400"
                  >
                    <Copy size={14} /> {copyStatus || "COPY"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900 p-4">
          {revealed && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-slate-950/10 to-slate-950/10" />
          )}
          {revealed && (
            <div className="pointer-events-none absolute inset-x-0 top-4 grid place-items-center">
              <div className="h-2 w-20 rounded-full bg-emerald-300/30" />
            </div>
          )}
          {revealed && (
            <div className="pointer-events-none absolute inset-0">
              {sparkleGlints.map((glint, index) => (
                <span
                  key={index}
                  className="absolute block h-2 w-2 rounded-full bg-emerald-300/70 blur-sm"
                  style={{ left: glint.left, top: glint.top, filter: `blur(${glint.blur})` }}
                />
              ))}
            </div>
          )}

          {revealed ? (
            <div className="relative flex h-72 flex-col items-center justify-center gap-4 rounded-[24px] border border-emerald-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-center text-white shadow-2xl shadow-emerald-500/20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">YOU WON</p>
              <p className="text-3xl font-bold text-white">{displayReward}</p>
              <p className="max-w-xs text-sm text-slate-300">Use this voucher at checkout or copy the code for your next donation purchase.</p>
              {(card.status === "unlocked" || card.status === "available") && (
                <button
                  type="button"
                  onClick={() => onRedeem?.(card.id)}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/20 hover:brightness-110"
                >
                  <Gift size={16} /> Collect reward
                </button>
              )}
              {card.status === "collected" && <p className="text-sm font-semibold text-emerald-300">This reward has been collected.</p>}
            </div>
          ) : (
            <div
              className="relative h-72 overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_20%)]" />
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
                  <div className="relative z-10 flex h-full items-center justify-center px-6 text-center text-white">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Reveal your reward by scratching the panel.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
