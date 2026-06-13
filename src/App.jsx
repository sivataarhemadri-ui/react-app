import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import HotelDashboard from "./pages/HotelDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import FoodHeroDashboard from "./pages/FoodHeroDashboard";
import DonateFood from "./pages/DonateFood2";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import RewardHistory from "./pages/RewardHistory";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/hotel"
          element={
            <ProtectedRoute>
              <HotelDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ngo"
          element={
            <ProtectedRoute>
              <NgoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/hero"
          element={
            <ProtectedRoute>
              <FoodHeroDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/food-hero"
          element={
            <ProtectedRoute>
              <FoodHeroDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donate-food"
          element={
            <ProtectedRoute>
              <DonateFood />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rewards/history"
          element={
            <ProtectedRoute>
              <RewardHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
