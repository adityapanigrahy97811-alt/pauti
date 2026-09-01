import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, User as UserIcon, Shield, Menu, X, Sparkles, Languages } from 'lucide-react';

export function Header({ onToggleSidebar, isSidebarOpen }) {
  const { user, logout, settings } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const roleBadgeColor = {
    ADMIN: 'bg-red-500/20 text-red-400 border-red-500/40',
    TREASURER: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    COLLECTOR: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  }[user?.role] || 'bg-gray-500/20 text-gray-300 border-gray-500/40';

  const roleLabelMarathi = {
    ADMIN: lang === 'mr' ? 'मुख्य प्रशासक (Admin)' : 'Administrator',
    TREASURER: lang === 'mr' ? 'खजिनदार (Treasurer)' : 'Treasurer',
    COLLECTOR: lang === 'mr' ? 'पावती प्रतिनिधी (Collector)' : 'Collector'
  }[user?.role] || user?.role;

  return (
    <header className="sticky top-0 z-30 bg-[#12121A]/95 backdrop-blur-md border-b border-amber-500/20 px-3 sm:px-6 py-2.5 sm:py-3 transition-all duration-200">
      <div className="flex items-center justify-between">
        
        {/* Left: Mobile Drawer Toggle & Quick Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-mandal-card border border-amber-500/25 text-amber-400 hover:bg-mandal-cardHover active:scale-95 transition-all"
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Branding for Mobile & Desktop */}
          <div className="flex items-center gap-2.5">
            <div className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-gold-sm border border-amber-300/40 shrink-0 overflow-hidden">
              <img
                src="/bappa_hero_bg.jpg"
                alt="अष्टविनायक बाप्पा"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold font-devanagari text-white tracking-wide truncate max-w-[200px] sm:max-w-none">
                  {lang === 'mr' ? (settings?.mandalName || 'अष्टविनायक मित्र मंडळ') : (settings?.mandalNameEn || 'Ashtavinayak Mitra Mandal')}
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {lang === 'mr' ? (settings?.festivalYear || '३९ वा गणेशोत्सव') : '39th Ganeshotsav'}
                </span>
              </div>
              <p className="text-[11px] text-amber-400/80 font-medium hidden sm:block">
                {lang === 'mr' ? (settings?.location || 'रोहित कॉलनी, बोईसर') : (settings?.locationEn || 'Rohit Colony, Boisar')} • <span className="text-orange-400">{t('blessing')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Language Switcher, Blessing & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-sm group active:scale-95"
            title={lang === 'mr' ? 'Switch to English' : 'मराठी भाषेत बदला'}
          >
            <Languages className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold tracking-wide text-[11px] sm:text-xs">
              {lang === 'mr' ? 'मराठी ➔ EN' : 'EN ➔ मराठी'}
            </span>
          </button>

          {/* Blessing Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-xs font-devanagari text-amber-300 font-semibold">{t('blessing')} 🙏</span>
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#181824] border border-amber-500/20 hover:border-amber-500/50 transition-colors text-left"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight max-w-[120px] truncate">{user?.name}</div>
                <div className="text-[10px] text-amber-400/80 font-medium">{user?.role}</div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#161622] border border-amber-500/30 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 border-b border-gray-800">
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">@{user?.username} {user?.mobile ? `• ${user.mobile}` : ''}</p>
                  <div className="mt-2">
                    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-md border ${roleBadgeColor} font-semibold`}>
                      {roleLabelMarathi}
                    </span>
                  </div>
                </div>

                <div className="p-1 space-y-1">
                  <div className="px-3 py-2 text-xs text-amber-400/90 font-devanagari bg-amber-500/5 rounded-lg border border-amber-500/10">
                    🕉️ {settings?.mandalName || 'अष्टविनायक मित्र मंडळ'}
                    <div className="text-[10px] text-gray-400 mt-0.5">स्थापना : {settings?.establishedYear || 1987}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    बाहेर पडा (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
