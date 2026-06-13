import { generateRewardCard, formatRewardSummary } from "../utils/rewardGenerator";

const STORAGE_KEY = "rewardCards";
const DAILY_LOGIN_KEY = "dailyRewardDate";

export function getRewardCards() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRewardCards(cards) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function addRewardCard(card) {
  const cards = getRewardCards();
  const updated = [card, ...cards];
  saveRewardCards(updated);
  return card;
}

export function updateRewardCard(id, changes = {}) {
  const cards = getRewardCards();
  const updated = cards.map((card) => (card.id === id ? { ...card, ...changes } : card));
  saveRewardCards(updated);
  return updated;
}

export function createRewardForEvent(eventType) {
  const rewardCard = generateRewardCard(eventType);
  addRewardCard(rewardCard);
  return rewardCard;
}

export function markRewardScratched(id) {
  const cards = getRewardCards();
  const updated = cards.map((card) =>
    card.id === id && card.status === "available" ? { ...card, status: "unlocked", scratchedAt: new Date().toISOString() } : card
  );
  saveRewardCards(updated);
  return updated;
}

export function markRewardRedeemed(id) {
  const cards = getRewardCards();
  const updated = cards.map((card) =>
    card.id === id && card.status === "unlocked" ? { ...card, status: "collected", collectedAt: new Date().toISOString() } : card
  );
  saveRewardCards(updated);
  return updated;
}

export function getRewardStats() {
  return formatRewardSummary(getRewardCards());
}

export function claimDailyLoginReward() {
  if (typeof window === "undefined") return null;
  const today = new Date().toISOString().slice(0, 10);
  const lastClaim = window.localStorage.getItem(DAILY_LOGIN_KEY);
  if (lastClaim === today) return null;
  window.localStorage.setItem(DAILY_LOGIN_KEY, today);
  return createRewardForEvent("daily-login");
}
