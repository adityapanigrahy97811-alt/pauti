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
  Database
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user, settings, isAdmin, isTreasurer } = useAuth();
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#101018] border-r border-amber-500/20 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Mandal Logo Banner */}
          <div className="p-5 border-b border-amber-500/20 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-0.5 shadow-gold-sm shrink-0 overflow-hidden">
                <img
                  src="/bappa_hero_bg.jpg"
                  alt="अष्टविनायक बाप्पा"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <h2 className="text-base font-bold font-devanagari text-white leading-tight">
                  {lang === 'mr' ? (settings?.mandalName || 'अष्टविनायक मित्र मंडळ') : (settings?.mandalNameEn || 'Ashtavinayak Mandal')}
                </h2>
                <p className="text-[11px] font-medium text-amber-400 font-devanagari mt-0.5">
                  {lang === 'mr' ? `स्थापना : ${settings?.establishedYear || 1987}` : `Est. ${settings?.establishedYear || 1987}`} • {lang === 'mr' ? (settings?.location || 'बोईसर') : (settings?.locationEn || 'Boisar')}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
              <span className="text-amber-300 font-semibold font-devanagari">
                {lang === 'mr' ? (settings?.festivalYear || '३९ वा गणेशोत्सव') : '39th Ganeshotsav'}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">२०२६ / 2026</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
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
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                      item.highlight
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 font-semibold'
                        : isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-gold-sm font-semibold'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-mandal-cardHover'
                    }`
                  }
                >
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      item.highlight ? 'text-white' : 'text-amber-400/80 group-hover:text-amber-300'
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="font-devanagari text-xs leading-tight">{title}</span>
                    <span className="text-[9px] text-gray-400 group-hover:text-gray-300 font-mono">{subTitle}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Blessing */}
        <div className="p-4 border-t border-amber-500/20 bg-gradient-to-t from-amber-500/5 to-transparent text-center">
          <p className="text-[11px] font-devanagari text-amber-300/90 font-bold tracking-wide">
            {t('blessing')}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-devanagari">
            {lang === 'mr' ? 'रोहित कॉलनी, बोईसर' : 'Rohit Colony, Boisar'}
          </p>
        </div>
      </aside>
    </>
  );
}
