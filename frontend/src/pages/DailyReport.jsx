import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  CalendarDays,
  Printer,
  Search,
  Wallet,
  TrendingDown,
  Scale,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function DailyReport() {
  const { settings } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyReport();
  }, [selectedDate]);

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/daily', {
        params: { date: selectedDate }
      });
      if (res.data.success) {
        setDailyData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const colBreakdown = dailyData?.collectionBreakdown || {};
  const expBreakdown = dailyData?.expensesBreakdown || {};
  const dayCollections = dailyData?.collections || [];
  const dayExpenses = dailyData?.expenses || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Controls Bar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-card-gradient border border-amber-500/30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white font-devanagari">
              दैनिक हिशोब वही (Daily Cash Book)
            </h1>
            <p className="text-xs text-gray-400 font-devanagari mt-0.5">
              दिवसनिहाय जमा-खर्च ताळेबंद व रोख शिल्लक
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#0F0F17] border border-amber-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-gray-400 font-devanagari">दिनांक:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none"
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all font-devanagari"
          >
            <Printer className="w-4 h-4" />
            प्रिंट काढा (Print Daily Book)
          </button>
        </div>
      </div>

      {/* Daily Balance Sheet Container */}
      <div id="printable-receipt" className="bg-[#14141E] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 font-devanagari text-gray-200">
        
        {/* Title Header */}
        <div className="text-center border-b-2 border-amber-500/40 pb-4">
          <p className="text-sm font-bold text-orange-400">|| गणपती बाप्पा मोरया ||</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
            {settings?.mandalName || 'अष्टविनायक मित्र मंडळ, रोहित कॉलनी, बोईसर'}
          </h2>
          <div className="inline-block mt-2 px-4 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300">
            दैनिक हिशोब ताळेबंद — दिनांक : {dailyData ? formatDate(selectedDate) : formatDate(new Date())}
          </div>
        </div>

        {/* 4 Core Accounting Summary Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="p-3.5 rounded-2xl bg-[#0F0F17] border border-gray-800 text-center">
            <span className="text-[11px] text-gray-400 font-semibold block">आरंभीची शिल्लक (Opening Balance)</span>
            <div className="text-lg md:text-xl font-bold font-mono text-gray-200 mt-1">
              {formatCurrency(dailyData?.openingBalance || 0)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-[11px] text-amber-400 font-semibold block">+ आजची जमा (Today's Collection)</span>
            <div className="text-lg md:text-xl font-bold font-mono text-amber-300 mt-1">
              {formatCurrency(dailyData?.todayCollection || 0)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
            <span className="text-[11px] text-red-400 font-semibold block">- आजचा खर्च (Today's Expenses)</span>
            <div className="text-lg md:text-xl font-bold font-mono text-red-300 mt-1">
              {formatCurrency(dailyData?.todayExpenses || 0)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center">
            <span className="text-[11px] text-emerald-400 font-semibold block">= अखेरची शिल्लक (Closing Balance)</span>
            <div className="text-lg md:text-xl font-extrabold font-mono text-emerald-300 mt-1">
              {formatCurrency(dailyData?.closingBalance || 0)}
            </div>
          </div>
        </div>

        {/* Mode breakdown for the day */}
        <div className="p-4 rounded-2xl bg-[#0F0F17] border border-gray-800 grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <span className="text-gray-400 block">रोख जमा (Cash):</span>
            <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">{formatCurrency(colBreakdown.cash || 0)}</span>
          </div>
          <div>
            <span className="text-gray-400 block">युपीआय जमा (UPI):</span>
            <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">{formatCurrency(colBreakdown.upi || 0)}</span>
          </div>
          <div>
            <span className="text-gray-400 block">बँक ट्रान्सफर (Bank):</span>
            <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">{formatCurrency(colBreakdown.bankTransfer || 0)}</span>
          </div>
        </div>

        {/* Detailed Transactions for the day */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Day Collections Ledger */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider border-b border-gray-800 pb-1">
              आज नोंदवलेल्या देणगी पावत्या ({dayCollections.length})
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181824] text-[10px] text-gray-400 uppercase">
                  <tr>
                    <th className="px-3 py-2">पावती क्र.</th>
                    <th className="px-3 py-2">देणगीदार</th>
                    <th className="px-3 py-2">रक्कम</th>
                    <th className="px-3 py-2">प्रकार</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {dayCollections.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">आज कोणतीही पावती नाही.</td>
                    </tr>
                  ) : (
                    dayCollections.map((c) => (
                      <tr key={c.id}>
                        <td className="px-3 py-2 font-mono text-amber-400 font-bold">{c.receiptNo}</td>
                        <td className="px-3 py-2 text-white font-medium">{c.donorName}</td>
                        <td className="px-3 py-2 font-mono font-bold text-emerald-400">{formatCurrency(c.amount)}</td>
                        <td className="px-3 py-2 text-gray-400 text-[10px]">{c.paymentMode}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Day Expenses Ledger */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider border-b border-gray-800 pb-1">
              आज नोंदवलेले खर्च व्हाउचर ({dayExpenses.length})
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181824] text-[10px] text-gray-400 uppercase">
                  <tr>
                    <th className="px-3 py-2">व्हाउचर क्र.</th>
                    <th className="px-3 py-2">विवरण</th>
                    <th className="px-3 py-2">रक्कम</th>
                    <th className="px-3 py-2">वर्गवारी</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {dayExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">आज कोणताही खर्च नाही.</td>
                    </tr>
                  ) : (
                    dayExpenses.map((e) => (
                      <tr key={e.id}>
                        <td className="px-3 py-2 font-mono text-amber-400 font-bold">{e.expenseId}</td>
                        <td className="px-3 py-2 text-white font-medium">{e.description}</td>
                        <td className="px-3 py-2 font-mono font-bold text-red-400">{formatCurrency(e.amount)}</td>
                        <td className="px-3 py-2 text-gray-400 text-[10px]">{e.category}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Signatures */}
        <div className="mt-10 pt-6 border-t border-gray-700 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="h-8"></div>
            <div className="border-t border-gray-600 pt-1 font-bold text-gray-300">
              खजिनदार स्वाक्षरी (Treasurer)
            </div>
          </div>
          <div>
            <div className="h-8"></div>
            <div className="border-t border-gray-600 pt-1 font-bold text-gray-300">
              कार्याध्यक्ष / अध्यक्ष (President)
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
