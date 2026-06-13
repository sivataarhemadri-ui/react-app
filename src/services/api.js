const BASE_COORD = { lat: 12.972392, lng: 77.593683 };

function randomNearby(point, spread = 0.016) {
  return {
    lat: Number((point.lat + (Math.random() - 0.5) * spread).toFixed(6)),
    lng: Number((point.lng + (Math.random() - 0.5) * spread).toFixed(6)),
  };
}

function getDistanceKm(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function normalizeOpportunity(item) {
  const pickup = item.pickup_location || randomNearby(BASE_COORD, 0.02);
  const dropoff =
    item.dropoff_location ||
    randomNearby({ lat: pickup.lat + 0.01, lng: pickup.lng + 0.01 }, 0.015);
  return {
    ...item,
    pickup_location: pickup,
    dropoff_location: dropoff,
    distance_km:
      item.distance_km ?? Math.max(0.8, Number(getDistanceKm(pickup, dropoff).toFixed(1))),
  };
}

function donationToOpportunity(donation) {
  return normalizeOpportunity({
    id: donation.id,
    food_name: donation.food_name || "Food donation",
    donor_name: donation.donor_name || donation.userName || "Community Donor",
    donor_phone: donation.donor_phone,
    ngo_name: donation.ngo_name || "FoodBridge NGO",
    quantity: donation.quantity || 1,
    pickup_address: donation.pickup_address || "Unknown address",
    dropoff_address: donation.dropoff_address || "FoodBridge Hub, 22 Cedar Ln",
    pickup_time: donation.pickup_date_time || "",
    distance_km: donation.distance_km,
    reward_points: donation.reward_points || Math.max(20, Math.round((donation.quantity || 1) * 2)),
    pickup_location: donation.pickup_location,
    dropoff_location: donation.dropoff_location,
  });
}

let heroOpportunities = [];

let heroPickups = [];

let sharedDonations = [];

function addSharedDonation(donation) {
  const id = donation.id || `donation_${Date.now()}`;
  const existing = sharedDonations.find((d) => d.id === id);
  const normalized = {
    ...donation,
    id,
    status: donation.status || "pending",
    pickup_location: donation.pickup_location || randomNearby(BASE_COORD, 0.02),
    dropoff_location:
      donation.dropoff_location ||
      randomNearby({ lat: BASE_COORD.lat + 0.01, lng: BASE_COORD.lng + 0.01 }, 0.015),
    distance_km:
      donation.distance_km ??
      Math.max(
        0.8,
        Number(
          getDistanceKm(
            donation.pickup_location || BASE_COORD,
            donation.dropoff_location || { lat: BASE_COORD.lat + 0.01, lng: BASE_COORD.lng + 0.01 }
          ).toFixed(1)
        )
      ),
    reward_points: donation.reward_points || Math.max(20, Math.round((donation.quantity || 1) * 2)),
  };
  if (existing) {
    Object.assign(existing, normalized);
    return existing;
  }
  sharedDonations.unshift(normalized);
  return normalized;
}

const heroApi = {
  stats: async () => ({
    total_pickups: heroPickups.length,
    meals_saved: heroPickups.reduce((sum, pickup) => sum + pickup.quantity, 0),
    rating: 4.8,
    points: heroPickups.reduce((sum, pickup) => sum + pickup.quantity * 2, 0),
  }),
  opportunities: async () => {
    const donatedOpportunities = sharedDonations
      .filter((d) => d.status === "pending" || d.status === "approved")
      .map(donationToOpportunity);
    return [...heroOpportunities, ...donatedOpportunities];
  },
  myPickups: async () => [...heroPickups],
  addDonation: async (donation) => addSharedDonation(donation),
  accept: async (id) => {
    const existing = sharedDonations.find((d) => d.id === id);
    let opportunity = heroOpportunities.find((opp) => opp.id === id);
    if (!opportunity && existing) {
      existing.status = "accepted";
      opportunity = donationToOpportunity(existing);
    }
    if (!opportunity) throw new Error("Opportunity not found");
    heroPickups = [
      {
        id: `pickup_${Date.now()}`,
        ...opportunity,
        status: "accepted",
      },
      ...heroPickups,
    ];
    return null;
  },
  updateStatus: async (id, status) => {
    const pickup = heroPickups.find((p) => p.id === id);
    if (!pickup) throw new Error("Pickup not found");
    pickup.status = status;
    if (status === "delivered") {
      const related = sharedDonations.find((d) => d.id === pickup.id || d.id === pickup.id.replace(/^pickup_/, ""));
      if (related) {
        related.status = "delivered";
      }
    }
    return pickup;
  },
};

const ngoApi = {
  stats: async () => ({
    meals_distributed: sharedDonations.reduce(
      (sum, donation) => sum + (donation.status === "accepted" || donation.status === "delivered" ? donation.quantity : 0),
      0
    ),
    beneficiaries: sharedDonations.length,
    active_pickups: sharedDonations.filter((d) => d.status === "accepted").length,
    volunteers: 12,
  }),
  donations: async () => [...sharedDonations],
  volunteers: async () => [],
  pickups: async () => heroPickups,
  analytics: async () => ({ monthly: [], by_category: [] }),
  acceptDonation: async (id) => {
    const donation = sharedDonations.find((d) => d.id === id);
    if (!donation) throw new Error("Donation not found");
    // Mark as approved by NGO so Food Heroes see it as available to accept
    donation.status = "approved";
    return { status: donation.status };
  },
  addDonation: async (donation) => addSharedDonation(donation),
};

export { heroApi, ngoApi };
