import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, settings } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('कृपया वापरकर्तानाव आणि पासवर्ड प्रविष्ट करा.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await login(username.trim(), password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'लॉगिन अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
      }
    } catch (err) {
      setError('सर्व्हर त्रुटी. कृपया थोड्या वेळाने प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-slate-100 flex items-center justify-center p-4 selection:bg-mandal-saffron selection:text-white">
      {/* Background Subtle Glowing Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl bg-card-gradient border border-amber-500/25 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl">
        
        {/* Left Visual Branding Panel - Full Immersive Bappa Photo Background */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-amber-500/30 relative overflow-hidden min-h-[540px] bg-black">
          
          {/* Complete Full-Card Vertical Portrait Bappa Photo Background - Shifted slightly up */}
          <div 
            className="absolute inset-0 bg-cover bg-[center_25%] bg-no-repeat transition-transform duration-1000 scale-100"
            style={{ backgroundImage: `url('/bappa_hero_bg.jpg')` }}
          />
          
          {/* Subtle Dark Vignette & Bottom Shading: Lights and Face clear at top, shaded for text at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 via-42% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/90" />

          {/* Top: 39th Festival Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 border border-amber-400/50 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings?.festivalYear || '३९ वा गणेशोत्सव २०२६'}</span>
            </div>
          </div>

          {/* Bottom: Mandal Details & Slogan Card */}
          <div className="relative z-10 space-y-3 pt-28">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-devanagari text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] tracking-tight">
                {settings?.mandalName || 'अष्टविनायक मित्र मंडळ'}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-amber-400 font-devanagari mt-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
                {settings?.location || 'रोहित कॉलनी, बोईसर'} • स्थापना : {settings?.establishedYear || 1987}
              </p>
            </div>

            {/* Glassmorphic Slogan Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-black/65 border border-amber-500/35 backdrop-blur-md shadow-2xl space-y-1">
              <p className="text-xs sm:text-sm text-amber-300 font-extrabold font-devanagari tracking-wider flex items-center gap-1.5">
                <span>🚩</span> || गणपती बाप्पा मोरया ||
              </p>
              <p className="text-xs text-gray-200 font-devanagari leading-relaxed">
                गणेशोत्सव देणगी पावती व हिशोब व्यवस्थापन प्रणाली.
              </p>
            </div>
          </div>

        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center bg-[#14141E]/95">
          <div className="max-w-sm w-full mx-auto">
            <h2 className="text-xl font-bold text-white font-devanagari">
              प्रणालीमध्ये लॉगिन करा
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Sign in to manage collections and financial records.
            </p>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-devanagari">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1.5">
                  युझरनेम (Username)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans"
                  />
                  <User className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1.5">
                  पासवर्ड (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans"
                  />
                  <Lock className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-amber-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white text-sm font-bold shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group font-devanagari"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>लॉगिन करा (Login)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-gray-800/80 text-center text-xs text-gray-400 font-devanagari">
              <p className="font-semibold text-gray-300">
                {settings?.mandalName || 'अष्टविनायक मित्र मंडळ'}, {settings?.location || 'रोहित कॉलनी, बोईसर'}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                स्थापना वर्ष: {settings?.establishedYear || '१९८७'} • सर्व हक्क राखीव © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
