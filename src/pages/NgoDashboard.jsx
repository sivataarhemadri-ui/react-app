import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Utensils,
  Users,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Activity,
  TrendingUp,
  Heart,
  LogOut,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ngoApi } from "../services/api";

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "donations", label: "Donation Requests", icon: Utensils },
  { id: "volunteers", label: "Volunteers & Pickups", icon: Truck },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
];

const PIE_COLORS = ["#16A34A", "#F97316", "#3B82F6", "#A855F7"];

export default function NgoDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const email = location?.state?.email || "ngo@foodbridge.org";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, d, v, p, a] = await Promise.all([
          ngoApi.stats(),
          ngoApi.donations(),
          ngoApi.volunteers(),
          ngoApi.pickups(),
          ngoApi.analytics(),
        ]);
        if (!mounted) return;
        setStats(s);
        setDonations(d);
        setVolunteers(v);
        setPickups(p);
        setAnalytics(a);
      } catch (e) {
        console.error("Failed to load NGO data", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleDonationCreated = async () => {
      try {
        const [s, d, v, p, a] = await Promise.all([
          ngoApi.stats(),
          ngoApi.donations(),
          ngoApi.volunteers(),
          ngoApi.pickups(),
          ngoApi.analytics(),
        ]);
        setStats(s);
        setDonations(d);
        setVolunteers(v);
        setPickups(p);
        setAnalytics(a);
      } catch (e) {
        console.error("Failed to refresh NGO data", e);
      }
    };

    window.addEventListener("donation:created", handleDonationCreated);
    return () => window.removeEventListener("donation:created", handleDonationCreated);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleAccept = async (id) => {
    try {
      const updated = await ngoApi.acceptDonation(id);
      setDonations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: updated.status } : d))
      );
      const s = await ngoApi.stats();
      setStats(s);
      showToast("Donation accepted! Notifying Food Hero...");
      try {
        window.dispatchEvent(new CustomEvent("donation:updated", { detail: { id, status: updated.status } }));
      } catch (e) {}
    } catch (e) {
      showToast("Failed to accept donation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="text-slate-600 font-medium" data-testid="ngo-loading">
          Loading NGO dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream" data-testid="ngo-dashboard">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold font-heading">FoodBridge NGO</h1>
              <p className="text-xs text-slate-500">{email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100"
            data-testid="ngo-logout-btn"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto" data-testid="ngo-tabs">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  data-testid={`ngo-tab-${t.id}`}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                    active
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* TOAST */}
        {toast && (
          <div
            className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg animate-fade-in"
            data-testid="ngo-toast"
          >
            {toast}
          </div>
        )}

        {tab === "overview" && (
          <OverviewTab stats={stats} donations={donations} onAccept={handleAccept} />
        )}
        {tab === "donations" && (
          <DonationsTab donations={donations} onAccept={handleAccept} />
        )}
        {tab === "volunteers" && (
          <VolunteersTab volunteers={volunteers} pickups={pickups} />
        )}
        {tab === "analytics" && <AnalyticsTab analytics={analytics} stats={stats} />}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, testid }) {
  return (
    <div
      className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm"
      data-testid={testid}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-3xl font-extrabold mt-1 font-heading">{value}</h3>
        </div>
        <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ stats, donations, onAccept }) {
  const pending = donations.filter((d) => d.status === "pending").slice(0, 3);
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold font-heading">Welcome back 🌱</h2>
        <p className="text-slate-500 mt-1">
          Track meals, manage volunteers, and grow your impact.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Meals Distributed" value={stats?.meals_distributed ?? 0} icon={Utensils} color="bg-emerald-500" testid="stat-meals" />
        <StatCard title="Beneficiaries" value={stats?.beneficiaries ?? 0} icon={Heart} color="bg-pink-500" testid="stat-beneficiaries" />
        <StatCard title="Active Pickups" value={stats?.active_pickups ?? 0} icon={Truck} color="bg-blue-500" testid="stat-pickups" />
        <StatCard title="Volunteers" value={stats?.volunteers ?? 0} icon={Users} color="bg-purple-500" testid="stat-volunteers" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold font-heading">Pending Donation Requests</h3>
          <span className="text-sm text-slate-500">{pending.length} new</span>
        </div>
        {pending.length === 0 ? (
          <p className="text-slate-500 text-sm">No pending requests. Great job!</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {pending.map((d) => (
              <DonationCard key={d.id} d={d} onAccept={onAccept} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DonationCard({ d, onAccept, compact }) {
  return (
    <div
      className="border border-slate-200 rounded-2xl p-4 hover:border-emerald-400 hover:shadow-md transition bg-white"
      data-testid={`donation-card-${d.id}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-slate-800">{d.food_name}</h4>
        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${
            d.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : d.status === "accepted"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {d.status}
        </span>
      </div>
      <p className="text-sm text-slate-600">From: <span className="font-semibold">{d.donor_name}</span></p>
      {d.donor_phone && (
        <p className="text-sm text-slate-600">Phone: <span className="font-semibold">{d.donor_phone}</span></p>
      )}
      <p className="text-sm text-slate-600">Qty: {d.quantity} • {d.food_type}</p>
      <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
        <MapPin className="w-3 h-3" /> {d.pickup_address}
      </div>
      {!compact && (
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
          <Clock className="w-3 h-3" /> Pickup: {d.pickup_time}
        </div>
      )}
      {d.status === "pending" && (
        <button
          onClick={() => onAccept(d.id)}
          data-testid={`accept-donation-${d.id}`}
          className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-orange-500 text-white text-sm py-2 rounded-xl font-semibold hover:scale-[1.02] transition"
        >
          Accept Donation
        </button>
      )}
    </div>
  );
}

function DonationsTab({ donations, onAccept }) {
  const [filter, setFilter] = useState("all");
  const filtered =
    filter === "all" ? donations : donations.filter((d) => d.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold font-heading">Donation Requests</h2>
        <div className="flex gap-2" data-testid="donation-filters">
          {["all", "pending", "accepted", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              data-testid={`filter-${f}`}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm">No donations in this category.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <DonationCard key={d.id} d={d} onAccept={onAccept} />
          ))}
        </div>
      )}
    </div>
  );
}

function VolunteersTab({ volunteers, pickups }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold font-heading">Volunteers & Pickups</h2>
        <p className="text-slate-500 mt-1">Manage your network of Food Heroes.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 font-heading">Active Volunteers</h3>
          <div className="space-y-3" data-testid="volunteer-list">
            {volunteers.map((v) => (
              <div
                key={v.id}
                data-testid={`volunteer-${v.id}`}
                className="flex items-center justify-between border border-slate-100 rounded-2xl p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                    {v.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{v.name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{v.phone}</span>
                      <span>★ {v.rating}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    v.status === "available"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 font-heading">Active Pickups</h3>
          <div className="space-y-3" data-testid="pickup-list">
            {pickups.length === 0 && (
              <p className="text-sm text-slate-500">No active pickups.</p>
            )}
            {pickups.map((p) => (
              <div
                key={p.id}
                data-testid={`pickup-${p.id}`}
                className="border border-slate-100 rounded-2xl p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">{p.food_name}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Hero: {p.hero_name || "Unassigned"}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3 h-3" /> {p.pickup_address}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab({ analytics, stats }) {
  const pieData = analytics?.category_split || [];
  const weekData = analytics?.weekly_meals || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold font-heading">Impact Analytics</h2>
        <p className="text-slate-500 mt-1">
          Real numbers behind real impact.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Meals Distributed" value={stats?.meals_distributed ?? 0} icon={Utensils} color="bg-emerald-500" testid="analytics-meals" />
        <StatCard title="CO₂ Saved (kg)" value={analytics?.co2_saved ?? 0} icon={Activity} color="bg-blue-500" testid="analytics-co2" />
        <StatCard title="Beneficiaries" value={stats?.beneficiaries ?? 0} icon={Heart} color="bg-pink-500" testid="analytics-beneficiaries" />
        <StatCard title="Donors Reached" value={analytics?.donor_count ?? 0} icon={CheckCircle} color="bg-purple-500" testid="analytics-donors" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 font-heading">Weekly Meals Distributed</h3>
          <div className="h-72" data-testid="weekly-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="meals" fill="#16A34A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 font-heading">Food Category Split</h3>
          <div className="h-72" data-testid="category-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

