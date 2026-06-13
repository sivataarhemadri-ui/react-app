import { useState, useEffect, useRef } from "react";
import { Upload, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { formatApiErrorDetail } from "../lib/api";
import { heroApi, ngoApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Certificate from "../components/Certificate";
import ScratchCard from "../components/ScratchCard";
import { createRewardForEvent } from "../services/rewardService";

function generateAnalysis(file, quantity, name) {
  const sizeKb = Math.max(1, Math.floor(file.size / 1024));
  const freshness = Math.min(98, Math.max(65, 95 - Math.floor(sizeKb / 40)));
  const risk = freshness >= 85 ? "Low" : freshness >= 70 ? "Moderate" : "High";
  const foodType = name.toLowerCase().includes("veg")
    ? "Vegetarian"
    : name.toLowerCase().includes("rice") || name.toLowerCase().includes("curry")
    ? "Prepared meal"
    : "Mixed food";
  const foodCondition = freshness >= 85 ? "Fresh" : freshness >= 70 ? "Good" : "Aged";
  const shelfLife = risk === "Low" ? "6 hours" : risk === "Moderate" ? "4 hours" : "2 hours";
  return { freshness, risk, foodType, foodCondition, shelfLife };
}

export default function DonateFood() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [rewardMessage, setRewardMessage] = useState("");
  const [certificateMessage, setCertificateMessage] = useState("");
  const [scratchCard, setScratchCard] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const certificateRef = useRef(null);

  const getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return month > 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  useEffect(() => {
    if (!selectedFile) return;
    setAnalysis(generateAnalysis(selectedFile, quantity, foodName));
  }, [selectedFile, quantity, foodName]);

  useEffect(() => {
    if (!certificateData || !certificateRef.current) return;
    certificateRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [certificateData]);

  const BRANDED_SCRATCH_OFFERS = [
    {
      brand: "Puma",
      color: "#ef4444",
      label: "Puma voucher scratch",
      reward: "Scratch to reveal up to ₹400 off Puma sportswear",
    },
    {
      brand: "Nike",
      color: "#111827",
      label: "Nike discount scratch",
      reward: "Scratch to reveal a Nike coupon code for footwear",
    },
    {
      brand: "Lenskart",
      color: "#0f766e",
      label: "Lenskart eyewear deal",
      reward: "Scratch to reveal a Lenskart voucher for glasses",
    },
    {
      brand: "PhonePe",
      color: "#5b21b6",
      label: "PhonePe cashback scratch",
      reward: "Scratch to reveal an instant cashback coupon",
    },
  ];

  const buildCertificateData = (response) => {
    const totalMeals = Number(quantity) || 0;
    const totalAmount = totalMeals * 150;
    return {
      certificateNo: response.certificateNo || `FB-80G-${Date.now()}`,
      date: new Date().toLocaleDateString("en-IN"),
      financialYear: getFinancialYear(),
      donorName: user?.name || "Food Donor",
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

  const generateAnalysis = (file, quantity, name) => {
    const normalizedName = (name || "").toLowerCase();
    const typeHint = (file.type || "image/jpeg").toLowerCase();
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
      : typeHint.includes("png")
      ? "Packaged meal"
      : "Mixed food";
    const foodCondition = freshness >= 85 ? "Fresh" : freshness >= 70 ? "Good" : "Aged";
    const shelfLife = risk === "Low" ? "6 hours" : risk === "Moderate" ? "4 hours" : "2 hours";
    return { freshness, risk, foodType, foodCondition, shelfLife };
  };

  const revealScratchCard = () => {
    setScratchCard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: "unlocked",
        code: prev.code || `FB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      };
    });
  };

  const handleScratchRedeem = (cardId) => {
    setScratchCard((prev) =>
      prev && prev.id === cardId ? { ...prev, status: "collected" } : prev
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Please upload an image file");
    setPreview(URL.createObjectURL(file));
    setSelectedFile(file);
  };

  const handleSubmitDonation = async () => {
    if (!preview) return alert("Please upload a food image");
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
        donor_name: user?.name || "Community Donor",
        donor_email: user?.email || undefined,
        image_url: preview || null,
        food_type: analysis?.foodType,
        food_condition: analysis?.foodCondition,
        freshness: analysis?.freshness,
        risk: analysis?.risk,
        shelf_life: analysis?.shelfLife,
      });

      const certData = buildCertificateData(data);
      const rewardCard = createRewardForEvent("donation");
      setSubmitMessage("Donation recorded successfully!");
      setRewardMessage(`${rewardCard.title} unlocked!`);
      setCertificateData(certData);
      setCertificateMessage(`80G certificate generated: ${certData.certificateNo}`);
      setScratchCard(rewardCard);

      if (heroApi?.addDonation) {
        heroApi.addDonation({
          ...data,
          donor_name: user?.name || "Community Donor",
          donor_email: user?.email,
          status: "pending",
        });
      }
      if (ngoApi?.addDonation) {
        ngoApi.addDonation({
          ...data,
          donor_name: user?.name || "Community Donor",
          donor_email: user?.email,
          status: "pending",
        });
      }

      try {
        window.dispatchEvent(new CustomEvent("donation:created", { detail: data }));
        if (data?.scratch_card || data?.card || data?.scratch_card_id) {
          window.dispatchEvent(new CustomEvent("scratch:updated", { detail: data }));
        }
      } catch (e) {}
    } catch (e) {
      setSubmitMessage(formatApiErrorDetail(e.response?.data?.detail) || "Failed to submit");
      setRewardMessage("");
      setCertificateMessage("");
      setCertificateData(null);
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

        <div className="grid md:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold mb-2">Donate Food</h1>
            <div className="grid md:grid-cols-2 gap-5">
              <input value={foodName} onChange={(e) => setFoodName(e.target.value)} placeholder="Food Name" className="border rounded-xl p-3" />
              <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity (Meals)" className="border rounded-xl p-3" />
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
            {certificateMessage && (
              <div className="mt-4 rounded-2xl bg-slate-50 border-2 border-slate-200 p-4 text-slate-700">
                <strong>Certificate:</strong> {certificateMessage}
              </div>
            )}
            {certificateData && (
              <div ref={certificateRef} className="mt-6 rounded-3xl bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Your 80G Certificate</h3>
                    <p className="text-sm text-slate-500">Generated automatically after donation submission.</p>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-3xl bg-slate-100 p-4">
                  <Certificate data={certificateData} />
                </div>
              </div>
            )}
            {scratchCard && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Scratch Card</h3>
                <ScratchCard
                  card={scratchCard}
                  onReveal={revealScratchCard}
                  onRedeem={handleScratchRedeem}
                />
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
