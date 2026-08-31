import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ExcelExportButton } from '../components/ExcelExportButton';
import { downloadCompleteAccountsExcel, downloadCollectionsExcel, downloadExpensesExcel } from '../services/exportService';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  FileText,
  Printer,
  Calendar,
  Wallet,
  TrendingDown,
  Scale,
  Sparkles,
  CreditCard,
  Building2,
  Receipt
} from 'lucide-react';

export function Reports() {
  const { user, settings } = useAuth();

  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [dashRes, monthRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/reports/monthly')
      ]);
      if (dashRes.data.success) setStats(dashRes.data.data);
      if (monthRes.data.success) setMonthlyData(monthRes.data.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = stats?.cards || {};
  const paymentModes = stats?.paymentModes || [];
  const categoryData = stats?.categoryData || [];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-card-gradient border border-amber-500/30 shadow-xl">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-devanagari">
            आर्थिक हिशोब व अहवाल (Financial Reports & Balance Sheet)
          </h1>
          <p className="text-xs text-amber-400 font-devanagari mt-0.5">
            {settings?.mandalName || 'अष्टविनायक मित्र मंडळ'} • {settings?.festivalYear || '३९ वा गणेशोत्सव २०२६'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 transition-all font-devanagari"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            अहवाल प्रिंट करा (Print)
          </button>

          <ExcelExportButton
            onExport={downloadCompleteAccountsExcel}
            label="संपूर्ण ताळेबंद Excel"
            labelEn="Accounts .xlsx"
            variant="gold"
            size="sm"
          />
        </div>
      </div>

      {/* Printable Financial Summary Sheet Container */}
      <div id="printable-receipt" className="bg-[#14141E] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8 font-devanagari text-gray-200">
        
        {/* Printable Header Banner */}
        <div className="text-center border-b-2 border-amber-500/40 pb-5">
          <p className="text-sm font-bold text-orange-400 tracking-wider">|| गणपती बाप्पा मोरया ||</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {settings?.mandalName || 'अष्टविनायक मित्र मंडळ'}
          </h2>
          <p className="text-xs md:text-sm text-amber-300/90 font-semibold mt-0.5">
            {settings?.location || 'रोहित कॉलनी, बोईसर (पश्चिम)'} • स्थापना : {settings?.establishedYear || 1987}
          </p>
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300">
            {settings?.festivalYear || '३९ वा गणेशोत्सव २०२६'} — अधिकृत आर्थिक ताळेबंद अहवाल
          </div>
        </div>

        {/* 3 Executive Metric Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-xs font-semibold text-gray-400">एकूण जमा देणगी (Total Collection)</span>
            <div className="text-2xl md:text-3xl font-extrabold font-mono text-amber-400 mt-1">
              {formatCurrency(cards.totalCollection)}
            </div>
            <span className="text-[11px] text-gray-400 font-mono mt-1 block">{cards.totalTransactions || 0} एकूण पावत्या</span>
          </div>

          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
            <span className="text-xs font-semibold text-gray-400">एकूण उत्सव खर्च (Total Expenses)</span>
            <div className="text-2xl md:text-3xl font-extrabold font-mono text-red-400 mt-1">
              {formatCurrency(cards.totalExpenses)}
            </div>
            <span className="text-[11px] text-gray-400 font-mono mt-1 block">सक्रिय खर्च व्हाउचर्स</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-xs font-semibold text-gray-400">निव्वळ शिल्लक रक्कम (Net Treasury Balance)</span>
            <div className="text-2xl md:text-3xl font-extrabold font-mono text-emerald-400 mt-1">
              {formatCurrency(cards.currentBalance)}
            </div>
            <span className="text-[11px] text-emerald-300 font-bold mt-1 block">जमा वजा खर्च शिल्लक</span>
          </div>
        </div>

        {/* Section: Payment Modes Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-amber-300 border-b border-gray-800 pb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>१. संकलन पेमेंट पद्धतीनुसार वर्गीकरण (Payment Mode Distribution)</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181824] text-amber-300 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">पेमेंट प्रकार (Mode)</th>
                  <th className="px-4 py-3">पावत्या संख्या (Count)</th>
                  <th className="px-4 py-3">एकूण जमा रक्कम (Amount ₹)</th>
                  <th className="px-4 py-3 text-right">टक्केवारी (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paymentModes.map((pm, idx) => (
                  <tr key={idx} className="hover:bg-amber-500/5">
                    <td className="px-4 py-3 font-semibold text-white">{pm.name}</td>
                    <td className="px-4 py-3 font-mono text-gray-300">{pm.count} पावत्या</td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">{formatCurrency(pm.value)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-gray-300">{pm.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Expenses by Category Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-amber-300 border-b border-gray-800 pb-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span>२. गणेशोत्सव खर्च वर्गवारीनुसार तपशील (Expenses by Category)</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181824] text-amber-300 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">खर्च वर्गवारी (Category)</th>
                  <th className="px-4 py-3">व्हाउचर संख्या</th>
                  <th className="px-4 py-3">एकूण खर्च रक्कम (Amount ₹)</th>
                  <th className="px-4 py-3 text-right">खर्चाचा वाटा (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {categoryData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">कोणतीही खर्च नोंद उपलब्ध नाही.</td>
                  </tr>
                ) : (
                  categoryData.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-amber-500/5">
                      <td className="px-4 py-3 font-semibold text-white">{cat.category}</td>
                      <td className="px-4 py-3 font-mono text-gray-300">{cat.count} व्हाउचर्स</td>
                      <td className="px-4 py-3 font-mono font-bold text-red-400">{formatCurrency(cat.amount)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-right text-gray-300">{cat.percentage}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Monthly Summary Sheet */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-amber-300 border-b border-gray-800 pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>३. महिनानिहाय हिशोब गोषवारा (Month-wise Financial Aggregation)</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181824] text-amber-300 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">महिना (Month)</th>
                  <th className="px-4 py-3">पावत्या</th>
                  <th className="px-4 py-3">एकूण जमा (₹)</th>
                  <th className="px-4 py-3">एकूण खर्च (₹)</th>
                  <th className="px-4 py-3 text-right">शिल्लक (Net Balance ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {monthlyData.map((m, idx) => (
                  <tr key={idx} className="hover:bg-amber-500/5">
                    <td className="px-4 py-3 font-bold text-white font-mono">{m.month}</td>
                    <td className="px-4 py-3 font-mono text-gray-300">{m.count}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{formatCurrency(m.totalCollection)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-red-400">{formatCurrency(m.totalExpenses)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-amber-300">{formatCurrency(m.netBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Signatures */}
        <div className="mt-12 pt-8 border-t border-gray-700 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="h-10"></div>
            <div className="border-t border-gray-600 pt-1 font-bold text-gray-300">
              खजिनदार (Treasurer)
            </div>
          </div>

          <div>
            <div className="h-10"></div>
            <div className="border-t border-gray-600 pt-1 font-bold text-gray-300">
              कार्याध्यक्ष (Working President)
            </div>
          </div>

          <div>
            <div className="h-10"></div>
            <div className="border-t border-gray-600 pt-1 font-bold text-gray-300">
              अध्यक्ष (President)
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-800">
          अष्टविनायक मित्र मंडळ, रोहित कॉलनी, बोईसर — अधिकृत हिशोब प्रणाली
        </div>

      </div>

    </div>
  );
}
