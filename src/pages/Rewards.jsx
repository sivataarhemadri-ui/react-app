import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Trophy, Gift, TrendingUp, ShieldCheck } from "lucide-react";
import { createRewardForEvent, getRewardCards, getRewardStats, markRewardScratched, markRewardRedeemed, claimDailyLoginReward } from "../services/rewardService";
import RewardCard from "../components/RewardCard";
import RewardModal from "../components/RewardModal";
import ScratchCard from "../components/ScratchCard";
import { formatRewardLabel } from "../utils/rewardGenerator";

export default function Rewards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [activeReward, setActiveReward] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [freshPanel, setFreshPanel] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = () => {
    setCards(getRewardCards());
  };

  const handleGenerateReward = (eventType) => {
    const reward = createRewardForEvent(eventType);
    setCards((current) => [reward, ...current]);
    setActiveReward(reward);
    setModalOpen(true);
  };

  const handleDailyLogin = () => {
    const reward = claimDailyLoginReward();
    if (!reward) {
      setFreshPanel(true);
      return;
    }
    setCards((current) => [reward, ...current]);
    setActiveReward(reward);
    setModalOpen(true);
  };

  const handleReveal = (cardId) => {
    markRewardScratched(cardId);
    loadCards();
  };

  const stats = useMemo(() => getRewardStats(), [cards]);
  const availableCards = cards.filter((card) => card.status === "available");
  const scratchedCards = cards.filter((card) => card.status === "unlocked");

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">
      <RewardModal
        open={modalOpen}
        reward={activeReward}
        onClose={() => setModalOpen(false)}
        onScratchNow={() => setModalOpen(false)}
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 grid gap-6 rounded-[32px] bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-2xl sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Rewards Center</p>
            <h1 className="mt-4 text-4xl font-bold">Reward Dashboard</h1>
            <p className="mt-3 text-slate-300">Track scratch cards, redeem rewards, and unlock instant cashback like Amazon Pay or PhonePe.</p>
          </div>
          <div className="grid gap-4 rounded-[28px] bg-white/10 p-6">
            <button
              type="button"
              onClick={() => handleGenerateReward("donation")}
              className="rounded-3xl bg-white/10 px-5 py-4 text-left transition hover:bg-white/20"
            >
              <div className="flex items-center gap-3">
                <Gift className="h-6 w-6 text-amber-300" />
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-200">New donation reward</p>
                  <p className="mt-1 text-slate-100">Generate a reward for a donor submission.</p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleGenerateReward("approval")}
              className="rounded-3xl bg-white/10 px-5 py-4 text-left transition hover:bg-white/20"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-sky-300" />
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-200">Donation approval</p>
                  <p className="mt-1 text-slate-100">Create a reward when donations are approved.</p>
                </div>
              </div>
            </button>
          </div>
          <div className="grid gap-4 rounded-[28px] bg-white/10 p-6">
            <button
              type="button"
              onClick={() => handleGenerateReward("delivery")}
              className="rounded-3xl bg-white/10 px-5 py-4 text-left transition hover:bg-white/20"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-emerald-300" />
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-200">Volunteer delivery</p>
                  <p className="mt-1 text-slate-100">Simulate a delivery completion reward.</p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={handleDailyLogin}
              className="rounded-3xl bg-white/10 px-5 py-4 text-left transition hover:bg-white/20"
            >
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-pink-300" />
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-200">Daily login reward</p>
                  <p className="mt-1 text-slate-100">Claim your daily reward and keep streaks going.</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <RewardCard title="Total Rewards" value={stats.totalRewards} subtitle="Cards generated so far" icon={<Sparkles />} accent="from-fuchsia-500 to-violet-500" />
          <RewardCard title="Available" value={stats.available} subtitle="Scratch cards waiting" icon={<Gift />} accent="from-emerald-500 to-teal-500" />
          <RewardCard title="Scratched" value={stats.scratched} subtitle="Rewards ready to redeem" icon={<ShieldCheck />} accent="from-sky-500 to-indigo-500" />
          <RewardCard title="Redeemed" value={stats.redeemed} subtitle="Rewards already used" icon={<TrendingUp />} accent="from-amber-500 to-orange-500" />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <section className="rounded-[32px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Active Scratch Cards</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">Available rewards</h2>
                </div>
                <button onClick={() => navigate("/rewards/history")} className="rounded-3xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                  View History
                </button>
              </div>
              {availableCards.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                  No scratch cards available yet. Generate an event reward above.
                </div>
              ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {availableCards.map((card) => (
                    <ScratchCard
                      key={card.id}
                      card={card}
                      onReveal={() => handleReveal(card.id)}
                      onRedeem={() => {
                        markRewardRedeemed(card.id);
                        loadCards();
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[32px] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">Reward insights</h2>
              <p className="mt-3 text-slate-600">Your rewards follow a balanced mix of cashback, badges, and surprise benefits.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Cashback earned</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">₹{stats.totalCashback}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Scratch threshold</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">70%</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Daily reward</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">Fast</p>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Reward collection</h2>
            <div className="mt-4 space-y-4">
              {cards.slice(0, 5).map((card) => (
                <div key={card.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{formatRewardLabel(card)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{card.status}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">{card.eventType}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{card.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {freshPanel && (
          <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
            <p className="font-semibold">Daily reward already claimed.</p>
            <p className="mt-2 text-sm">Come back tomorrow for another streak reward.</p>
          </div>
        )}
      </div>
    </div>
  );
}
