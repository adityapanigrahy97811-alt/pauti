import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDateTime } from '../utils/formatters';
import { Database, Search, Filter, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [action, setAction] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, limit, action]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs', {
        params: { page, limit, action, search }
      });
      if (res.data.success) {
        setLogs(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const actionColors = {
    LOGIN: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    CREATE_COLLECTION: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    VOID_COLLECTION: 'bg-red-500/20 text-red-300 border-red-500/30',
    CREATE_EXPENSE: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    VOID_EXPENSE: 'bg-red-500/20 text-red-300 border-red-500/30',
    EXPORT_EXCEL: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    CREATE_USER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    CHANGE_SETTINGS: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-card-gradient border border-amber-500/30 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-devanagari">
            सिस्टीम ऑडिट ट्रेल (Security & Audit Logs)
          </h1>
          <p className="text-xs text-gray-400 font-devanagari mt-0.5">
            एकूण नोंदी: <span className="text-amber-400 font-mono font-bold">{totalCount}</span> • सर्व आर्थिक व वापरकर्ता हालचालींची सुरक्षित नोंद
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#14141E] border border-amber-500/20 shadow-md flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="वापरकर्ता, विवरण किंवा आयपी ॲड्रेस शोधा..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-4 h-4 text-amber-400/70 absolute left-3 top-3" />
        </div>

        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="ALL">सर्व ॲक्शन (All Actions)</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE_COLLECTION">CREATE_COLLECTION</option>
          <option value="VOID_COLLECTION">VOID_COLLECTION</option>
          <option value="CREATE_EXPENSE">CREATE_EXPENSE</option>
          <option value="VOID_EXPENSE">VOID_EXPENSE</option>
          <option value="EXPORT_EXCEL">EXPORT_EXCEL</option>
          <option value="CREATE_USER">CREATE_USER</option>
          <option value="CHANGE_SETTINGS">CHANGE_SETTINGS</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-card-gradient border border-amber-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181824] text-amber-300 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-4 py-3.5">वेळ (Timestamp)</th>
                <th className="px-4 py-3.5">कृती (Action)</th>
                <th className="px-4 py-3.5">वापरकर्ता (Actor)</th>
                <th className="px-4 py-3.5">तपशील (Description)</th>
                <th className="px-4 py-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 font-devanagari">
                    कोणताही ऑडिट लॉग सापडला नाही.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-400 whitespace-nowrap">
                      {formatDateTime(l.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${actionColors[l.action] || 'bg-gray-800 text-gray-300'}`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      <div>{l.userName}</div>
                      {l.role && <div className="text-[10px] text-amber-400/80 font-normal">{l.role}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-200">
                      {l.description}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-400 text-[11px]">
                      {l.ipAddress || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              पृष्ठ <span className="text-white font-bold">{page}</span> पैकी <span className="text-white font-bold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
