import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Receipt,
  Users,
  PlusCircle,
  TrendingDown,
  FileSpreadsheet,
  CalendarDays,
  UserCheck,
  Shield,
  FileText,
  Settings as SettingsIcon,
  Database,
  X
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user, settings } = useAuth();
  const { lang, t } = useLanguage();

  const navItems = [
    {
      to: '/dashboard',
      label: 'मुख्य डॅशबोर्ड',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'TREASURER', 'COLLECTOR']
    },
    {
      to: '/collections/new',
      label: '+ नवीन पावती',
      labelEn: '+ New Collection',
      icon: PlusCircle,
      roles: ['ADMIN', 'TREASURER', 'COLLECTOR'],
      highlight: true
    },
    {
      to: '/collections',
      label: 'पावत्या / संकलन',
      labelEn: 'Collections Ledger',
      icon: Receipt,
      roles: ['ADMIN', 'TREASURER', 'COLLECTOR']
    },
    {
      to: '/donors',
      label: 'देणगीदार डिरेक्टरी',
      labelEn: 'Donors Directory',
      icon: Users,
      roles: ['ADMIN', 'TREASURER', 'COLLECTOR']
    },
    {
      to: '/expenses',
      label: 'खर्च व्यवस्थापन',
      labelEn: 'Expenses Ledger',
      icon: TrendingDown,
      roles: ['ADMIN']
    },
    {
      to: '/reports',
      label: 'आर्थिक अहवाल',
      labelEn: 'Financial Reports',
      icon: FileText,
      roles: ['ADMIN']
    },
    {
      to: '/daily-report',
      label: 'दैनिक हिशोब वही',
      labelEn: 'Daily Cash Book',
      icon: CalendarDays,
      roles: ['ADMIN', 'TREASURER']
    },
    {
      to: '/data-management',
      label: 'एक्सेल डेटा सिस्टीम',
      labelEn: 'Data & Excel Export',
      icon: FileSpreadsheet,
      roles: ['ADMIN', 'TREASURER']
    },
    {
      to: '/collectors',
      label: 'पावती प्रतिनिधी',
      labelEn: 'Collectors Stats',
      icon: UserCheck,
      roles: ['ADMIN', 'TREASURER']
    },
    {
      to: '/users',
      label: 'वापरकर्ते (Users)',
      labelEn: 'User Management',
      icon: Shield,
      roles: ['ADMIN']
    },
    {
      to: '/audit-logs',
      label: 'ऑडिट ट्रेल (Logs)',
      labelEn: 'Audit Logs',
      icon: Database,
      roles: ['ADMIN']
    },
    {
      to: '/settings',
      label: 'मंडळ सेटिंग्ज',
      labelEn: 'Settings',
      icon: SettingsIcon,
      roles: ['ADMIN']
    }
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar (Desktop Permanent + Mobile Drawer) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#101018] border-r border-amber-500/20 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mandal Logo Banner & Mobile Close Button */}
          <div className="p-4 border-b border-amber-500/20 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-0.5 shadow-gold-sm shrink-0 overflow-hidden">
                <img
                  src="/bappa_hero_bg.jpg"
                  alt="अष्टविनायक बाप्पा"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold font-devanagari text-white leading-tight">
                  {lang === 'mr' ? (settings?.mandalName || 'अष्टविनायक मित्र मंडळ') : (settings?.mandalNameEn || 'Ashtavinayak Mandal')}
                </h2>
                <p className="text-[10px] font-medium text-amber-400 font-devanagari mt-0.5">
                  {lang === 'mr' ? (settings?.festivalYear || '३९ वा गणेशोत्सव') : '39th Ganeshotsav'} • {lang === 'mr' ? 'बोईसर' : 'Boisar'}
                </p>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const title = lang === 'mr' ? item.label : item.labelEn;
              const subTitle = lang === 'mr' ? item.labelEn : item.label;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 group min-h-[44px] ${
                      item.highlight
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 font-semibold'
                        : isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-gold-sm font-semibold'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-mandal-cardHover'
                    }`
                  }
                >
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 shrink-0 ${
                      item.highlight ? 'text-white' : 'text-amber-400/80 group-hover:text-amber-300'
                    }`}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-devanagari text-xs leading-tight truncate">{title}</span>
                    <span className="text-[9px] text-gray-400 group-hover:text-gray-300 font-mono truncate">{subTitle}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Blessing */}
          <div className="p-3 border-t border-amber-500/20 bg-gradient-to-t from-amber-500/5 to-transparent text-center shrink-0">
            <p className="text-[11px] font-devanagari text-amber-300/90 font-bold tracking-wide">
              {t('blessing')} 🙏
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-devanagari">
              {lang === 'mr' ? 'रोहित कॉलनी, बोईसर' : 'Rohit Colony, Boisar'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
