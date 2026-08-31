import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-slate-100 flex flex-col">
      {/* Top Temple decorative glow bar */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-orange-600 sticky top-0 z-50 shadow-gold-sm" />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          {/* Footer Branding Banner */}
          <footer className="border-t border-amber-500/10 bg-[#0E0E15] py-4 px-6 text-center text-xs text-gray-500">
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
    </div>
  );
}
