import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { ReceiptModal } from '../components/ReceiptModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ExcelExportButton } from '../components/ExcelExportButton';
import { downloadCollectionsExcel } from '../services/exportService';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Printer,
  Ban,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export function Collections() {
  const { user, isTreasurer } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredActiveTotal, setFilteredActiveTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState('ALL');
  const [purpose, setPurpose] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [collectorId, setCollectorId] = useState('ALL');
  const [collectorsList, setCollectorsList] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [voidModal, setVoidModal] = useState({ isOpen: false, collection: null });

  useEffect(() => {
    fetchCollectorsList();
  }, []);

  const fetchCollectorsList = async () => {
    try {
      const res = await api.get('/collectors');
      if (res.data.success) {
        setCollectorsList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load collectors list:', err);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [page, limit, paymentMode, purpose, status, collectorId, startDate, endDate]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCollections();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collections', {
        params: {
          page,
          limit,
          search,
          paymentMode,
          purpose,
          status,
          collectorId: collectorId !== 'ALL' ? collectorId : undefined,
          startDate,
          endDate
        }
      });
      if (res.data.success) {
        setCollections(res.data.data);
        setTotalCount(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
        setFilteredActiveTotal(res.data.filteredActiveTotal);
      }
    } catch (err) {
      console.error(err);
      toast.error('पावत्या लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReceipt = async (id) => {
    try {
      const res = await api.get(`/collections/${id}`);
      if (res.data.success) {
        setSelectedReceipt(res.data.data);
        setIsReceiptOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVoidCollection = async (reason) => {
    if (!voidModal.collection) return;
    try {
      const res = await api.patch(`/collections/${voidModal.collection.id}/void`, {
        voidReason: reason
      });
      if (res.data.success) {
        toast.success(`पावती ${voidModal.collection.receiptNo} रद्द (VOID) करण्यात आली.`);
        fetchCollections();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'पावती रद्द करता आली नाही.');
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-card-gradient border border-amber-500/30 shadow-xl">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-devanagari">
            देणगी पावत्या / संकलन (Cash Collections)
          </h1>
          <p className="text-xs text-gray-400 font-devanagari mt-0.5">
            एकूण नोंदी: <span className="text-amber-400 font-mono font-bold">{totalCount}</span> • सक्रिय एकूण रक्कम: <span className="text-emerald-400 font-mono font-bold">{formatCurrency(filteredActiveTotal)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isTreasurer && (
            <ExcelExportButton
              onExport={() => downloadCollectionsExcel({ paymentMode, purpose, status, collectorId: collectorId !== 'ALL' ? collectorId : undefined, startDate, endDate })}
              label="Excel एक्सपोर्ट"
              labelEn="Collections .xlsx"
              variant="outline"
              size="sm"
            />
          )}

          <button
            onClick={() => navigate('/collections/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all font-devanagari"
          >
            <PlusCircle className="w-4 h-4" />
            + नवीन पावती
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#14141E] border border-amber-500/20 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="देणगीदाराचे नाव किंवा पावती क्र. शोधा..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-4 h-4 text-amber-400/70 absolute left-3 top-3" />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              showFilters
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#0F0F17] text-gray-400 border-gray-800 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>फिल्टर्स (Filters)</span>
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <div className="pt-3 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 animate-in fade-in">
            {/* 1. Payment Mode */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 font-devanagari">पेमेंट प्रकार (Mode)</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-400 font-devanagari"
              >
                <option value="ALL">सर्व प्रकार (All Modes)</option>
                <option value="CASH">CASH (रोख)</option>
                <option value="UPI">UPI (युपीआय)</option>
                <option value="BANK_TRANSFER">Bank Transfer (बँक ट्रान्सफर)</option>
              </select>
            </div>

            {/* 2. Collector / Representative Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-[#E8D7C8] mb-1 font-devanagari flex items-center justify-between">
                <span>पावती प्रतिनिधी (Collector)</span>
                {collectorId !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setCollectorId('ALL')}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </label>
              <select
                value={collectorId}
                onChange={(e) => setCollectorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1E1310] border border-[#C8B09B]/40 text-xs text-[#F5ECE3] focus:outline-none focus:border-[#E8D7C8] font-devanagari"
              >
                <option value="ALL">सर्व प्रतिनिधी (All Collectors)</option>
                {collectorsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Status */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 font-devanagari">स्थिती (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-400 font-devanagari"
              >
                <option value="ALL">सर्व (All)</option>
                <option value="ACTIVE">सक्रिय (ACTIVE)</option>
                <option value="VOID">रद्द (VOID)</option>
              </select>
            </div>

            {/* 4. From Date */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 font-devanagari">सुरुवातीचा दिनांक (From Date)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* 5. To Date */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 font-devanagari">शेवटचा दिनांक (To Date)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Collections Table */}
      <div className="rounded-3xl bg-card-gradient border border-amber-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181824] text-amber-300 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-4 py-3.5">पावती क्र. (Receipt No)</th>
                <th className="px-4 py-3.5">दिनांक (Date)</th>
                <th className="px-4 py-3.5">देणगीदार (Donor)</th>
                <th className="px-4 py-3.5">रक्कम (Amount)</th>
                <th className="px-4 py-3.5">पेमेंट पद्धत</th>
                <th className="px-4 py-3.5">प्रतिनिधी (Collector)</th>
                <th className="px-4 py-3.5">स्थिती (Status)</th>
                <th className="px-4 py-3.5 text-right">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title="कोणतीही पावती सापडली नाही"
                      titleEn="No collections found"
                      description="नवीन पावती तयार करण्यासाठी खालील बटणावर क्लिक करा."
                      actionText="+ नवीन पावती"
                      onAction={() => navigate('/collections/new')}
                    />
                  </td>
                </tr>
              ) : (
                collections.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-amber-500/5 transition-colors ${
                      c.status === 'VOID' ? 'opacity-60 bg-red-950/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-amber-400">
                      {c.receiptNo}
                    </td>
                    <td className="px-4 py-3.5 text-gray-400">
                      {formatDate(c.collectionDate)}
                    </td>
                    <td className="px-4 py-3.5 font-devanagari font-semibold text-white">
                      <div>{c.donorName}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 text-sm">
                      <span className={c.status === 'VOID' ? 'line-through text-gray-400' : ''}>
                        {formatCurrency(c.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px] font-semibold">
                        {c.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-300 font-devanagari">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-[#4A2E2B]/50 to-[#5A382F]/40 border border-[#C8B09B]/40 text-[#E8D7C8] text-xs font-semibold shadow-sm">
                        <span className="text-[10px]">👤</span>
                        <span>{c.collector?.name || c.collectorName || '-'}</span>
                      </div>
                      {c.createdBy?.name && (
                        <div className="text-[10px] text-gray-400 font-sans mt-0.5 pl-1">
                          {lang === 'mr' ? 'नोंद: ' : 'Op: '}{c.createdBy.name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {c.status === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                          सक्रिय
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-semibold" title={c.voidReason}>
                          रद्द (VOID)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReceipt(c.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] font-semibold transition-colors"
                        title="पावती छापा / पहा"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        पावती
                      </button>

                      {isTreasurer && c.status === 'ACTIVE' && (
                        <button
                          onClick={() => setVoidModal({ isOpen: true, collection: c })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-[11px] font-semibold transition-colors"
                          title="पावती रद्द करा (Void)"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          रद्द
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        collection={selectedReceipt}
      />

      {/* Void Confirmation Modal */}
      <ConfirmationModal
        isOpen={voidModal.isOpen}
        onClose={() => setVoidModal({ isOpen: false, collection: null })}
        onConfirm={handleVoidCollection}
        title="पावती रद्द करा (Void Receipt)"
        titleEn={`Receipt No: ${voidModal.collection?.receiptNo}`}
        message={`तुम्ही पावती ${voidModal.collection?.receiptNo} (रक्कम ${formatCurrency(voidModal.collection?.amount)}) रद्द करू इच्छिता का? रद्द केलेली पावती एकूण हिशोबात गणली जाणार नाही.`}
        confirmButtonText="होय, पावती रद्द करा (Void)"
      />

    </div>
  );
}
