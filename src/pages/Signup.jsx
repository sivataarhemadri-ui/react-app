import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, ChefHat, Building2, Bike, ArrowRight } from 'lucide-react';

const ROLES = [
  { id: 'donor', name: 'Donor', icon: ChefHat, color: 'from-green-500 to-green-600', desc: 'I want to donate food' },
  { id: 'ngo', name: 'NGO', icon: Building2, color: 'from-orange-500 to-orange-600', desc: 'We distribute food' },
  { id: 'hero', name: 'Food Hero', icon: Bike, color: 'from-yellow-500 to-yellow-600', desc: 'I want to volunteer' },
];

export default function Signup() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateAccount = () => {
    setSuccessMessage('Account created successfully!');
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
          <p className="text-slate-500 mt-2">Step {step} of 2 — Choose how you want to help</p>
        </div>

        {step === 1 && (
          <div className="grid md:grid-cols-3 gap-4">
            {ROLES.map(r => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
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
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${role.color} text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-6`}>
              <role.icon className="w-4 h-4" /> Signing up as {role.name}
            </div>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" placeholder={role.id === 'ngo' ? 'Organization name' : 'Full name'}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-green-500 outline-none" />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="email" placeholder="Email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-green-500 outline-none" />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="tel" placeholder="Phone (10 digits)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-green-500 outline-none" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="password" placeholder="Create a password"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-green-500 outline-none" />
              </div>

              {role.id === 'ngo' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
                  ℹ️ NGO accounts require Darpan ID verification before activation.
                </div>
              )}

              <button
                onClick={handleCreateAccount}
                className={`w-full bg-gradient-to-r ${role.color} text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition`}
              >
                Create Account <ArrowRight className="w-5 h-5" />
              </button>

              {successMessage && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  {successMessage}
                </div>
              )}

              <button onClick={() => setStep(1)} className="w-full text-slate-500 text-sm hover:text-slate-700">
                ← Choose different role
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-green-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}