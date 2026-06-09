import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const foodItems = [
  {
    name: "Veg Biryani",
    category: "Rice",
    quantity: "50 kg",
    status: "Available",
  },
  {
    name: "Fried Rice",
    category: "Rice",
    quantity: "20 kg",
    status: "Available",
  },
  {
    name: "Dal Curry",
    category: "Curry",
    quantity: "15 kg",
    status: "Low Stock",
  },
  {
    name: "Chapati",
    category: "Bread",
    quantity: "80 pcs",
    status: "Available",
  },
  {
    name: "Paneer Curry",
    category: "Curry",
    quantity: "8 kg",
    status: "Expiring Soon",
  },
];

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = (location && location.state && location.state.role) || "donor";
  const [donorData, setDonorData] = useState(null);

  useEffect(() => {
    // Run donor-specific initialization when logged in as donor
    if (role === "donor") {
      // Example: fetch donor-specific stats or saved items.
      // Replace with real API call when available.
      const fetchDonorData = async () => {
        // mock async work
        await new Promise((res) => setTimeout(res, 300));
        setDonorData({ donatedMeals: 128, pickups: 4 });
        console.log("Donor dashboard initialized for:", location.state?.email || "unknown");
      };

      fetchDonorData();
    } else if (!location.state) {
      // If navigated here directly without state, redirect to login
      navigate("/login");
    }
  }, [role, location, navigate]);
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            <span className="text-emerald-600">Food</span>
            <span className="text-orange-500">Bridge</span>
          </h1>

          <button className="bg-gradient-to-r from-emerald-600 to-orange-500 text-white px-5 py-2 rounded-xl">
            + Donate Food
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">

        <h2 className="text-3xl font-bold text-slate-800 mb-6">
          {role === "donor" ? "🍱 Donor Dashboard" : "🏨 Hotel Dashboard"}
        </h2>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="text-slate-500 text-sm">
              Total Items
            </h3>
            <p className="text-3xl font-bold text-emerald-600">
              {role === "donor" && donorData ? donorData.donatedMeals : 28}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="text-slate-500 text-sm">
              Quantity Available
            </h3>
            <p className="text-3xl font-bold text-orange-500">
              173 kg
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="text-slate-500 text-sm">
              Pending Pickups
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {role === "donor" && donorData ? donorData.pickups : 4}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="text-slate-500 text-sm">
              Expiring Soon
            </h3>
            <p className="text-3xl font-bold text-red-500">
              2
            </p>
          </div>

        </div>

        {/* Inventory Table */}

        <div className="bg-white rounded-2xl shadow overflow-hidden">

          <div className="px-6 py-4 border-b">
            <h3 className="text-xl font-bold">
              Food Inventory
            </h3>
          </div>

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>
                <th className="text-left p-4">Food Item</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Quantity Left</th>
                <th className="text-left p-4">Status</th>
              </tr>

            </thead>

            <tbody>

              {foodItems.map((item, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="p-4 font-medium">
                    {item.name}
                  </td>

                  <td className="p-4">
                    {item.category}
                  </td>

                  <td className="p-4">
                    {item.quantity}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm
                      ${
                        item.status === "Available"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Low Stock"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>
    </div>
  );
}