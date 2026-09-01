import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User, Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wakeNotice, setWakeNotice] = useState(false);

  const { login, settings } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleQuickFill = (userType) => {
    setError('');
    if (userType === 'ADMIN') {
      setUsername('admin');
      setPassword('Admin@123');
    } else if (userType === 'TREASURER') {
      setUsername('treasurer');
      setPassword('Treasurer@123');
    } else if (userType === 'COLLECTOR') {
      setUsername('collector1');
      setPassword('Collector@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('कृपया वापरकर्तानाव आणि पासवर्ड प्रविष्ट करा.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // If request takes longer than 3 seconds (Render free cold start waking up), show notice
      const timer = setTimeout(() => {
        setWakeNotice(true);
      }, 2500);

      const result = await login(username.trim(), password);
      clearTimeout(timer);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'लॉगिन अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
      }
    } catch (err) {
      setError('सर्व्हरशी संपर्क होऊ शकला नाही. कृपया थोड्या वेळाने प्रयत्न करा.');
    } finally {
      setLoading(false);
      setWakeNotice(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-slate-100 flex items-center justify-center p-3 sm:p-4 selection:bg-mandal-saffron selection:text-white">
      {/* Background Subtle Glowing Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl bg-[#12121A]/95 border border-amber-500/25 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl">
        
        {/* Left/Top Visual Branding Panel */}
        <div className="lg:col-span-6 p-5 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-amber-500/30 relative overflow-hidden min-h-[220px] sm:min-h-[280px] lg:min-h-[540px] bg-black">
          
          {/* Portrait Bappa Photo Background */}
          <div 
            className="absolute inset-0 bg-cover bg-[center_25%] bg-no-repeat transition-transform duration-1000 scale-100"
            style={{ backgroundImage: `url('/bappa_hero_bg.jpg')` }}
          />
          
          {/* Vignette Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 via-50% to-black/30" />

          {/* Top: 39th Festival Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 border border-amber-400/50 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{settings?.festivalYear || '३९ वा गणेशोत्सव २०२६'}</span>
            </div>
          </div>

          {/* Bottom: Mandal Details & Slogan */}
          <div className="relative z-10 space-y-2 pt-12 sm:pt-20">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-devanagari text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] tracking-tight">
                {settings?.mandalName || 'अष्टविनायक मित्र मंडळ'}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-amber-400 font-devanagari mt-0.5 drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
                {settings?.location || 'रोहित कॉलनी, बोईसर'} • स्थापना : {settings?.establishedYear || 1987}
              </p>
            </div>

            {/* Slogan Card */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-black/70 border border-amber-500/35 backdrop-blur-md shadow-xl flex items-center justify-between">
              <p className="text-xs sm:text-sm text-amber-300 font-extrabold font-devanagari tracking-wide flex items-center gap-1.5">
                <span>🚩</span> || गणपती बाप्पा मोरया ||
              </p>
              <span className="text-[10px] text-gray-300 font-devanagari hidden sm:inline">
                पावती व हिशोब प्रणाली
              </span>
            </div>
          </div>

        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-6 p-5 sm:p-8 md:p-10 flex flex-col justify-center bg-[#14141E]/95">
          <div className="max-w-sm w-full mx-auto space-y-4">
            
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-devanagari flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                प्रणालीमध्ये लॉगिन करा
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Enter your credentials or choose a quick login role below.
              </p>
            </div>

            {/* Quick 1-Tap Login Selection Chips for Effortless Mobile Testing */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-amber-400/90 font-devanagari block">
                त्वरित खाते निवडा (Quick 1-Tap Login):
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('ADMIN')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold font-devanagari border transition-all text-center ${
                    username === 'admin'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-gold-sm'
                      : 'bg-[#181824] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('TREASURER')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold font-devanagari border transition-all text-center ${
                    username === 'treasurer'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-gold-sm'
                      : 'bg-[#181824] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  💰 खजिनदार
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('COLLECTOR')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold font-devanagari border transition-all text-center ${
                    username === 'collector1'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-gold-sm'
                      : 'bg-[#181824] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  📋 प्रतिनिधी
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-400 font-devanagari animate-in fade-in">
                {error}
              </div>
            )}

            {/* Render Wake Notice */}
            {wakeNotice && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-300 font-devanagari flex items-center gap-2 animate-in fade-in">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>सर्व्हर सुरू होत आहे, कृपया काही सेकंद प्रतीक्षा करा...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                  युझरनेम (Username / Email)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans"
                  />
                  <User className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-4" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                  पासवर्ड (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans"
                  />
                  <Lock className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 p-1 text-gray-400 hover:text-amber-300 transition-colors"
                    aria-label="Toggle Password Visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white text-sm font-bold shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group font-devanagari active:scale-98"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>लॉगिन होत आहे...</span>
                  </div>
                ) : (
                  <>
                    <span>लॉगिन करा (Login)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-gray-500 font-devanagari">
              <p className="font-semibold text-gray-400">
                {settings?.mandalName || 'अष्टविनायक मित्र मंडळ'}, {settings?.location || 'रोहित कॉलनी, बोईसर'}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                स्थापना वर्ष: {settings?.establishedYear || '१९८७'} • ३९ वा गणेशोत्सव २०२६
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
