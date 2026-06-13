import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bike,
  MapPin,
  Clock,
  Star,
  Award,
  TrendingUp,
  Package,
  CheckCircle,
  Navigation,
  LogOut,
  Zap,
  Heart,
  X,
} from "lucide-react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { heroApi } from "../services/api";

const STATUS_STEPS = ["accepted", "picked_up", "delivering", "delivered"];

export default function FoodHeroDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("opportunities");
  const [stats, setStats] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [mapSelection, setMapSelection] = useState(null);

  const email = location?.state?.email || "hero@foodbridge.org";

  const reload = async () => {
    const [s, o, p] = await Promise.all([
      heroApi.stats(),
      heroApi.opportunities(),
      heroApi.myPickups(),
    ]);
    setStats(s);
    setOpportunities(o);
    setMyPickups(p);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await reload();
      } catch (e) {
        console.error("Failed to load hero data", e);
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
        await reload();
      } catch (e) {
        console.error("Failed to refresh hero opportunities", e);
      }
    };
    window.addEventListener("donation:created", handleDonationCreated);
    window.addEventListener("donation:updated", handleDonationCreated);
    return () => {
      window.removeEventListener("donation:created", handleDonationCreated);
      window.removeEventListener("donation:updated", handleDonationCreated);
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleAccept = async (id) => {
    try {
      await heroApi.accept(id);
      await reload();
      showToast("Pickup accepted! Head to the donor.");
      setTab("active");
    } catch (e) {
      showToast("Failed to accept pickup");
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await heroApi.updateStatus(id, status);
      await reload();
      showToast(`Status updated to ${status.replace("_", " ")}`);
    } catch (e) {
      showToast("Failed to update status");
    }
  };

  const openMap = (item) => setMapSelection(item);
  const closeMap = () => setMapSelection(null);
  const getOsmDirectionLink = (item) => {
    const pickup = item.pickup_location;
    const dropoff = item.dropoff_location;
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${pickup.lat}%2C${pickup.lng}%3B${dropoff.lat}%2C${dropoff.lng}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="text-slate-600 font-medium" data-testid="hero-loading">
          Loading Food Hero dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream" data-testid="food-hero-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold font-heading">Food Hero</h1>
              <p className="text-xs text-slate-500">{email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100"
            data-testid="hero-logout-btn"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex gap-1" data-testid="hero-tabs">
            {[
              { id: "opportunities", label: "Nearby Opportunities", icon: MapPin },
              { id: "active", label: "My Pickups", icon: Package },
              { id: "impact", label: "My Impact", icon: Award },
            ].map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  data-testid={`hero-tab-${t.id}`}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                    active
                      ? "border-yellow-500 text-yellow-600"
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
        {toast && (
          <div
            className="fixed top-24 right-6 z-50 bg-yellow-500 text-white px-4 py-2 rounded-xl shadow-lg animate-fade-in"
            data-testid="hero-toast"
          >
            {toast}
          </div>
        )}

        {/* Stats strip */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Mini icon={Package} label="Total Pickups" value={stats?.total_pickups ?? 0} color="bg-blue-500" testid="hero-stat-pickups" />
          <Mini icon={Heart} label="Meals Saved" value={stats?.meals_saved ?? 0} color="bg-emerald-500" testid="hero-stat-meals" />
          <Mini icon={Star} label="Rating" value={(stats?.rating ?? 0).toFixed(1)} color="bg-yellow-500" testid="hero-stat-rating" />
          <Mini icon={Zap} label="Hero Points" value={stats?.points ?? 0} color="bg-purple-500" testid="hero-stat-points" />
        </div>

        {mapSelection && <MapModal item={mapSelection} onClose={closeMap} externalLink={getOsmDirectionLink(mapSelection)} />}
        {tab === "opportunities" && (
          <Opportunities opportunities={opportunities} onAccept={handleAccept} onMapView={openMap} />
        )}
        {tab === "active" && (
          <ActivePickups pickups={myPickups} onUpdate={handleStatus} onMapView={openMap} onOpenMaps={getOsmDirectionLink} />
        )}
        {tab === "impact" && <ImpactTab stats={stats} pickups={myPickups} />}
      </main>
    </div>
  );
}

function Mini({ icon: Icon, label, value, color, testid }) {
  return (
    <div
      className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex items-center gap-4"
      data-testid={testid}
    >
      <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-extrabold font-heading">{value}</p>
      </div>
    </div>
  );
}

function MapModal({ item, onClose, externalLink }) {
  const pickup = item.pickup_location;
  const dropoff = item.dropoff_location;
  const [userPos, setUserPos] = useState(null);
  const [geoError, setGeoError] = useState("");

  // route: if we have user position, route from user -> pickup. Otherwise fallback pickup -> dropoff
  const route = userPos
    ? [
        [userPos.lat, userPos.lng],
        [pickup.lat, pickup.lng],
      ]
    : [
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng],
      ];
  const center = userPos
    ? [(userPos.lat + pickup.lat) / 2, (userPos.lng + pickup.lng) / 2]
    : [(pickup.lat + dropoff.lat) / 2, (pickup.lng + dropoff.lng) / 2];

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    let mounted = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted) return;
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (error) => {
        if (!mounted) return;
        if (error.code === 1) {
          setGeoError("Location access denied. Showing the default pickup/dropoff route.");
        } else if (error.code === 2) {
          setGeoError("Unable to determine your location. Showing the default route.");
        } else if (error.code === 3) {
          setGeoError("Location request timed out. Showing the default route.");
        } else {
          setGeoError(error.message || "Unable to get your location. Showing the default route.");
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );

    return () => {
      mounted = false;
    };
  }, []);

  const getLocalOsmLink = () => {
    if (userPos) {
      return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userPos.lat}%2C${userPos.lng}%3B${pickup.lat}%2C${pickup.lng}`;
    }
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${pickup.lat}%2C${pickup.lng}%3B${dropoff.lat}%2C${dropoff.lng}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold">Map preview</h2>
            <p className="text-sm text-slate-500">Pickup and dropoff route</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-slate-100 grid place-items-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Pickup</p>
              <p className="font-medium mt-1">{item.pickup_address}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Dropoff</p>
              <p className="font-medium mt-1">{item.dropoff_address}</p>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            Distance: {item.distance_km?.toFixed(1)} km
          </div>

          {geoError && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {geoError}
            </div>
          )}

          <div className="rounded-3xl overflow-hidden border border-slate-200 h-72">
            <MapContainer center={center} bounds={userPos ? [...route, [userPos.lat, userPos.lng]] : route} zoom={13} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline pathOptions={{ color: "#2563eb", weight: 4 }} positions={route} />
              {/* start marker */}
              <CircleMarker center={route[0]} pathOptions={{ color: "#0ea5e9" }} radius={8}>
                <Popup>{userPos ? "You" : "Pickup"}</Popup>
              </CircleMarker>
              {/* end marker */}
              <CircleMarker center={route[1]} pathOptions={{ color: "#16a34a" }} radius={8}>
                <Popup>{userPos ? "Pickup" : "Dropoff"}</Popup>
              </CircleMarker>
              {/* show explicit user marker when available */}
              {userPos && (
                <Marker position={[userPos.lat, userPos.lng]}>
                  <Popup>Your location</Popup>
                </Marker>
              )}
              {/* show dropoff marker if we are routing to pickup only */}
              {!userPos && dropoff && (
                <Marker position={[dropoff.lat, dropoff.lng]}>
                  <Popup>Dropoff</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          <div className="mt-3 rounded-md px-3">
            <label className="block text-xs text-slate-500 mb-1">Pickup address</label>
            <div className="flex gap-2">
              <input readOnly value={item.pickup_address} className="flex-1 rounded-xl border border-slate-200 p-2 text-sm" />
              <button onClick={() => navigator.clipboard?.writeText(item.pickup_address)} className="rounded-xl px-3 py-2 bg-slate-900 text-white text-sm">Copy</button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href={getLocalOsmLink()}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center rounded-2xl bg-slate-900 text-white py-3 font-semibold hover:bg-slate-800"
            >
              Open in OpenStreetMap
            </a>
            <button
              onClick={onClose}
              className="w-full rounded-2xl border border-slate-200 py-3 text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Opportunities({ opportunities, onAccept, onMapView }) {
  if (opportunities.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
        <p className="text-slate-500">No nearby pickups right now. Check back soon!</p>
      </div>
    );
  }
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
      {opportunities.map((o) => (
        <div
          key={o.id}
          data-testid={`opportunity-${o.id}`}
          className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-lg transition"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg font-heading">{o.food_name}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              {o.distance_km} km
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Donor: <span className="font-semibold">{o.donor_name}</span>
          </p>
          {o.donor_phone && (
            <p className="text-sm text-slate-600">
              Phone: <span className="font-semibold">{o.donor_phone}</span>
            </p>
          )}
          <p className="text-sm text-slate-600">
            NGO: <span className="font-semibold">{o.ngo_name}</span>
          </p>
          <p className="text-sm text-slate-600">Qty: {o.quantity}</p>
          <div className="text-xs text-slate-500 mt-3 space-y-1">
            <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {o.pickup_address}</div>
            <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {o.pickup_time}</div>
            <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{o.reward_points} hero points</div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => onMapView(o)}
              className="w-full border border-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-50"
            >
              View on map
            </button>
            <button
              onClick={() => onAccept(o.id)}
              data-testid={`accept-pickup-${o.id}`}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 rounded-xl font-semibold hover:scale-[1.02] transition"
            >
              Accept Pickup
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivePickups({ pickups, onUpdate, onMapView, onOpenMaps }) {
  if (pickups.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
        <p className="text-slate-500">You haven't accepted any pickups yet.</p>
      </div>
    );
  }

  const statusActionLabel = {
    accepted: "Mark as picked up",
    picked_up: "Mark as delivering",
    delivering: "Mark as delivered",
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {pickups.map((p) => {
        const stepIdx = STATUS_STEPS.indexOf(p.status);
        const nextStatus = STATUS_STEPS[stepIdx + 1];
        return (
          <div
            key={p.id}
            data-testid={`mypickup-${p.id}`}
            className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div>
                <h3 className="font-bold text-lg font-heading">{p.food_name}</h3>
                <p className="text-sm text-slate-500">
                  {p.donor_name} → {p.ngo_name}
                </p>
                {p.donor_phone && (
                  <p className="text-xs text-slate-500 mt-1">Phone: {p.donor_phone}</p>
                )}
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 capitalize font-semibold">
                {p.status.replace("_", " ")}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600 mb-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {p.pickup_address}</div>
                <div className="text-xs text-slate-500">Distance: {p.distance_km?.toFixed(1)} km</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2"><Navigation className="w-4 h-4 text-slate-400" /> {p.dropoff_address}</div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => onMapView(p)}
                    className="text-slate-700 border border-slate-200 rounded-xl px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    View on map
                  </button>
                  <a
                    href={onOpenMaps(p)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-700 border border-slate-200 rounded-xl px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Open in maps
                  </a>
                </div>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
              {STATUS_STEPS.map((s, idx) => (
                <div
                  key={s}
                  className={`rounded-full px-3 py-2 text-center font-semibold ${
                    idx === stepIdx
                      ? "bg-blue-600 text-white"
                      : idx < stepIdx
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {s.replace("_", " ")}
                </div>
              ))}
            </div>

            {nextStatus ? (
              <button
                onClick={() => onUpdate(p.id, nextStatus)}
                data-testid={`update-status-${p.id}`}
                className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-semibold hover:bg-slate-800"
              >
                {statusActionLabel[p.status] || `Mark as ${nextStatus.replace("_", " ")}`}
              </button>
            ) : (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold text-center">
                Pickup completed
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ImpactTab({ stats, pickups }) {
  const completed = pickups.filter((p) => p.status === "delivered").length;
  const badges = [
    { name: "First Rescue", earned: (stats?.total_pickups ?? 0) >= 1, icon: "🥇" },
    { name: "10 Meals Saved", earned: (stats?.meals_saved ?? 0) >= 10, icon: "🍱" },
    { name: "100 Meals Saved", earned: (stats?.meals_saved ?? 0) >= 100, icon: "🏆" },
    { name: "Eco Warrior", earned: (stats?.points ?? 0) >= 200, icon: "🌱" },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 text-white shadow-lg">
        <p className="text-white/80 text-sm">Your total impact</p>
        <h2 className="text-5xl font-extrabold font-heading mt-1">
          {stats?.meals_saved ?? 0} meals
        </h2>
        <p className="text-white/90 mt-2">
          That's roughly {Math.round((stats?.meals_saved ?? 0) * 0.5)} kg of CO₂ kept out of the atmosphere.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-3 text-slate-900">
            <p className="text-xs">Completed</p>
            <p className="text-xl font-extrabold">{completed}</p>
          </div>
          <div className="glass rounded-2xl p-3 text-slate-900">
            <p className="text-xs">Rating</p>
            <p className="text-xl font-extrabold">★ {(stats?.rating ?? 0).toFixed(1)}</p>
          </div>
          <div className="glass rounded-2xl p-3 text-slate-900">
            <p className="text-xs">Points</p>
            <p className="text-xl font-extrabold">{stats?.points ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 font-heading">Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="badges">
          {badges.map((b) => (
            <div
              key={b.name}
              className={`rounded-2xl p-4 text-center border ${
                b.earned
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-slate-50 border-slate-200 opacity-50"
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <p className="text-xs font-semibold mt-2">{b.name}</p>
              <p className={`text-[10px] mt-1 ${b.earned ? "text-yellow-700" : "text-slate-500"}`}>
                {b.earned ? "Earned" : "Locked"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
