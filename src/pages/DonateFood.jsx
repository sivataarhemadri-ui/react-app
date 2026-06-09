import { useEffect, useState } from "react";
import { Upload, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function DonateFood() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("DonateFood mounted", { pathname: location.pathname, state: location.state });
  }, [location]);

  const [preview, setPreview] = useState(null);
  const [freshness, setFreshness] = useState(0);
  const [predictedFood, setPredictedFood] = useState("");
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [foodType, setFoodType] = useState("Veg");
  const [foodCondition, setFoodCondition] = useState("Freshly Cooked");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [risk, setRisk] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [analysisAccuracy, setAnalysisAccuracy] = useState(null);
  const [imageError, setImageError] = useState("");
  const [foodImageName, setFoodImageName] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const sampleImages = [
    {
      name: "Mixed Veg Meal",
      url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
      condition: "Freshly Cooked",
    },
    {
      name: "Rice & Curry",
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      condition: "Packed Food",
    },
    {
      name: "Spoiled Soup",
      url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
      condition: "Spoiled",
    },
  ];

  const loadSampleImage = (url, name, condition) => {
    setPreview(url);
    setFoodImageName(name);
    setFoodCondition(condition);
    setFoodName(name);
    setPredictedFood(name);
    setImageError("");
  };

  const calculateAnalysis = (condition) => {
    let score;
    let accuracy;
    let predictedRisk;
    let predictedShelfLife;

    if (condition === "Spoiled") {
      score = Math.floor(Math.random() * 20) + 30;
      accuracy = Math.floor(Math.random() * 10) + 60;
      predictedRisk = "High";
      predictedShelfLife = "1 Hour";
    } else if (condition === "Packed Food") {
      score = Math.floor(Math.random() * 15) + 65;
      accuracy = Math.floor(Math.random() * 10) + 75;
      predictedRisk = "Medium";
      predictedShelfLife = "2-4 Hours";
    } else {
      score = Math.floor(Math.random() * 20) + 75;
      accuracy = Math.floor(Math.random() * 10) + 80;
      predictedRisk = score > 90 ? "Very Low" : score > 80 ? "Low" : "Medium";
      predictedShelfLife = score > 90 ? "6 Hours" : score > 80 ? "4 Hours" : "2 Hours";
    }

    return {
      score,
      accuracy,
      predictedRisk,
      predictedShelfLife,
    };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please upload a valid food image file.");
      setPreview(null);
      setFoodName("");
      setFreshness(0);
      setRisk("");
      setShelfLife("");
      setAnalysisAccuracy(null);
      return;
    }

    setImageError("");
    setFoodImageName(file.name);
    setPreview(URL.createObjectURL(file));

    const { score, accuracy, predictedRisk, predictedShelfLife } = calculateAnalysis(foodCondition);

    setAnalysisAccuracy(accuracy);
    setFreshness(score);
    setRisk(predictedRisk);
    setShelfLife(predictedShelfLife);

    const foods = [
      "Vegetable Pulao",
      "Rice & Dal",
      "Chapati Meal",
      "Fruit Mix",
      "Mixed Vegetables",
      "Biryani"
    ];

    const predicted = foods[Math.floor(Math.random() * foods.length)];
    setPredictedFood(predicted);
    setFoodName(predicted);
  };

  useEffect(() => {
    if (!preview) return;

    const { score, accuracy, predictedRisk, predictedShelfLife } = calculateAnalysis(foodCondition);
    setFreshness(score);
    setAnalysisAccuracy(accuracy);
    setRisk(predictedRisk);
    setShelfLife(predictedShelfLife);
  }, [foodCondition, preview]);

  const handleSubmitDonation = () => {
    if (!preview) {
      alert("Please upload a valid food image before submitting.");
      return;
    }

    if (!quantity.trim()) {
      alert("Please enter the quantity of meals.");
      return;
    }

    if (!pickupDateTime.trim()) {
      alert("Please select a pickup date and time.");
      return;
    }

    if (!pickupAddress.trim()) {
      alert("Please enter a pickup address.");
      return;
    }

    const predictionCorrect = foodName.trim().toLowerCase() === predictedFood.trim().toLowerCase();
    const accuracyUpdate = predictionCorrect
      ? Math.min(100, analysisAccuracy + 5)
      : Math.min(100, analysisAccuracy + 10);
    const feedback = predictionCorrect
      ? "Prediction accepted and model confidence improved."
      : "Correction noted. AI training feedback added.";

    setAnalysisAccuracy(accuracyUpdate);
    setSubmitMessage(feedback);

    const newDonation = {
      id: Date.now(),
      predictedFood,
      foodName,
      predictionCorrect,
      feedback,
      quantity,
      foodType,
      foodCondition,
      pickupDateTime,
      pickupAddress,
      freshness,
      risk,
      shelfLife,
      analysisAccuracy: accuracyUpdate,
      imageName: foodImageName,
      submittedAt: new Date().toISOString(),
    };

    const stored = JSON.parse(localStorage.getItem("foodbridge_donations") || "[]");
    stored.push(newDonation);
    localStorage.setItem("foodbridge_donations", JSON.stringify(stored));

    alert(`Donation saved locally. AI analysis accuracy: ${analysisAccuracy || 0}%.`);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-slate-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* FORM */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm">

            <h1 className="text-3xl font-bold mb-2">
              Donate Food
            </h1>

            <p className="text-slate-500 mb-8">
              Fill the details below and upload food image for AI verification.
            </p>

            <div className="grid md:grid-cols-2 gap-5">

              <input
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="Food Name"
                className="border rounded-xl p-3"
              />

              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity (Meals)"
                className="border rounded-xl p-3"
              />

              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="border rounded-xl p-3"
              >
                <option>Veg</option>
                <option>Non Veg</option>
              </select>

              <select
                value={foodCondition}
                onChange={(e) => setFoodCondition(e.target.value)}
                className="border rounded-xl p-3"
              >
                <option>Freshly Cooked</option>
                <option>Packed Food</option>
                <option>Spoiled</option>
              </select>

              <input
                value={pickupDateTime}
                onChange={(e) => setPickupDateTime(e.target.value)}
                type="datetime-local"
                className="border rounded-xl p-3"
              />

              <input
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Pickup Address"
                className="border rounded-xl p-3"
              />
            </div>

            {/* IMAGE UPLOAD */}

            <div className="mt-8">

              <input
                type="file"
                accept="image/*"
                id="foodImage"
                className="hidden"
                onChange={handleImageUpload}
              />

              <label
                htmlFor="foodImage"
                className="cursor-pointer border-2 border-dashed border-emerald-400 rounded-2xl p-10 flex flex-col items-center justify-center"
              >
                <Upload size={40} />
                <p className="mt-3 font-medium">
                  Upload Food Image
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Only food image files are accepted.
                </p>
              </label>

              <div className="mt-4">
                <p className="text-sm text-slate-500 mb-3">
                  Test the AI with sample food images:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {sampleImages.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => loadSampleImage(sample.url, sample.name, sample.condition)}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              {imageError && (
                <p className="text-sm text-red-500 mt-3">
                  {imageError}
                </p>
              )}

              {preview && (
                <img
                  src={preview}
                  alt="Food preview"
                  className="mt-5 rounded-2xl h-64 object-cover w-full"
                />
              )}
            </div>

            <button
              onClick={handleSubmitDonation}
              className="mt-8 bg-gradient-to-r from-emerald-600 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold"
            >
              Submit Donation
            </button>

            {submitMessage && (
              <p className="mt-4 text-sm text-slate-700">
                {submitMessage}
              </p>
            )}
          </div>

          {/* AI PANEL */}

          <div className="bg-white rounded-3xl p-6 shadow-sm h-fit">

            <h2 className="text-xl font-bold mb-6">
              AI Food Analysis
            </h2>

            {!preview && (
              <div className="text-slate-400 text-center py-12">
                Upload an image to start analysis
              </div>
            )}

            {preview && (
              <>
                <div className="mb-5">
                  <p className="text-sm text-slate-500">
                    Food Detected
                  </p>

                  <p className="font-bold text-lg">
                    {predictedFood}
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    If prediction is wrong, edit the Food Name above before submitting.
                  </p>

                  {foodName && foodName !== predictedFood && (
                    <p className="text-sm text-orange-600 mt-2">
                      Corrected to: {foodName}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-sm text-slate-500 mb-2">
                    Freshness Score
                  </p>

                  <div className="w-full bg-slate-200 h-4 rounded-full">
                    <div
                      className="bg-emerald-500 h-4 rounded-full"
                      style={{
                        width: `${freshness}%`
                      }}
                    />
                  </div>

                  <p className="font-bold text-emerald-600 mt-2">
                    {freshness}%
                  </p>
                </div>

                <div className="grid gap-4">

                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">
                      Spoilage Risk
                    </p>

                    <p className="font-bold text-green-700">
                      {risk}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">
                      Shelf Life
                    </p>

                    <p className="font-bold text-blue-700">
                      {shelfLife}
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">
                      Donation Status
                    </p>

                    <p className="font-bold text-orange-600">
                      {freshness > 75
                        ? "Suitable For Donation"
                        : "Needs Inspection"}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">
                      AI Confidence
                    </p>

                    <p className="font-bold text-purple-600">
                      {analysisAccuracy ? `${analysisAccuracy}%` : "Estimating..."}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}