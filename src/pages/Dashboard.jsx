import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Award,
  Users,
  LogOut,
  Search,
  Bell,
  CheckCircle2,
  XCircle,
  Download,
  Eye,
  TrendingUp,
  Utensils,
  HeartHandshake,
  FileBadge2,
  Calendar,
  MapPin,
  Building2,
  ChefHat,
  ArrowUpRight,
  Filter,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import Certificate from "../components/Certificate";
import {
  getDonations,
  updateDonation,
  getCertificates,
  saveCertificate,
  buildCertificateNumber,
  formatDateIN,
  MEAL_VALUE,
} from "../lib/donations";

const weeklyTrend = [
  { day: "Mon", meals: 120 },
  { day: "Tue", meals: 180 },
  { day: "Wed", meals: 220 },
  { day: "Thu", meals: 170 },
  { day: "Fri", meals: 260 },
  { day: "Sat", meals: 320 },
  { day: "Sun", meals: 280 },
];

const categoryData = [
  { name: "Rice", value: 320 },
  { name: "Curry", value: 210 },
  { name: "Bread", value: 180 },
  { name: "Fruits", value: 95 },
];

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location?.state?.role || "ngo";
  const userEmail = location?.state?.email || "ngo@foodbridge.org";

  const [tab, setTab] = useState("overview");
  const [donations, setDonations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [previewDonation, setPreviewDonation] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const certRef = useRef(null);

  useEffect(() => {
    setDonations(getDonations());
    setCertificates(getCertificates());
  }, []);

  // Seed a few sample donations if none exist (so dashboard isn't empty on first visit)
  useEffect(() => {
    if (getDonations().length === 0) {
      const seed = [
        {
          id: Date.now() - 50000,
          donorName: "Taj Banjara Hotel",
          donorEmail: "manager@tajbanjara.com",
          donorPan: "AABCT1234D",
          foodName: "Veg Biryani",
          quantity: "45",
          foodType: "Veg",
          foodCondition: "Freshly Cooked",
          pickupAddress: "Banjara Hills, Hyderabad",
          pickupDateTime: new Date(Date.now() + 3600000).toISOString(),
          freshness: 92,
          risk: "Low",
          shelfLife: "4 Hours",
          status: "pending",
          submittedAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: Date.now() - 40000,
          donorName: "Aroma Restaurant",
          donorEmail: "owner@aroma.in",
          donorPan: "AAACA9999K",
          foodName: "Paneer Curry",
          quantity: "30",
          foodType: "Veg",
          foodCondition: "Freshly Cooked",
          pickupAddress: "Kukatpally, Hyderabad",
          pickupDateTime: new Date(Date.now() + 7200000).toISOString(),
          freshness: 78,
          risk: "Medium",
          shelfLife: "2 Hours",
          status: "pending",
          submittedAt: new Date(Date.now() - 5400000).toISOString(),
        },
        {
          id: Date.now() - 30000,
          donorName: "Sundar Tiffins",
          donorEmail: "sundar@tiffins.com",
          donorPan: "",
          foodName: "Chapati & Dal",
          quantity: "80",
          foodType: "Veg",
          foodCondition: "Packed Food",
          pickupAddress: "Madhapur, Hyderabad",
          pickupDateTime: new Date(Date.now() - 3600000).toISOString(),
          freshness: 88,
          risk: "Low",
          shelfLife: "3 Hours",
          status: "approved",
          certificateNo: "FB-80G-2025-26-00001",
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      localStorage.setItem("foodbridge_donations", JSON.stringify(seed));
      setDonations(seed);
    }
  }, []);

  const stats = useMemo(() => {
    const totalMeals = donations.reduce((s, d) => s + (parseInt(d.quantity) || 0), 0);
    const pending = donations.filter((d) => (d.status || "pending") === "pending").length;
    const approved = donations.filter((d) => d.status === "approved").length;
    const uniqueDonors = new Set(donations.map((d) => d.donorEmail || d.donorName)).size;
    return { totalMeals, pending, approved, uniqueDonors };
  }, [donations]);

  const filteredDonations = useMemo(() => {
    return donations
      .filter((d) => (filter === "all" ? true : (d.status || "pending") === filter))
      .filter((d) =>
        search
          ? (d.donorName || "").toLowerCase().includes(search.toLowerCase()) ||
            (d.foodName || "").toLowerCase().includes(search.toLowerCase())
          : true
      )
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [donations, filter, search]);

  const showToast = (msg, kind = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = (donation) => {
    const seq = getCertificates().length + 1;
    const { certificateNo, financialYear } = buildCertificateNumber(seq);
    const totalAmount = (parseInt(donation.quantity) || 0) * MEAL_VALUE;

    const cert = {
      id: `cert-${Date.now()}`,
      certificateNo,
      financialYear,
      date: formatDateIN(),
      donorName: donation.donorName || "Anonymous Donor",
      donorEmail: donation.donorEmail || "",
      donorPan: donation.donorPan || "",
      totalAmount,
      items: [
        {
          id: donation.id,
          date: formatDateIN(new Date(donation.submittedAt || Date.now())),
          foodName: donation.foodName,
          quantity: donation.quantity,
          value: totalAmount,
        },
      ],
      donationId: donation.id,
      issuedAt: new Date().toISOString(),
    };

    saveCertificate(cert);
    updateDonation(donation.id, { status: "approved", certificateNo });
    setDonations(getDonations());
    setCertificates(getCertificates());
    setSelectedCert(cert);
    showToast(`Donation approved. 80G certificate ${certificateNo} issued to ${cert.donorName}.`);
  };

  const handleReject = (donation) => {
    updateDonation(donation.id, { status: "rejected" });
    setDonations(getDonations());
    showToast(`Donation from ${donation.donorName} marked as rejected.`, "error");
  };

  const downloadPdf = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const finalHeight = Math.min(imgHeight, pageHeight - 20);
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, finalHeight);
    pdf.save(`80G_Certificate_${selectedCert.certificateNo}.pdf`);
  };

  return (
    <div className="min-h-screen flex bg-[#F7F8FB]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col" data-testid="ngo-sidebar">
        <div className="px-6 py-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-orange-500 flex items-center justify-center text-white">
              <HeartHandshake size={20} />
            </div>
            <div>
              <div className="font-extrabold text-lg leading-none">FoodBridge</div>
              <div className="text-[11px] text-slate-500 tracking-widest mt-0.5">NGO PORTAL</div>
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1 flex-1">
          <NavBtn icon={<LayoutDashboard size={18} />} label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} testid="nav-overview" />
          <NavBtn icon={<Inbox size={18} />} label="Donations Inbox" badge={stats.pending} active={tab === "inbox"} onClick={() => setTab("inbox")} testid="nav-inbox" />
          <NavBtn icon={<Award size={18} />} label="80G Certificates" badge={certificates.length} active={tab === "certs"} onClick={() => setTab("certs")} testid="nav-certs" />
          <NavBtn icon={<Users size={18} />} label="Donors" active={tab === "donors"} onClick={() => setTab("donors")} testid="nav-donors" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-orange-500 text-white grid place-items-center font-bold">
              {(userEmail[0] || "N").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">FoodBridge NGO</div>
              <div className="text-xs text-slate-500 truncate">{userEmail}</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            data-testid="logout-btn"
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:bg-slate-50 py-2 rounded-lg"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">
              {tab === "overview" ? "Dashboard" : tab === "inbox" ? "Incoming" : tab === "certs" ? "Tax Certificates" : "Donor Network"}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {tab === "overview" && "Good day, FoodBridge"}
              {tab === "inbox" && "Donations Inbox"}
              {tab === "certs" && "80G Certificates Issued"}
              {tab === "donors" && "Donor Network"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search donor or food…"
                data-testid="search-input"
                className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-64 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button className="relative w-10 h-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50">
              <Bell size={18} className="text-slate-600" />
              {stats.pending > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 grid place-items-center">
                  {stats.pending}
                </span>
              )}
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          {tab === "overview" && (
            <Overview
              stats={stats}
              donations={donations}
              certificates={certificates}
              onGoToInbox={() => setTab("inbox")}
              onApprove={handleApprove}
            />
          )}

          {tab === "inbox" && (
            <InboxPanel
              donations={filteredDonations}
              filter={filter}
              setFilter={setFilter}
              onApprove={handleApprove}
              onReject={handleReject}
              onPreview={(d) => setPreviewDonation(d)}
            />
          )}

          {tab === "certs" && (
            <CertsList certs={certificates} onView={(c) => setSelectedCert(c)} />
          )}

          {tab === "donors" && <DonorList donations={donations} />}
        </section>
      </main>

      {/* HIDDEN PRINT AREA (kept off-screen) */}
      <div style={{ position: "fixed", left: "-99999px", top: 0 }} aria-hidden>
        {selectedCert && <Certificate ref={certRef} data={selectedCert} />}
      </div>

      {/* CERT PREVIEW MODAL */}
      {selectedCert && (
        <Modal onClose={() => setSelectedCert(null)} title="80G Tax Exemption Certificate">
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={downloadPdf}
              data-testid="download-certificate-btn"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700"
            >
              <Download size={18} /> Download PDF
            </button>
            <button
              onClick={() => setSelectedCert(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
          <div className="bg-slate-100 p-6 rounded-2xl flex justify-center overflow-auto max-h-[70vh]">
            <div style={{ transform: "scale(0.75)", transformOrigin: "top center" }}>
              <Certificate data={selectedCert} />
            </div>
          </div>
        </Modal>
      )}

      {/* DONATION DETAILS MODAL */}
      {previewDonation && (
        <Modal onClose={() => setPreviewDonation(null)} title="Donation Details">
          <DonationDetails
            donation={previewDonation}
            onApprove={() => {
              handleApprove(previewDonation);
              setPreviewDonation(null);
            }}
            onReject={() => {
              handleReject(previewDonation);
              setPreviewDonation(null);
            }}
          />
        </Modal>
      )}

      {/* TOAST */}
      {toast && (
        <div
          data-testid="toast"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium text-white flex items-center gap-2 animate-slide-up ${
            toast.kind === "error" ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {toast.kind === "error" ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// =============== SUB-VIEWS ===============

function Overview({ stats, donations, certificates, onGoToInbox, onApprove }) {
  const recent = donations.slice().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5" data-testid="ngo-stats">
        <Kpi
          label="Total Meals Received"
          value={stats.totalMeals}
          delta="+12%"
          icon={<Utensils size={22} />}
          tone="emerald"
        />
        <Kpi
          label="Pending Donations"
          value={stats.pending}
          delta="needs review"
          icon={<Inbox size={22} />}
          tone="orange"
        />
        <Kpi
          label="80G Certificates Issued"
          value={certificates.length}
          delta="this cycle"
          icon={<FileBadge2 size={22} />}
          tone="indigo"
        />
        <Kpi
          label="Active Donors"
          value={stats.uniqueDonors}
          delta="+3 new"
          icon={<HeartHandshake size={22} />}
          tone="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold">Meals received this week</h3>
              <p className="text-sm text-slate-500">Rolling 7-day view</p>
            </div>
            <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1">
              <TrendingUp size={16} /> +18% vs last week
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="meals" stroke="#10b981" strokeWidth={3} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6">
          <h3 className="text-lg font-bold mb-1">By category</h3>
          <p className="text-sm text-slate-500 mb-4">Top food types received</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#F97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent + CTA */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Recent donations</h3>
            <button
              data-testid="view-all-donations"
              onClick={onGoToInbox}
              className="text-sm font-semibold text-emerald-600 flex items-center gap-1 hover:underline"
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recent.length === 0 && (
              <div className="text-sm text-slate-500 py-8 text-center">No donations yet.</div>
            )}
            {recent.map((d) => (
              <RecentRow key={d.id} d={d} onApprove={() => onApprove(d)} />
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -left-8 -bottom-12 w-40 h-40 rounded-full bg-orange-500/20 blur-3xl" />
          <FileBadge2 size={28} className="text-emerald-400 mb-3" />
          <h3 className="text-xl font-bold mb-2">Auto 80G certificates</h3>
          <p className="text-sm text-slate-300">
            Every approved donation generates a tax-exempt certificate under section 80G of the Income Tax Act,
            instantly downloadable as a PDF.
          </p>
          <div className="mt-5 bg-white/10 rounded-2xl p-4">
            <div className="text-xs text-slate-300">Latest issued</div>
            <div className="font-mono text-emerald-300 font-bold">
              {certificates[certificates.length - 1]?.certificateNo || "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InboxPanel({ donations, filter, setFilter, onApprove, onReject, onPreview }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden" data-testid="inbox-panel">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              data-testid={`filter-${f}`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
                filter === f ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-500">{donations.length} record{donations.length === 1 ? "" : "s"}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-3">Donor</th>
              <th className="px-6 py-3">Food</th>
              <th className="px-6 py-3">Quantity</th>
              <th className="px-6 py-3">Freshness</th>
              <th className="px-6 py-3">Pickup</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                  No donations match this filter.
                </td>
              </tr>
            )}
            {donations.map((d) => {
              const status = d.status || "pending";
              return (
                <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50" data-testid={`donation-row-${d.id}`}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{d.donorName || "Anonymous"}</div>
                    <div className="text-xs text-slate-500">{d.donorEmail || "—"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{d.foodName}</div>
                    <div className="text-xs text-slate-500">{d.foodType} • {d.foodCondition}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{d.quantity} meals</td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        style={{ width: `${d.freshness || 0}%` }}
                      />
                    </div>
                    <div className="text-xs mt-1 text-slate-600 font-semibold">{d.freshness || 0}%</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} /> {d.pickupAddress?.slice(0, 22) || "—"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Calendar size={12} /> {d.pickupDateTime ? new Date(d.pickupDateTime).toLocaleString() : "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onPreview(d)}
                        title="View"
                        data-testid={`view-donation-${d.id}`}
                        className="w-9 h-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
                      >
                        <Eye size={16} />
                      </button>
                      {status === "pending" && (
                        <>
                          <button
                            onClick={() => onApprove(d)}
                            data-testid={`approve-donation-${d.id}`}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-700"
                          >
                            <CheckCircle2 size={14} /> Approve & Issue 80G
                          </button>
                          <button
                            onClick={() => onReject(d)}
                            data-testid={`reject-donation-${d.id}`}
                            className="w-9 h-9 grid place-items-center rounded-lg border border-slate-200 hover:bg-red-50 text-red-600"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {status === "approved" && d.certificateNo && (
                        <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                          {d.certificateNo}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CertsList({ certs, onView }) {
  if (certs.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
        <FileBadge2 size={42} className="text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-lg">No certificates issued yet</h3>
        <p className="text-sm text-slate-500 mt-1">
          Approve a donation from the inbox to auto-generate an 80G certificate.
        </p>
      </div>
    );
  }
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="certs-grid">
      {certs.map((c) => (
        <div key={c.id} className="bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-orange-500 grid place-items-center text-white">
              <FileBadge2 size={22} />
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-semibold">80G</span>
          </div>
          <div className="font-mono text-sm font-bold text-slate-900">{c.certificateNo}</div>
          <div className="text-xs text-slate-500 mt-1">Issued {c.date}</div>
          <div className="border-t border-slate-100 mt-4 pt-4">
            <div className="text-xs text-slate-500">Donor</div>
            <div className="font-semibold">{c.donorName}</div>
            <div className="text-xs text-slate-500 mt-2">Donation value</div>
            <div className="font-bold text-emerald-700">₹ {c.totalAmount.toLocaleString("en-IN")}</div>
          </div>
          <button
            onClick={() => onView(c)}
            data-testid={`view-cert-${c.id}`}
            className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Eye size={16} /> View & Download
          </button>
        </div>
      ))}
    </div>
  );
}

function DonorList({ donations }) {
  const map = new Map();
  donations.forEach((d) => {
    const key = d.donorEmail || d.donorName || "anon";
    if (!map.has(key)) {
      map.set(key, { name: d.donorName, email: d.donorEmail, meals: 0, count: 0 });
    }
    const entry = map.get(key);
    entry.meals += parseInt(d.quantity) || 0;
    entry.count += 1;
  });
  const list = Array.from(map.values()).sort((a, b) => b.meals - a.meals);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-bold">Top Donors</h3>
      </div>
      <table className="w-full">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 text-left">
          <tr>
            <th className="px-6 py-3">Donor</th>
            <th className="px-6 py-3">Donations</th>
            <th className="px-6 py-3">Total meals</th>
          </tr>
        </thead>
        <tbody>
          {list.map((d, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-orange-500 text-white grid place-items-center font-bold">
                    {(d.name || "?")[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{d.name || "Anonymous"}</div>
                    <div className="text-xs text-slate-500">{d.email || "—"}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">{d.count}</td>
              <td className="px-6 py-4 font-bold text-emerald-700">{d.meals}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============== SMALL COMPONENTS ===============

function NavBtn({ icon, label, badge, active, onClick, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
        active
          ? "bg-emerald-50 text-emerald-700 shadow-sm"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span className={active ? "text-emerald-600" : "text-slate-400"}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function Kpi({ label, value, delta, icon, tone }) {
  const tones = {
    emerald: "from-emerald-500 to-emerald-600",
    orange: "from-orange-500 to-orange-600",
    indigo: "from-indigo-500 to-indigo-600",
    rose: "from-rose-500 to-rose-600",
  };
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
          <div className="text-3xl font-extrabold mt-2 text-slate-900">{value}</div>
          <div className="text-xs text-slate-500 mt-2">{delta}</div>
        </div>
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tones[tone]} text-white grid place-items-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    pending: { bg: "bg-amber-100", text: "text-amber-800", label: "Pending" },
    approved: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Approved" },
    rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
  }[status] || { bg: "bg-slate-100", text: "text-slate-700", label: status };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function RecentRow({ d, onApprove }) {
  const status = d.status || "pending";
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-orange-500 text-white grid place-items-center">
        <ChefHat size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{d.donorName || "Anonymous"}</div>
        <div className="text-xs text-slate-500 truncate">{d.foodName} • {d.quantity} meals</div>
      </div>
      <StatusBadge status={status} />
      {status === "pending" && (
        <button
          onClick={onApprove}
          data-testid={`quick-approve-${d.id}`}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
        >
          Approve
        </button>
      )}
    </div>
  );
}

function DonationDetails({ donation, onApprove, onReject }) {
  const status = donation.status || "pending";
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Donor" value={donation.donorName || "Anonymous"} icon={<Building2 size={14} />} />
        <Field label="Donor email" value={donation.donorEmail || "—"} />
        <Field label="PAN" value={donation.donorPan || "—"} />
        <Field label="Food" value={donation.foodName} />
        <Field label="Quantity" value={`${donation.quantity} meals`} />
        <Field label="Type" value={`${donation.foodType} • ${donation.foodCondition}`} />
        <Field label="Pickup address" value={donation.pickupAddress || "—"} />
        <Field
          label="Pickup time"
          value={donation.pickupDateTime ? new Date(donation.pickupDateTime).toLocaleString() : "—"}
        />
        <Field label="Freshness score" value={`${donation.freshness || 0}%`} />
        <Field label="Spoilage risk" value={donation.risk || "—"} />
      </div>

      <div className="bg-slate-50 rounded-2xl p-4">
        <div className="text-sm text-slate-500">Estimated certificate value</div>
        <div className="text-2xl font-extrabold text-emerald-700">
          ₹ {((parseInt(donation.quantity) || 0) * MEAL_VALUE).toLocaleString("en-IN")}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Calculated at ₹{MEAL_VALUE}/meal • used for 80G tax certificate issuance.
        </div>
      </div>

      {status === "pending" && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={onApprove}
            data-testid="modal-approve-btn"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} /> Approve & Issue 80G Certificate
          </button>
          <button
            onClick={onReject}
            data-testid="modal-reject-btn"
            className="px-5 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2"
          >
            <XCircle size={18} /> Reject
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, icon }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1">
        {icon}{label}
      </div>
      <div className="font-medium text-slate-900 mt-0.5">{value}</div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} data-testid="modal-close" className="w-9 h-9 rounded-full hover:bg-slate-100 grid place-items-center">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
