import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChefHat, Building2, Bike } from 'lucide-react';

const ROLES = [
  {
    id: 'donor',
    name: 'Donor',
    icon: ChefHat,
    color: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-700',
    description: 'Restaurants, events, households',
    tagline: 'Share your surplus food',
  },
  {
    id: 'ngo',
    name: 'NGO',
    icon: Building2,
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-500',
    text: 'text-orange-700',
    description: 'Verified charities & shelters',
    tagline: 'Receive & distribute food',
  },
  {
    id: 'hero',
    name: 'Food Hero',
    icon: Bike,
    color: 'from-yellow-500 to-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    text: 'text-yellow-700',
    description: 'Volunteers & gig workers',
    tagline: 'Pick up & deliver food',
  },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('donor');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const currentRole = ROLES.find(r => r.id === selectedRole);

  const handleSubmit = (e) => {
  e.preventDefault();

  const newErrors = {};

  if (!formData.email) {
    newErrors.email = "Email is required";
  }

  if (!formData.password) {
    newErrors.password = "Password is required";
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length === 0) {
    // route donors to the hotel dashboard route, others to generic dashboard
    const targetRoute = selectedRole === 'donor' ? '/dashboard/hotel' : '/dashboard';
    navigate(targetRoute, {
      state: {
        role: selectedRole,
        email: formData.email,
      },
    });
  }
};

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Branding / Illustration */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🍱</span>
            <span className="text-2xl font-bold font-heading">FoodBridge</span>
          </div>

          <div className="space-y-8 animate-slide-up">
            <h1 className="text-5xl xl:text-6xl font-extrabold font-heading leading-tight">
              Save Food.<br />
              Feed People.<br />
              <span className="text-yellow-300">In 2 Hours.</span>
            </h1>
            <p className="text-lg text-white/90 max-w-md">
              Join 2,400+ donors, NGOs, and food heroes ending hunger one meal at a time.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="glass rounded-2xl p-4 text-gray-800">
                <div className="text-2xl font-extrabold gradient-text">12,847</div>
                <div className="text-xs font-medium">Meals Saved</div>
              </div>
              <div className="glass rounded-2xl p-4 text-gray-800">
                <div className="text-2xl font-extrabold gradient-text">6.4T</div>
                <div className="text-xs font-medium">CO₂ Saved</div>
              </div>
              <div className="glass rounded-2xl p-4 text-gray-800">
                <div className="text-2xl font-extrabold gradient-text">8,200</div>
                <div className="text-xs font-medium">People Fed</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-white/70">
            🌱 Aligned with UN SDG #2 — Zero Hunger
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-brand-cream">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-3xl">🍱</span>
            <span className="text-xl font-bold font-heading">FoodBridge</span>
          </div>

          <h2 className="text-3xl font-extrabold font-heading mb-2">Welcome back 👋</h2>
          <p className="text-slate-500 mb-8">Sign in to continue saving food.</p>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              I am a...
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(role => {
                const Icon = role.icon;
                const isActive = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isActive
                        ? `${role.border} ${role.bg} scale-105 shadow-md`
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? role.text : 'text-slate-400'}`} />
                    <div className={`text-sm font-bold ${isActive ? role.text : 'text-slate-600'}`}>
                      {role.name}
                    </div>
                    {isActive && (
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r ${role.color}`} />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center italic">
              {currentRole.tagline} • {currentRole.description}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 bg-white outline-none transition-all ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-slate-200 focus:border-green-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs text-green-600 font-semibold hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 bg-white outline-none transition-all ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-slate-200 focus:border-green-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-green-600" />
              Remember me for 30 days
            </label>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full bg-gradient-to-r ${currentRole.color} text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all`}
            >
              Sign in as {currentRole.name}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google */}
          <button className="w-full border-2 border-slate-200 py-3 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-slate-50 transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-slate-600 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-green-600 hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}