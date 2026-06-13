import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, LogOut, Gift, Utensils, Award, Check, Copy, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AVATARS, getAvatar } from "../lib/avatars";
import api, { formatApiErrorDetail } from "../lib/api";
import ScratchCard from "../components/ScratchCard";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarId, setAvatarId] = useState(user?.avatar_id || AVATARS[0].id);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");

  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAvatarId(user.avatar_id || AVATARS[0].id);
    }
  }, [user]);

  const loadDonations = useCallback(async () => {
    try {
      const { data } = await api.get("/donations/me");
      setDonations(data.donations || []);
    } catch (e) {
      setDonations([]);
    } finally {
      setDonationsLoading(false);
    }
  }, []);

  const loadCards = useCallback(async () => {
    try {
      const { data } = await api.get("/scratch-cards/me");
      setCards(data.scratch_cards || []);
    } catch (e) {
      setCards([]);
    } finally {
      setCardsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
    loadCards();
  }, [loadDonations, loadCards]);

  // Refresh donations/cards when external events occur
  useEffect(() => {
    const onUpdate = () => {
      setDonationsLoading(true);
      setCardsLoading(true);
      loadDonations();
      loadCards();
    };
    window.addEventListener('donation:created', onUpdate);
    window.addEventListener('scratch:updated', onUpdate);
    return () => {
      window.removeEventListener('donation:created', onUpdate);
      window.removeEventListener('scratch:updated', onUpdate);
    };
  }, [loadDonations, loadCards]);

  // Scroll to avatar picker when redirected after login
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('chooseAvatar')) {
      setTimeout(() => {
        const el = document.getElementById('avatar-picker');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [location.search]);

  const handleSave = async () => {
    setError("");
    setSavedMsg("");
    setSaving(true);
    const res = await updateProfile({ name, phone: phone || null, avatar_id: avatarId });
    setSaving(false);
    if (res.ok) setSavedMsg("Profile saved!");
    else setError(res.error || "Failed to save");
  };

  const handleScratch = async (cardId) => {
    try {
      const { data } = await api.post(`/scratch-cards/${cardId}/scratch`);
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, code: data.code, status: "unlocked" } : c)));
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || "Failed to scratch");
    }
  };

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 1500);
    } catch {}
  };

  const currentAvatar = getAvatar(avatarId);
  const activeCoupons = cards.filter((c) => c.status === "unlocked" && c.code);
  const totalDonations = donations.length;
  const scratchedCount = cards.filter((c) => c.status === "unlocked").length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <button
            data-testid="profile-back-btn"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button
            data-testid="profile-logout-btn"
            onClick={async () => { await logout(); navigate("/login"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-slate-600">Your profile includes rewards earned from donations and volunteer actions.</div>
          <button
            type="button"
            onClick={() => navigate("/rewards")}
            className="inline-flex items-center justify-center rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500"
          >
            Go to Rewards Center
          </button>
        </div>

        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-28 h-28 rounded-3xl overflow-hidden bg-slate-100 border-4 border-emerald-400 flex-shrink-0">
              <img src={currentAvatar.url} alt={currentAvatar.name} className="w-full h-full object-cover" data-testid="profile-current-avatar" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900" data-testid="profile-name-heading">{user.name}</h1>
              <p className="text-slate-500 mt-1" data-testid="profile-email">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 uppercase">
                {user.role}
              </span>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Coupon Codes</h3>
                {cardsLoading ? (
                  <p className="text-sm text-slate-500">Loading coupons…</p>
                ) : activeCoupons.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeCoupons.map((coupon) => (
                      <button
                        key={coupon.id}
                        type="button"
                        onClick={() => handleCopy(coupon.code)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                      >
                        <Gift className="w-4 h-4 text-orange-500" />
                        <span>{coupon.code}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Scratch your cards to reveal coupon codes.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <StatPill
                icon={<Utensils className="w-5 h-5" />}
                label="Successful Donations"
                value={donationsLoading ? "…" : totalDonations}
                color="bg-emerald-500"
                testId="stat-total-donations"
              />
              <StatPill
                icon={<Gift className="w-5 h-5" />}
                label="Scratch Cards"
                value={cardsLoading ? "…" : cards.length}
                color="bg-orange-500"
                testId="stat-total-cards"
              />
            </div>
          </div>
        </div>

        {/* EDIT PROFILE */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" /> Edit Profile
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
              <input
                data-testid="profile-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
              <input
                data-testid="profile-phone-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Choose Avatar</label>
            <div id="avatar-picker" className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {AVATARS.map((a) => {
                const selected = avatarId === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    data-testid={`profile-avatar-${a.id}`}
                    onClick={() => setAvatarId(a.id)}
                    className={`relative aspect-square rounded-2xl border-2 overflow-hidden bg-slate-50 transition-all ${
                      selected ? "border-emerald-500 scale-105 shadow-lg" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                    {selected && (
                      <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-3 text-sm">{error}</div>}
          {savedMsg && <div data-testid="profile-saved-msg" className="rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-3 text-sm">{savedMsg}</div>}

          <button
            data-testid="profile-save-btn"
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-emerald-600 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-[1.02] transition disabled:opacity-60"
          >
            <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* SCRATCH CARDS */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" /> Your Scratch Cards & Vouchers
            </h2>
            <span className="text-sm text-slate-500" data-testid="scratched-count">
              {scratchedCount} / {cards.length} scratched
            </span>
          </div>

          {cardsLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : cards.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
              <Gift className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No scratch cards yet. Donate food to earn your first one!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="scratch-cards-grid">
              {cards.map((c) => (
                <ScratchCard
                  key={c.id}
                  card={c}
                  onScratch={() => handleScratch(c.id)}
                  onCopy={() => handleCopy(c.code)}
                  copied={copiedCode === c.code && c.code}
                />
              ))}
            </div>
          )}
        </div>

        {/* DONATION HISTORY */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" /> Donation History
          </h2>

          {donationsLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : donations.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-500">No donations yet. Tap "Donate Food" on the dashboard to start.</p>
            </div>
          ) : (
            <div className="overflow-x-auto" data-testid="donations-table">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-slate-600">Food</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-600">Quantity</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-600">Type</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-600">Risk</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="p-3 font-medium">{d.food_name}</td>
                      <td className="p-3">{d.quantity}</td>
                      <td className="p-3">{d.food_type}</td>
                      <td className="p-3">{d.risk || "-"}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 capitalize">
                          {d.status || "successful"}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-slate-500">{d.created_at ? new Date(d.created_at).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value, color, testId }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 flex items-center gap-3 min-w-[180px]">
      <div className={`${color} text-white p-2 rounded-xl`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-slate-900" data-testid={testId}>{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}
