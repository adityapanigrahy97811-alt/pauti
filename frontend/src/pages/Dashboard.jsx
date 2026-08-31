import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { ReceiptModal } from '../components/ReceiptModal';
import { ExcelExportButton } from '../components/ExcelExportButton';
import { downloadCompleteAccountsExcel } from '../services/exportService';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Wallet,
  TrendingDown,
  Scale,
  Calendar,
  Users,
  Receipt,
  PlusCircle,
  Sparkles,
  ArrowUpRight,
  Printer,
  ChevronRight,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export function Dashboard() {
  const { user, settings, isAdmin, isTreasurer } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('14d'); // 7d, 14d

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReceipt = async (collectionId) => {
    try {
      const res = await api.get(`/collections/${collectionId}`);
      if (res.data.success) {
        setSelectedReceipt(res.data.data);
        setIsReceiptOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cards = stats?.cards || {};
  const paymentModes = stats?.paymentModes || [];
  const categoryData = stats?.categoryData || [];
  const timeline = stats?.timeline || [];
  const recentCollections = stats?.recentCollections || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner Greeting with Dedicated Golden Bappa Darshan Frame */}
      <div className="relative rounded-3xl border border-amber-500/40 p-6 md:p-8 overflow-hidden shadow-2xl bg-gradient-to-br from-[#161219] via-[#100D13] to-[#0A080C] min-h-[175px] flex flex-col justify-center">
        {/* Subtle Ambient Radial Lighting Behind Bappa Frame */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.15)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Greeting, Title & Action Controls */}
          <div className="space-y-4 max-w-2xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-2.5 backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-devanagari font-bold">{t('blessing')} 🙏</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white font-devanagari tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {lang === 'mr' ? (settings?.mandalName || 'अष्टविनायक मित्र मंडळ') : (settings?.mandalNameEn || 'Ashtavinayak Mitra Mandal')}
              </h1>
              <p className="text-sm md:text-base text-amber-400/90 font-bold font-devanagari mt-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                {lang === 'mr' ? 'गणेशोत्सव व्यवस्थापन प्रणाली' : 'Ganeshotsav Management Portal'} • <span className="text-orange-300 font-semibold">{lang === 'mr' ? (settings?.festivalYear || '३९ वा गणेशोत्सव २०२६') : '39th Ganeshotsav 2026'}</span>
              </p>
              <p className="text-xs text-gray-400 font-devanagari mt-0.5">
                {lang === 'mr' ? `स्थापना : ${settings?.establishedYear || 1987}` : `Est. ${settings?.establishedYear || 1987}`} • {lang === 'mr' ? (settings?.location || 'रोहित कॉलनी, बोईसर (प.)') : (settings?.locationEn || 'Rohit Colony, Boisar (W)')}
              </p>
            </div>

            {/* Actions Buttons */}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <button
                onClick={() => navigate('/collections/new')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs md:text-sm font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all font-devanagari active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                {lang === 'mr' ? '+ नवीन पावती करा' : '+ New Collection'}
              </button>

              {isTreasurer && (
                <ExcelExportButton
                  onExport={downloadCompleteAccountsExcel}
                  label={lang === 'mr' ? 'संपूर्ण हिशोब Excel' : 'Complete Accounts .xlsx'}
                  labelEn="Complete Accounts .xlsx"
                  variant="outline"
                />
              )}
            </div>
          </div>

          {/* Right: Auspicious Ornate Golden Photo Frame of Bappa */}
          <div className="relative shrink-0 flex items-center justify-center self-center lg:self-auto">
            {/* Ambient Gold Aura Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-orange-500/20 rounded-3xl blur-xl" />
            
            {/* The Ornate Golden Frame Container */}
            <div className="relative p-2 rounded-2xl bg-gradient-to-b from-[#E2B755] via-[#9B7126] to-[#5C3D0E] border-2 border-amber-300 shadow-[0_0_35px_rgba(226,183,85,0.45)] group">
              {/* Frame Corner Gold Accents */}
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-100" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-100" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-100" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-100" />

              {/* Inner Velvet Matting */}
              <div className="p-1 rounded-xl bg-[#1A1208] border border-amber-500/50 shadow-inner">
                <div className="w-32 h-40 sm:w-36 sm:h-44 md:w-40 md:h-48 rounded-lg overflow-hidden relative shadow-lg">
                  <img
                    src="/bappa_hero_bg.jpg"
                    alt="Ashtavinayak Ganpati Bappa Darshan"
                    className="w-full h-full object-cover object-[center_28%] group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle Top & Bottom Vignette for Divine Photo Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                </div>
              </div>

              {/* Bottom Inscription Tag on Frame */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 border border-amber-200 text-black text-[10px] font-black tracking-wider shadow-md font-devanagari">
                ॥ श्री गणेशाय नमः ॥
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <StatCard
          title={lang === 'mr' ? 'एकूण जमा (Total Collection)' : 'Total Collections'}
          titleEn={lang === 'mr' ? 'Total Collections' : 'All Active Collections'}
          value={cards.totalCollection || 0}
          icon={Wallet}
          colorScheme="gold"
          subtitle={lang === 'mr' ? `एकूण पावत्या: ${cards.totalTransactions || 0}` : `Total Receipts: ${cards.totalTransactions || 0}`}
          onClick={() => navigate('/collections')}
        />

        <StatCard
          title={lang === 'mr' ? 'एकूण खर्च (Total Expenses)' : 'Total Expenses'}
          titleEn={lang === 'mr' ? 'Total Expenses' : 'All Festival Expenses'}
          value={cards.totalExpenses || 0}
          icon={TrendingDown}
          colorScheme="red"
          subtitle={isAdmin ? (lang === 'mr' ? 'खर्च तपशील पाहण्यासाठी क्लिक करा' : 'Click to view expenses') : (lang === 'mr' ? 'केवळ मुख्य ॲडमिन' : 'Admin Only')}
          onClick={isAdmin ? () => navigate('/expenses') : undefined}
        />

        <StatCard
          title={lang === 'mr' ? 'शिल्लक रक्कम (Current Balance)' : 'Net Treasury Balance'}
          titleEn={lang === 'mr' ? 'Net Balance' : 'Treasury Balance'}
          value={cards.currentBalance || 0}
          icon={Scale}
          colorScheme={cards.currentBalance >= 0 ? 'emerald' : 'red'}
          subtitle={lang === 'mr' ? 'एकूण जमा वजा एकूण खर्च' : 'Total Collection - Total Expenses'}
        />

        <StatCard
          title={lang === 'mr' ? "आजची जमा (Today's Collection)" : "Today's Collection"}
          titleEn={lang === 'mr' ? "Today's Collections" : 'Recorded Today'}
          value={cards.todayCollection || 0}
          icon={Calendar}
          colorScheme="saffron"
          subtitle={lang === 'mr' ? 'आज नोंदवलेली रक्कम' : 'Collections recorded today'}
        />

        <StatCard
          title={lang === 'mr' ? 'चालू महिना जमा (This Month)' : 'This Month Collection'}
          titleEn={lang === 'mr' ? 'Monthly Collections' : 'Current Month Total'}
          value={cards.thisMonthCollection || 0}
          icon={TrendingUp}
          colorScheme="blue"
          subtitle={lang === 'mr' ? 'ऑगस्ट २०२६ संकलन' : 'August 2026 Collection'}
        />

        <StatCard
          title={lang === 'mr' ? 'एकूण देणगीदार (Total Donors)' : 'Registered Donors'}
          titleEn={lang === 'mr' ? 'Active Donors' : 'Unique Devotees'}
          value={cards.totalDonors || 0}
          isCurrency={false}
          icon={Users}
          colorScheme="emerald"
          subtitle={lang === 'mr' ? 'नोंदणीकृत देणगीदार' : 'Unique Donors in Boisar'}
          onClick={() => navigate('/donors')}
        />
      </div>

      {/* Charts Row: Collection Timeline Trend + Payment Mode Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Collection Trend Area Chart */}
        <div className="lg:col-span-8 p-5 md:p-6 rounded-3xl bg-card-gradient border border-amber-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white font-devanagari">
                  दैनिक जमा प्रवाह (Daily Collection Trend)
                </h3>
                <p className="text-xs text-gray-400">मागील १४ दिवसांचा संकलन आढावा</p>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161622',
                    borderColor: 'rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                  formatter={(value) => [formatCurrency(value), 'जमा (Collection)']}
                />
                <Area
                  type="monotone"
                  dataKey="collections"
                  stroke="#D4AF37"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Modes Donut Distribution */}
        <div className="lg:col-span-4 p-5 md:p-6 rounded-3xl bg-card-gradient border border-amber-500/20 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PieIcon className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="text-sm font-bold text-white font-devanagari">
                  पेमेंट प्रकार (Payment Modes)
                </h3>
                <p className="text-xs text-gray-400">Cash vs UPI vs Bank Transfer</p>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                  >
                    {paymentModes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161622',
                      borderColor: 'rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff'
                    }}
                    formatter={(value) => [formatCurrency(value), 'रक्कम']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-2 pt-3 border-t border-gray-800">
            {paymentModes.map((pm, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pm.color }} />
                  <span className="text-gray-300 font-devanagari">{pm.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white">{formatCurrency(pm.value)}</span>
                  <span className="text-[11px] text-amber-400 ml-1.5 font-mono">({pm.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Collections Table */}
      <div className="p-5 md:p-6 rounded-3xl bg-card-gradient border border-amber-500/20 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-devanagari">
                अलीकडील पावत्या (Recent Collections)
              </h3>
              <p className="text-xs text-gray-400">ताज्या नोंदवलेल्या देणगी पावत्या</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/collections')}
            className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>सर्व पावत्या पहा</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181824] text-amber-300 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">पावती क्र. (Receipt)</th>
                <th className="px-4 py-3">देणगीदार (Donor)</th>
                <th className="px-4 py-3">रक्कम (Amount)</th>
                <th className="px-4 py-3">पेमेंट प्रकार (Mode)</th>
                <th className="px-4 py-3">प्रतिनिधी (Collector)</th>
                <th className="px-4 py-3">दिनांक (Date)</th>
                <th className="px-4 py-3 rounded-r-xl text-right">कृती (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {recentCollections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500 font-devanagari">
                    अद्याप कोणतीही पावती नोंदवलेली नाही.
                  </td>
                </tr>
              ) : (
                recentCollections.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">
                      {c.receiptNo}
                    </td>
                    <td className="px-4 py-3 font-devanagari font-semibold text-white">
                      {c.donorName}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(c.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px] font-semibold">
                        {c.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {c.collector?.name || c.collectorName || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {formatDate(c.collectionDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenReceipt(c.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] font-semibold transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        पावती
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        collection={selectedReceipt}
        onCollectAgain={() => navigate('/collections/new')}
      />

    </div>
  );
}
