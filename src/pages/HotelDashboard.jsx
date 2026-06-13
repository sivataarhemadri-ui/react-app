import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Utensils,
  AlertTriangle,
  Users,
  Truck,
  Plus,
  Clock,
  CheckCircle,
  User as UserIcon,
  Gift,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useAuth } from "../contexts/AuthContext";
import { getAvatar } from "../lib/avatars";
import api from "../lib/api";

const donationData = [
  { day: "Mon", meals: 120 },
  { day: "Tue", meals: 180 },
  { day: "Wed", meals: 220 },
  { day: "Thu", meals: 170 },
  { day: "Fri", meals: 260 },
  { day: "Sat", meals: 320 },
  { day: "Sun", meals: 280 },
];

const foodItems = [
  {
    id: 1,
    name: "Veg Biryani",
    quantity: "50 KG",
    freshness: "94%",
    risk: "Low",
    image: "https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Paneer Curry",
    quantity: "20 KG",
    freshness: "78%",
    risk: "Medium",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Fried Rice",
    quantity: "15 KG",
    freshness: "90%",
    risk: "Low",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
  },
];

const ngoRequests = [
  { ngo: "Helping Hands NGO", meals: 120, priority: "High" },
  { ngo: "Hope Shelter", meals: 80, priority: "Medium" },
];

export default function HotelDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [d, c] = await Promise.all([api.get("/donations/me"), api.get("/scratch-cards/me")]);
        if (!mounted) return;
        setTotalDonations(d.data.total || 0);
        setTotalCards(c.data.total || 0);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Refresh totals when donations or scratch-cards change elsewhere
  useEffect(() => {
    const reloadTotals = async () => {
      try {
        const [d, c] = await Promise.all([api.get("/donations/me"), api.get("/scratch-cards/me")]);
        setTotalDonations(d.data.total || 0);
        setTotalCards(c.data.total || 0);
      } catch {}
    };
    window.addEventListener('donation:created', reloadTotals);
    window.addEventListener('scratch:updated', reloadTotals);
    return () => {
      window.removeEventListener('donation:created', reloadTotals);
      window.removeEventListener('scratch:updated', reloadTotals);
    };
  }, []);

  const avatar = getAvatar(user?.avatar_id);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="bg-slate-900 text-white px-6 md:px-8 py-5 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-400 bg-slate-800">
            <img src={avatar.url} alt={user?.name || "Profile"} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">FoodBridge</h1>
            <p className="text-slate-300 text-sm">Hotel Donation Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            data-testid="dashboard-donate-btn"
            onClick={() => navigate("/donate-food")}
            className="bg-gradient-to-r from-emerald-600 to-orange-500 text-white px-4 md:px-5 py-2.5 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Donate Food</span>
          </button>

          <button
            data-testid="dashboard-profile-btn"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-700 border-2 border-emerald-400">
              <img src={avatar.url} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-semibold leading-tight">{user?.name || "Profile"}</span>
              <span className="text-xs text-slate-400 leading-tight">View profile</span>
            </div>
          </button>
        </div>
      </header>

      <div className="p-6 md:p-8">
        {/* STATS */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Your Donations"
            value={String(totalDonations)}
            icon={<Utensils />}
            color="bg-emerald-500"
            testId="stat-your-donations"
          />
          <StatCard
            title="Your Scratch Cards"
            value={String(totalCards)}
            icon={<Gift />}
            color="bg-orange-500"
            testId="stat-your-cards"
          />
          <StatCard title="Pending Requests" value="12" icon={<Users />} color="bg-blue-500" />
          <StatCard title="Deliveries Today" value="24" icon={<Truck />} color="bg-purple-500" />
        </div>

        {/* CHART */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Donation Analytics</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={donationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="meals" stroke="#10b981" strokeWidth={4} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* FOOD INVENTORY */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold">Food Inventory</h2>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-xl">View All</button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {foodItems.map((food) => (
                  <div key={food.id} className="border rounded-3xl overflow-hidden hover:shadow-lg transition">
                    <img src={food.image} alt={food.name} className="h-48 w-full object-cover" />
                    <div className="p-5">
                      <h3 className="font-bold text-lg">{food.name}</h3>
                      <p className="text-slate-500 mt-1">Remaining: {food.quantity}</p>
                      <div className="flex justify-between mt-4">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                          Freshness {food.freshness}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            food.risk === "Low" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {food.risk} Risk
                        </span>
                      </div>
                      <button
                        onClick={() => navigate("/donate-food")}
                        className="w-full mt-5 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800"
                      >
                        Donate Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-bold text-xl mb-4">AI Spoilage Prediction</h2>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="text-red-500" />
                  <div>
                    <h3 className="font-semibold">Paneer Curry</h3>
                    <p className="text-sm text-slate-600">Freshness Score: 72%</p>
                    <p className="text-red-600 font-medium mt-2">Donate within 2 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-bold text-xl mb-4">NGO Requests</h2>
              {ngoRequests.map((ngo, index) => (
                <div key={index} className="border rounded-2xl p-4 mb-4">
                  <h3 className="font-semibold">{ngo.ngo}</h3>
                  <p className="text-slate-600">Needs {ngo.meals} meals</p>
                  <span className="inline-block mt-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                    {ngo.priority}
                  </span>
                  <button className="w-full mt-4 bg-emerald-500 text-white py-2 rounded-xl">Approve Request</button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-bold text-xl mb-4">Live Pickup Tracking</h2>
              <div className="space-y-4">
                <TrackingItem icon={<CheckCircle />} text="Volunteer Assigned" />
                <TrackingItem icon={<Package />} text="Food Picked Up" />
                <TrackingItem icon={<Clock />} text="Delivering To NGO" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, testId }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-slate-500">{title}</p>
          <h3 className="text-3xl font-bold mt-2" data-testid={testId}>{value}</h3>
        </div>
        <div className={`${color} text-white p-3 rounded-2xl`}>{icon}</div>
      </div>
    </div>
  );
}

function TrackingItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">{icon}</div>
      <span className="font-medium">{text}</span>
    </div>
  );
}
