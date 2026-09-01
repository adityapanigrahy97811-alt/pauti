import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Users,
  Menu
} from 'lucide-react';

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-slate-100 flex flex-col">
      {/* Top Temple decorative glow bar */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-orange-600 sticky top-0 z-50 shadow-gold-sm" />

      <div className="flex flex-1">
        {/* Sidebar for Desktop (Permanent) & Mobile (Drawer) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area: Offset by 288px (w-72) on Desktop */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />

          <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
            <Outlet />
          </main>

          {/* Footer Branding Banner (Desktop & Tablet) */}
          <footer className="hidden sm:block border-t border-amber-500/10 bg-[#0E0E15] py-4 px-6 text-center text-xs text-gray-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <p className="font-devanagari text-amber-400/90 font-medium">
                अष्टविनायक मित्र मंडळ, रोहित कॉलनी, बोईसर — ३९ वा गणेशोत्सव २०२६
              </p>
              <p className="font-devanagari text-gray-400">
                || गणपती बाप्पा मोरया || मंगलमूर्ती मोरया ||
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* Sticky Mobile Bottom Navigation Bar (Smartphones & Small Screens < 1024px) */}
      <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#12121A]/95 backdrop-blur-xl border-t border-amber-500/25 px-2 py-1.5 flex items-center justify-around shadow-[0_-5px_25px_rgba(0,0,0,0.7)] safe-area-bottom">
        
        {/* 1. Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
              isActive ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-devanagari leading-tight">
            {lang === 'mr' ? 'डॅशबोर्ड' : 'Home'}
          </span>
        </NavLink>

        {/* 2. Collections List */}
        <NavLink
          to="/collections"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
              isActive ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] font-devanagari leading-tight">
            {lang === 'mr' ? 'पावत्या' : 'Receipts'}
          </span>
        </NavLink>

        {/* 3. CENTER HIGHLIGHTED ACTION: + New Collection */}
        <NavLink
          to="/collections/new"
          className={({ isActive }) =>
            `flex flex-col items-center -mt-5 group`
          }
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.6)] border-2 border-[#12121A] flex items-center justify-center text-white active:scale-90 transition-transform">
            <PlusCircle className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-devanagari font-bold text-amber-300 mt-0.5">
            {lang === 'mr' ? '+ पावती' : '+ New'}
          </span>
        </NavLink>

        {/* 4. Donors */}
        <NavLink
          to="/donors"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
              isActive ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-devanagari leading-tight">
            {lang === 'mr' ? 'देणगीदार' : 'Donors'}
          </span>
        </NavLink>

        {/* 5. Menu Drawer Toggle */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            isSidebarOpen ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-devanagari leading-tight">
            {lang === 'mr' ? 'अधिक' : 'Menu'}
          </span>
        </button>

      </nav>
    </div>
  );
}
