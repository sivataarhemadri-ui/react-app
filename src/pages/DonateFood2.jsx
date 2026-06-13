import { useState, useEffect, useRef } from "react";
import { Upload, ArrowLeft, Sparkles, Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import api, { formatApiErrorDetail } from "../lib/api";
import { heroApi, ngoApi } from "../services/api";
import Certificate from "../components/Certificate";
import ScratchCard from "../components/ScratchCard";

const BRANDED_SCRATCH_OFFERS = [
  {
    brand: "Puma",
    color: "#ef4444",
    label: "Puma voucher scratch",
    rewardText: "Scratch to reveal up to ₹400 off Puma sportswear",
    condition: "On next Puma order",
    expiry: "7 days",
  },
  {
    brand: "Nike",
    color: "#111827",
    label: "Nike discount scratch",
    rewardText: "Scratch to reveal a Nike coupon code for footwear",
    condition: "Code valid for one purchase",
    expiry: "5 days",
  },
  {
    brand: "Lenskart",
    color: "#0f766e",
    label: "Lenskart eyewear deal",
    rewardText: "Scratch to reveal a Lenskart voucher for glasses",
    condition: "Applies to one pair",
    expiry: "10 days",
  },
  {
    brand: "FoodBridge",
    color: "#f97316",
    label: "FoodBridge reward scratch",
    rewardText: "Scratch to reveal your donation reward",
    condition: "Redeem within the week",
    expiry: "7 days",
  },
];

function generateAnalysis(file, quantity, name) {
  const normalizedName = (name || "").toLowerCase();
  const sizeKb = Math.max(1, Math.floor(file.size / 1024));
  const fileSeed = `${file.name}|${file.size}|${file.type}`;
  const hash = Array.from(fileSeed).reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0);
  const freshnessBase = 80 + (Math.abs(hash) % 15) - Math.floor(sizeKb / 55);
  const freshness = Math.min(98, Math.max(60, freshnessBase));
  const risk = freshness >= 85 ? "Low" : freshness >= 70 ? "Moderate" : "High";
  const foodType = normalizedName.includes("veg")
    ? "Vegetarian"
    : normalizedName.includes("rice") || normalizedName.includes("curry")
    ? "Prepared meal"
    : normalizedName.includes("salad")
    ? "Fresh salad"
    : file.type?.includes("png")
    ? "Packaged meal"
    : "Mixed food";
  const foodCondition = freshness >= 85 ? "Fresh" : freshness >= 70 ? "Good" : "Aged";
  const shelfLife = risk === "Low" ? "6 hours" : risk === "Moderate" ? "4 hours" : "2 hours";
  return { freshness, risk, foodType, foodCondition, shelfLife };
}

export default function DonateFood() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [rewardMessage, setRewardMessage] = useState("");
  const [certificateMessage, setCertificateMessage] = useState("");
  const [scratchCard, setScratchCard] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) return;
    setAnalysis(generateAnalysis(selectedFile, quantity, foodName));
  }, [selectedFile, quantity, foodName]);

  useEffect(() => {
    if (!certificateData || !certificateRef.current) return;
    certificateRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [certificateData]);

  const getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return month > 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const buildCertificateData = (response) => {
    const totalMeals = Number(quantity) || 0;
    const totalAmount = totalMeals * 150;
    return {
      certificateNo: response.certificateNo || `FB-80G-${Date.now()}`,
      date: new Date().toLocaleDateString("en-IN"),
      financialYear: getFinancialYear(),
      donorName: donorName || response.donorName || "Food Donor",
      donorPan: response.donorPan || response.donor_pan || "",
      totalAmount,
      items: [
        {
          id: response.id || "N/A",
          date: new Date().toLocaleDateString("en-IN"),
          foodName: foodName || "Food donation",
          quantity: quantity || "1",
          value: totalAmount,
        },
      ],
    };
  };

  const buildScratchCardData = (scratch) => {
    const fallback = BRANDED_SCRATCH_OFFERS[Math.floor(Math.random() * BRANDED_SCRATCH_OFFERS.length)];
    const card = scratch || fallback;
    return {
      id: scratch?.id || `scratch-${Date.now()}`,
      brand: card.brand || "FoodBridge",
      title: card.label || "Donation Reward",
      description: card.rewardText || "Scratch to reveal your reward",
      color: card.color || "#f97316",
      status: scratch?.status === "active" ? "available" : scratch?.status || "available",
      rewardText: card.rewardText || `₹${scratch?.amount || 25} reward`,
      condition: card.condition || "Redeem within 7 days",
      expiry: card.expiry || "Valid for one week",
      code: scratch?.code || null,
    };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPreview(null);
      setSelectedFile(null);
      setAnalysis(null);
      return;
    }

    setPreview(URL.createObjectURL(file));
    setSelectedFile(file);
  };

  const handleScratchReveal = (cardId) => {
    setScratchCard((prev) =>
      prev && prev.id === cardId
        ? { ...prev, status: "unlocked", code: prev.code || `FB-${Math.random().toString(36).slice(2, 8).toUpperCase()}` }
        : prev
    );
  };

  const handleScratchRedeem = (cardId) => {
    setScratchCard((prev) => (prev && prev.id === cardId ? { ...prev, status: "collected" } : prev));
  };

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`FoodBridge_80G_Certificate_${certificateData?.certificateNo || Date.now()}.pdf`);
    } catch (error) {
      console.error(error);
      setSubmitMessage("Unable to generate certificate download at the moment.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintCertificate = () => {
    if (!certificateRef.current) return;
    const printWindow = window.open("", "_blank", "width=900,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print 80G Certificate</title>
          <style>
            body { margin: 0; padding: 20px; background: #f3f4f6; }
            .print-area { display: flex; justify-content: center; }
          </style>
        </head>
        <body>
          <div class="print-area">${certificateRef.current.innerHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleSubmitDonation = async () => {
    if (!preview) return alert("Please upload a food image");
    if (!donorName.trim()) return alert("Please enter donor name");
    if (!donorPhone.trim()) return alert("Please enter phone number");
    if (!quantity.trim()) return alert("Please enter quantity");
    if (!pickupDateTime.trim()) return alert("Please select pickup date/time");
    if (!pickupAddress.trim()) return alert("Please enter pickup address");

    setSubmitting(true);
    try {
      const { data } = await api.post("/donations", {
        food_name: foodName,
        quantity,
        pickup_date_time: pickupDateTime,
        pickup_address: pickupAddress,
        image_url: preview || null,
        food_type: analysis?.foodType,
        food_condition: analysis?.foodCondition,
        freshness: analysis?.freshness,
        risk: analysis?.risk,
        shelf_life: analysis?.shelfLife,
        donor_name: donorName,
        donor_phone: donorPhone,
      });

      const certData = buildCertificateData(data);
      const cardData = buildScratchCardData(data.scratch_card || data.card || { id: data.scratch_card_id, ...data });
      const donationPayload = {
        id: data.id || data.donation_id || `donation_${Date.now()}`,
        food_name: data.food_name || foodName,
        quantity: Number(data.quantity) || Number(quantity) || 1,
        pickup_date_time: data.pickup_date_time || pickupDateTime,
        pickup_address: data.pickup_address || pickupAddress,
        donor_name: data.donor_name || donorName || "Community Donor",
        donor_phone: data.donor_phone || donorPhone,
        donor_email: data.donor_email || "donor@foodbridge.org",
        status: "pending",
        reward_points: data.reward_points || Math.max(20, Math.round((Number(data.quantity) || Number(quantity) || 1) * 2)),
        food_type: data.food_type || analysis?.foodType,
        food_condition: data.food_condition || analysis?.foodCondition,
        freshness: data.freshness || analysis?.freshness,
        risk: data.risk || analysis?.risk,
        shelf_life: data.shelf_life || analysis?.shelfLife,
      };

      if (ngoApi?.addDonation) {
        ngoApi.addDonation(donationPayload);
      }

      setSubmitMessage("Donation recorded successfully!");
      setRewardMessage(data.message || "You earned a new scratch card!");
      setCertificateMessage(`80G certificate generated: ${certData.certificateNo}`);
      setCertificateData(certData);
      setScratchCard(cardData);

      try {
        window.dispatchEvent(new CustomEvent("donation:created", { detail: donationPayload }));
        if (data?.scratch_card || data?.card || data?.scratch_card_id) {
          window.dispatchEvent(new CustomEvent("scratch:updated", { detail: data }));
        }
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      setSubmitMessage(formatApiErrorDetail(e.response?.data?.detail) || "Failed to submit");
      setRewardMessage("");
      setCertificateMessage("");
      setCertificateData(null);
      setScratchCard(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-slate-600">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold mb-2">Donate Food</h1>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              <input value={foodName} onChange={(e) => setFoodName(e.target.value)} placeholder="Food Name" className="border rounded-xl p-3" />
              <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity (Meals)" className="border rounded-xl p-3" />
              <input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Donor Name" className="border rounded-xl p-3" />
              <input value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} placeholder="Phone Number" type="tel" className="border rounded-xl p-3" />
              <input value={pickupDateTime} onChange={(e) => setPickupDateTime(e.target.value)} type="datetime-local" className="border rounded-xl p-3" />
              <input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="Pickup Address" className="border rounded-xl p-3" />
            </div>

            <div className="mt-8">
              <input type="file" accept="image/*" id="foodImageNew" className="hidden" onChange={handleImageUpload} />
              <label htmlFor="foodImageNew" className="cursor-pointer border-2 border-dashed border-emerald-400 rounded-2xl p-10 flex flex-col items-center justify-center">
                <Upload size={40} />
                <p className="mt-3 font-medium">Upload Food Image</p>
              </label>

              {preview && <img src={preview} alt="Food preview" className="mt-5 rounded-2xl h-64 object-cover w-full" />}
            </div>

            <button onClick={handleSubmitDonation} disabled={submitting} className="mt-8 bg-gradient-to-r from-emerald-600 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit Donation"}
            </button>

            {submitMessage && <p className="mt-4 text-sm text-slate-700">{submitMessage}</p>}
            {rewardMessage && (
              <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-orange-50 border-2 border-emerald-200 p-4 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="font-semibold text-slate-800">{rewardMessage}</p>
                </div>
              </div>
            )}

            {certificateData && (
              <div ref={certificateRef} className="mt-6 rounded-3xl bg-white p-4 shadow-sm border border-slate-200">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                      <Sparkles className="w-4 h-4" /> Certificate ready
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Your 80G certificate has been generated and is ready to download or print.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleDownloadCertificate}
                      disabled={downloading}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <Download size={16} /> Download PDF
                    </button>
                    <button
                      onClick={handlePrintCertificate}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Printer size={16} /> Print
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-3xl bg-slate-100 p-4">
                  <Certificate data={certificateData} />
                </div>
              </div>
            )}

            {scratchCard && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Scratch Card Reward</h3>
                <ScratchCard card={scratchCard} onReveal={handleScratchReveal} onRedeem={handleScratchRedeem} />
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-6">AI Food Analysis</h2>
            {analysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Metric label="Freshness" value={`${analysis.freshness}%`} />
                  <Metric label="Spoilage risk" value={analysis.risk} />
                  <Metric label="Food type" value={analysis.foodType} />
                  <Metric label="Condition" value={analysis.foodCondition} />
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <p className="font-semibold text-slate-800">Insights</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Your upload looks {analysis.foodCondition.toLowerCase()} and can be safely delivered within {analysis.shelfLife}. Use the preview to confirm before submitting.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-center py-12">Upload an image to start analysis</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4 text-center">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

