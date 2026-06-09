import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import HotelDashboard from "./pages/HotelDashboard";
import DonateFood from "./pages/DonateFood";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Signup Page */}
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Hotel Dashboard */}
        <Route path="/dashboard/hotel" element={<HotelDashboard />} />
        {/* donate food page */}
        <Route path="/donate-food" element={<DonateFood />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;