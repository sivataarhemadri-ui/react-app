import { useEffect, useMemo } from "react";
import { Sparkles, X } from "lucide-react";

const CONFETTI_COUNT = 30;

export default function RewardModal({ open, reward, onClose, onScratchNow }) {
  useEffect(() => {
    if (!open) return;
    const listener = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [open, onClose]);

  const confetti = useMemo(() => Array.from({ length: CONFETTI_COUNT }, (_, index) => index), []);

  if (!open || !reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((piece) => (
          <span
            key={piece}
            className="absolute block w-2 h-2 rounded-full bg-gradient-to-br from-amber-300 to-fuchsia-500 opacity-90"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 20}%`,
              transform: `translateY(${Math.random() * 20}px)`,
            }}
          />
        ))}
      </div>
      <div className="relative w-full max-w-xl rounded-[32px] bg-white p-8 shadow-2xl ring-1 ring-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-emerald-500 to-indigo-600 p-6 text-white shadow-lg">
          <div className="rounded-3xl bg-white/20 p-3">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em]">Congratulations!</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight">You unlocked a reward</h2>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm text-slate-500">Reward</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{reward.title}</h3>
          <p className="mt-3 text-slate-600">{reward.description}</p>
          {reward.rewardType === "Cashback" && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200">
              {`₹${reward.rewardValue} Cashback`}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onScratchNow}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-emerald-600 to-orange-500 px-6 py-3 text-white shadow-xl hover:brightness-110"
          >
            Scratch Now
          </button>
          <button type="button" onClick={onClose} className="rounded-3xl bg-slate-100 px-6 py-3 text-slate-700 hover:bg-slate-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
