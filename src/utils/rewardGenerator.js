// realistic reward pool using the brands and offers requested
const rewardPool = [
  { title: "KFC Offer", rewardType: "Cashback", rewardValue: 0, category: "Cashback", weight: 20, description: "50% OFF up to ₹50 - Above ₹199", brand: "KFC", rewardText: "50% OFF up to ₹50", condition: "Above ₹199", expiry: "31 Jul 2026" },
  { title: "Domino's Offer", rewardType: "Cashback", rewardValue: 0, category: "Cashback", weight: 15, description: "33% OFF up to ₹200 - Above ₹400", brand: "Domino's", rewardText: "33% OFF up to ₹200", condition: "Above ₹400", expiry: "11 Jul 2026" },
  { title: "Amazon Pay Cashback", rewardType: "Cashback", rewardValue: 10, category: "Cashback", weight: 20, description: "₹10 Cashback on recharge above ₹20", brand: "Amazon Pay", rewardText: "₹10 Cashback", condition: "Recharge above ₹20", expiry: "30 Jun 2026" },
  { title: "Swiggy Offer", rewardType: "Cashback", rewardValue: 100, category: "Cashback", weight: 15, description: "₹100 OFF - Above ₹499", brand: "Swiggy", rewardText: "₹100 OFF", condition: "Above ₹499", expiry: "15 Jul 2026" },

  // badges (approx 20%)
  { title: "Food Hero Badge", rewardType: "Badge", rewardValue: 0, category: "Badge", weight: 12, description: "Special Badge for helping reduce food waste", brand: "FoodBridge", rewardText: "Food Hero Badge", condition: "For helping reduce food waste", expiry: "Never" },
  { title: "Gold Donor Badge", rewardType: "Badge", rewardValue: 0, category: "Badge", weight: 8, description: "Elite donor badge for consistent support", brand: "FoodBridge", rewardText: "Gold Donor Badge", condition: "Consistent donors", expiry: "Never" },

  // special (approx 10%)
  { title: "Volunteer Star Badge", rewardType: "Special", rewardValue: 0, category: "Special Reward", weight: 5, description: "Special recognition for delivery heroes", brand: "FoodBridge", rewardText: "Volunteer Star Badge", condition: "Volunteers only", expiry: "Never" },
  { title: "Mystery Gift", rewardType: "Special", rewardValue: 0, category: "Special Reward", weight: 5, description: "A surprise reward unlocked for you", brand: "FoodBridge", rewardText: "Mystery Gift", condition: "Random", expiry: "Varies" },
];

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return items[0];
}

export function generateRewardCard(eventType = "donation") {
  const selected = weightedRandom(rewardPool);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const title = selected.title;
  const rewardValue = selected.rewardValue;
  const rewardType = selected.rewardType;
  const category = selected.category;
  const description = selected.description;
  const brand = selected.brand || "FoodBridge";
  const rewardText = selected.rewardText || "Reward";
  const condition = selected.condition || "";
  const expiry = selected.expiry || "";

  return {
    id,
    title,
    rewardType,
    rewardValue,
    category,
    description,
    brand,
    rewardText,
    condition,
    expiry,
    status: "available",
    generatedAt: new Date().toISOString(),
    eventType,
    earnedAt: new Date().toISOString(),
  };
}

export function formatRewardLabel(card) {
  if (!card) return "Reward";
  if (card.rewardType === "Cashback") return `₹${card.rewardValue} Cashback`;
  return card.title;
}

export function formatRewardSummary(cards = []) {
  const available = cards.filter((card) => card.status === "available").length;
  const scratched = cards.filter((card) => card.status === "unlocked").length;
  const collected = cards.filter((card) => card.status === "collected").length;
  const totalCashback = cards.reduce((sum, card) => sum + (card.rewardType === "Cashback" ? card.rewardValue : 0), 0);
  return { available, scratched, redeemed: collected, totalCashback, totalRewards: cards.length };
}
