import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ChefHat, Building2, Bike, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AVATARS } from '../lib/avatars';

const ROLES = [
  { id: 'donor', name: 'Donor',     icon: ChefHat,    color: 'from-green-500 to-green-600',   desc: 'I want to donate food' },
  { id: 'ngo',   name: 'NGO',       icon: Building2,  color: 'from-orange-500 to-orange-600', desc: 'We distribute food' },
  { id: 'hero',  name: 'Food Hero', icon: Bike,       color: 'from-yellow-500 to-yellow-600', desc: 'I want to volunteer' },
];

export default function Signup() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [avatarId, setAvatarId] = useState(AVATARS[0].id);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const selectedRole = role || ROLES[0];
  const SelectedIcon = selectedRole.icon;

  const handleCreateAccount = async () => {
    setServerError('');
    if (!form.name.trim()) return setServerError('Please enter your name');
    if (!form.email.trim()) return setServerError('Please enter your email');
    if (form.password.length < 6) return setServerError('Password must be at least 6 characters');

    setSubmitting(true);
    const res = await register({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      password: form.password,
      role: selectedRole.id,
      avatar_id: avatarId,
    });
    setSubmitting(false);

    if (!res.ok) {
      setServerError(res.error || 'Signup failed');
      return;
    }
    
    const getTargetRoute = (role) => {
      if (role === 'donor') return '/dashboard/hotel';
      if (role === 'ngo') return '/dashboard/ngo';
      if (role === 'hero') return '/dashboard/hero';
      return '/dashboard';
    };
    
    const target = getTargetRoute(res.user?.role || selectedRole.id);
    navigate(target);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-cream">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🍱</span>
            <span className="text-xl font-bold font-heading">FoodBridge</span>
          </div>
          <h1 className="text-4xl font-extrabold font-heading">Join the movement</h1>
          <p className="text-slate-500 mt-2">Step {step} of 3 — {step === 1 ? 'Choose your role' : step === 2 ? 'Your details' : 'Pick your avatar'}</p>
        </div>

        {step === 1 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {ROLES.map(r => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  data-testid={`signup-role-${r.id}`}
                  onClick={() => { setRole(r); setStep(2); }}
                  className="bg-white border-2 border-slate-200 rounded-3xl p-8 text-center hover:border-green-500 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{r.name}</h3>
                  <p className="text-sm text-slate-500 mt-2">{r.desc}</p>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border">
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${selectedRole.color} text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-6`}>
              <SelectedIcon className="w-4 h-4" /> Signing up as {selectedRole.name}
            </div>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  data-testid="signup-name-input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={selectedRole.id === 'ngo' ? 'Organization name' : 'Full name'}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-green-500 outline-none"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  data-testid="signup-email-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-green-500 outline-none"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  data-testid="signup-phone-input"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone (10 digits)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-green-500 outline-none"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  data-testid="signup-password-input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a password (min 6 chars)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-green-500 outline-none"
                />
              </div>

              {serverError && (
                <div data-testid="signup-error" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <button
                data-testid="signup-next-button"
                onClick={() => {
                  setServerError('');
                  if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
                    setServerError('Please fill all fields (password ≥ 6 chars)');
                    return;
                  }
                  setStep(3);
                }}
                className={`w-full bg-gradient-to-r ${selectedRole.color} text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition` }
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>

              <button onClick={() => setStep(1)} className="w-full text-slate-500 text-sm hover:text-slate-700">
                ← Choose different role
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border">
            <h3 className="text-2xl font-bold mb-2">Pick your avatar</h3>
            <p className="text-slate-500 mb-6">Choose how others will see you in the community.</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {AVATARS.map((a) => {
                const selected = avatarId === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    data-testid={`signup-avatar-${a.id}`}
                    onClick={() => setAvatarId(a.id)}
                    className={`relative aspect-square rounded-2xl border-2 transition-all overflow-hidden bg-slate-50 ${
                      selected ? 'border-green-500 scale-105 shadow-lg' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                    {selected && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {serverError && (
              <div data-testid="signup-error" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
                {serverError}
              </div>
            )}

            <button
              data-testid="signup-submit-button"
              onClick={handleCreateAccount}
              disabled={submitting}
              className={`w-full bg-gradient-to-r ${selectedRole.color} text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition disabled:opacity-60` }
            >
              {submitting ? 'Creating account...' : <>Create Account <ArrowRight className="w-5 h-5" /></>}
            </button>

            <button onClick={() => setStep(2)} className="w-full text-slate-500 text-sm hover:text-slate-700 mt-3">
              ← Edit details
            </button>
          </div>
        )}

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-green-600 hover:underline" data-testid="link-to-login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
