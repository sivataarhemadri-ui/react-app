import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft, CheckCircle2, Clock3, Gift } from "lucide-react";
import { getRewardCards, markRewardRedeemed, getRewardStats } from "../services/rewardService";
import { formatRewardLabel } from "../utils/rewardGenerator";

export default function RewardHistory() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    setCards(getRewardCards());
  }, []);

  const handleRedeem = (cardId) => {
    markRewardRedeemed(cardId);
    setCards(getRewardCards());
  };

  const stats = useMemo(() => getRewardStats(), [cards]);

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={18} /> Back to Rewards
        </button>

        <div className="mb-8 rounded-[32px] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Reward History</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">Rewards you have unlocked</h1>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalRewards}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Collected</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">{stats.redeemed}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Pending</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.scratched}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Reward history table</h2>
              <p className="mt-1 text-sm text-slate-500">See all generated rewards and redeem scratched values.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
              <Gift className="h-4 w-4" /> Reward actions
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Reward</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {cards.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-10 text-center text-slate-500">
                      No rewards yet. Generate one from Rewards Center.
                    </td>
                  </tr>
                ) : (
                  cards.map((card) => (
                    <tr key={card.id} className="border-t border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-4 text-slate-700">{new Date(card.generatedAt).toLocaleString()}</td>
                      <td className="px-4 py-4 text-slate-900">{formatRewardLabel(card)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          card.status === "collected"
                            ? "bg-emerald-100 text-emerald-700"
                            : card.status === "unlocked"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {card.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {card.status === "unlocked" ? (
                          <button
                            type="button"
                            onClick={() => handleRedeem(card.id)}
                            className="rounded-3xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            Redeem
                          </button>
                        ) : (
                          <span className="text-slate-500">{card.status === "collected" ? "Done" : "Scratch first"}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
