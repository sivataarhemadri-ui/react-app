import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChefHat, Building2, Bike } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AVATARS } from '../lib/avatars';

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
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState(
    ROLES.some((r) => r.id === requestedRole) ? requestedRole : 'donor'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const currentRole = ROLES.find((r) => r.id === selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSubmitting(true);
    const res = await login(formData.email.trim().toLowerCase(), formData.password, selectedRole);
    setSubmitting(false);

    if (!res.ok) {
      setServerError(res.error || 'Login failed');
      return;
    }

    if (res.user?.role && res.user.role !== selectedRole) {
      await logout();
      setServerError(
        `This account is registered as ${res.user.role}. Please login using the ${res.user.role} role or use a different email.`
      );
      return;
    }

    const getTargetRoute = (role) => {
      if (role === 'donor') return '/dashboard/hotel';
      if (role === 'ngo') return '/dashboard/ngo';
      if (role === 'hero') return '/dashboard/hero';
      return '/dashboard';
    };

    const targetRoute = getTargetRoute(selectedRole);
    const needsChoose = !res.user?.avatar_id;
    if (needsChoose) {
      navigate('/profile?chooseAvatar=1');
      return;
    }
    navigate(targetRoute);
  };

  return (
    <div className="min-h-screen flex">
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

          <div className="text-sm text-white/70">🌱 Aligned with UN SDG #2 — Zero Hunger</div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-brand-cream">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-3xl">🍱</span>
            <span className="text-xl font-bold font-heading">FoodBridge</span>
          </div>

          <h2 className="text-3xl font-extrabold font-heading mb-2">Welcome back 👋</h2>
          <p className="text-slate-500 mb-8">Sign in to continue saving food.</p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isActive = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    data-testid={`login-role-${role.id}`}
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
                    {isActive && <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r ${role.color}`} />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center italic">
              {currentRole.tagline} • {currentRole.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  data-testid="login-email-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 bg-white outline-none transition-all ${
                    errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-green-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs text-green-600 font-semibold hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  data-testid="login-password-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 bg-white outline-none transition-all ${
                    errors.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-green-500'
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

            {serverError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Signing in...' : `Sign in as ${currentRole.name}`}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-green-600 hover:underline" data-testid="link-to-signup">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
