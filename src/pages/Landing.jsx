import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

const heroImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          🍱 FoodBridge
        </div>

        <ul className="nav-links">
          <li>Home</li>
          <li>About</li>
          <li>How It Works</li>
          <li>Contact</li>
        </ul>

        <div className="nav-buttons">
          <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
          <button className="signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">

        <div className="hero-content">
          <span className="badge">
            🌱 Fighting Hunger With Technology
          </span>

          <h1>
            Save Food.
            <br />
            Feed People.
            <br />
            Change Lives.
          </h1>

          <p>
            Connect food donors, NGOs, and volunteers through
            one intelligent platform that reduces waste and
            feeds communities in real-time.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate("/signup")}>Donate Food</button>

            <button className="secondary-btn" onClick={() => navigate("/dashboard")}>Learn More</button>
          </div>

          <div className="hero-stats">
            <div>
              <h3>25K+</h3>
              <p>Meals Saved</p>
            </div>

            <div>
              <h3>500+</h3>
              <p>NGOs</p>
            </div>

            <div>
              <h3>1200+</h3>
              <p>Volunteers</p>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <img src={heroImageUrl} alt="Food Donation" />
        </div>

      </section>

      {/* Stats */}
      <section className="stats">

        <div className="stat-card">
          <h2>12,847</h2>
          <p>Meals Saved</p>
        </div>

        <div className="stat-card">
          <h2>6.4T</h2>
          <p>CO₂ Reduced</p>
        </div>

        <div className="stat-card">
          <h2>8200</h2>
          <p>People Fed</p>
        </div>

        <div className="stat-card">
          <h2>500+</h2>
          <p>NGO Partners</p>
        </div>

      </section>

      {/* How It Works */}
      <section className="how">

        <h2>How It Works</h2>

        <div className="how-grid">

          <div className="how-card">
            <div className="number">1</div>
            <h3>Create Donation</h3>
            <p>Add food details and pickup location.</p>
          </div>

          <div className="how-card">
            <div className="number">2</div>
            <h3>AI Matches NGO</h3>
            <p>Nearest NGO gets notified instantly.</p>
          </div>

          <div className="how-card">
            <div className="number">3</div>
            <h3>Volunteer Pickup</h3>
            <p>Food Hero collects and transports food.</p>
          </div>

          <div className="how-card">
            <div className="number">4</div>
            <h3>Food Delivered</h3>
            <p>Food reaches people who need it most.</p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="cta">

        <h2>Ready To Make An Impact?</h2>

        <p>
          Join thousands of donors and volunteers helping
          reduce food waste every day.
        </p>

        <button className="primary-btn" onClick={() => navigate("/signup")}>Get Started</button>

      </section>

      {/* Footer */}
      <footer className="footer">

        <div>
          <h3>FoodBridge</h3>
          <p>
            Smart Food Donation &
            Distribution Platform
          </p>
        </div>

        <div>
          <h4>Platform</h4>
          <p>Donate Food</p>
          <p>Find NGOs</p>
          <p>Volunteer</p>
        </div>

        <div>
          <h4>Company</h4>
          <p>About</p>
          <p>Contact</p>
          <p>Support</p>
        </div>

      </footer>

    </div>
  );
}