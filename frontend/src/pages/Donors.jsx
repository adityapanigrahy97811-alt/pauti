import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ExcelExportButton } from '../components/ExcelExportButton';
import { downloadDonorsExcel } from '../services/exportService';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  MapPin,
  Calendar,
  History,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function Donors() {
  const { user, isTreasurer } = useAuth();
  const navigate = useNavigate();

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalContribution, setTotalContribution] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Selected Donor Profile Modal
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [donorHistory, setDonorHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Add Donor Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDonorName, setNewDonorName] = useState('');
  const [newDonorMobile, setNewDonorMobile] = useState('');
  const [newDonorAddress, setNewDonorAddress] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchDonors();
  }, [page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchDonors();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donors', {
        params: { page, limit, search }
      });
      if (res.data.success) {
        setDonors(res.data.data);
        setTotalCount(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
        setTotalContribution(res.data.filteredTotalContribution);
      }
    } catch (err) {
      console.error(err);
      toast.error('देणगीदार यादी लोड करता आली नाही.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = async (donor) => {
    setSelectedDonor(donor);
    setIsProfileOpen(true);
    try {
      setHistoryLoading(true);
      const res = await api.get(`/donors/${donor.id}`);
      if (res.data.success) {
        setDonorHistory(res.data.data.collections || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAddDonor = async (e) => {
    e.preventDefault();
    if (!newDonorName.trim()) {
      toast.error('कृपया देणगीदाराचे नाव प्रविष्ट करा.');
      return;
    }

    try {
      setAddLoading(true);
      const res = await api.post('/donors', {
        name: newDonorName.trim(),
        mobile: newDonorMobile.trim() || undefined,
        address: newDonorAddress.trim() || undefined
      });
      if (res.data.success) {
        toast.success('देणगीदार यशस्वीपणे नोंदवला!');
        setIsAddOpen(false);
        setNewDonorName('');
        setNewDonorMobile('');
        setNewDonorAddress('');
        fetchDonors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'देणगीदार नोंदणीत त्रुटी आली.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-card-gradient border border-amber-500/30 shadow-xl">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-devanagari">
            देणगीदार यादी (Donors Directory)
          </h1>
          <p className="text-xs text-gray-400 font-devanagari mt-0.5">
            एकूण देणगीदार: <span className="text-amber-400 font-mono font-bold">{totalCount}</span> • एकूण देणगी संकलन: <span className="text-emerald-400 font-mono font-bold">{formatCurrency(totalContribution)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isTreasurer && (
            <ExcelExportButton
              onExport={downloadDonorsExcel}
              label="Excel डिरेक्टरी"
              labelEn="Donors .xlsx"
              variant="outline"
              size="sm"
            />
          )}

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all font-devanagari"
          >
            <PlusCircle className="w-4 h-4" />
            + नवीन देणगीदार
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#14141E] border border-amber-500/20 shadow-md">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="देणगीदाराचे नाव किंवा मोबाईल नंबर शोधा..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-4 h-4 text-amber-400/70 absolute left-3 top-3" />
        </div>
      </div>

      {/* Donors Table */}
      <div className="rounded-3xl bg-card-gradient border border-amber-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181824] text-amber-300 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-4 py-3.5">देणगीदार नाव (Donor Name)</th>
                <th className="px-4 py-3.5">एकूण देणगी (Total Contribution)</th>
                <th className="px-4 py-3.5">पावत्या (Count)</th>
                <th className="px-4 py-3.5">शेवटची देणगी (Last Date)</th>
                <th className="px-4 py-3.5 text-right">कृती (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="कोणताही देणगीदार सापडला नाही"
                      titleEn="No donors found"
                      description="नवीन देणगीदार जोडण्यासाठी खालील बटणावर क्लिक करा."
                      actionText="+ नवीन देणगीदार"
                      onAction={() => setIsAddOpen(true)}
                    />
                  </td>
                </tr>
              ) : (
                donors.map((d) => (
                  <tr key={d.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="px-4 py-3.5 font-devanagari font-bold text-white text-sm">
                      {d.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(d.totalContribution)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                        {d.donationCount} पावत्या
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400">
                      {d.lastDonationDate ? formatDate(d.lastDonationDate) : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenProfile(d)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                        इतिहास (Profile)
                      </button>
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

      {/* Donor Profile & Transaction History Modal */}
      {isProfileOpen && selectedDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#161622] border border-amber-500/30 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden my-8 max-h-[90vh] flex flex-col justify-between">
            
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white font-devanagari">
                      {selectedDonor.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                      एकूण: {formatCurrency(selectedDonor.totalContribution)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    📱 {selectedDonor.mobile} {selectedDonor.address ? `• 📍 ${selectedDonor.address}` : ''}
                  </p>
                </div>

                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* History Table */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 font-devanagari">
                  मागील पावत्यांचा इतिहास (Donation History)
                </h4>

                <div className="overflow-y-auto max-h-64 rounded-xl border border-gray-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#12121A] text-gray-400 text-[10px] uppercase">
                      <tr>
                        <th className="px-3 py-2">पावती क्र.</th>
                        <th className="px-3 py-2">दिनांक</th>
                        <th className="px-3 py-2">रक्कम</th>
                        <th className="px-3 py-2">पेमेंट प्रकार</th>
                        <th className="px-3 py-2">कारण</th>
                        <th className="px-3 py-2">प्रतिनिधी</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-gray-300">
                      {historyLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-gray-500">
                            इतिहास लोड होत आहे...
                          </td>
                        </tr>
                      ) : donorHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-gray-500">
                            कोणतीही मागील पावती आढळली नाही.
                          </td>
                        </tr>
                      ) : (
                        donorHistory.map((h) => (
                          <tr key={h.id} className="hover:bg-amber-500/5">
                            <td className="px-3 py-2 font-mono text-amber-400 font-bold">{h.receiptNo}</td>
                            <td className="px-3 py-2 text-gray-400">{formatDate(h.collectionDate)}</td>
                            <td className="px-3 py-2 font-mono font-bold text-emerald-400">{formatCurrency(h.amount)}</td>
                            <td className="px-3 py-2">{h.paymentMode}</td>
                            <td className="px-3 py-2 text-gray-400">{h.purpose}</td>
                            <td className="px-3 py-2">{h.collector?.name || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                बंद करा (Close)
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/collections/new');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all font-devanagari"
              >
                + या देणगीदाराची नवीन पावती करा (Collect Again)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Donor Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#161622] border border-amber-500/30 rounded-3xl shadow-2xl p-6 md:p-8">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-devanagari mb-4">
              नवीन देणगीदार नोंदणी (Add New Donor)
            </h3>

            <form onSubmit={handleAddDonor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                  देणगीदाराचे नाव (Donor Full Name) *
                </label>
                <input
                  type="text"
                  value={newDonorName}
                  onChange={(e) => setNewDonorName(e.target.value)}
                  placeholder="उदा. राहुल विठ्ठल पाटील"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all font-devanagari"
                >
                  {addLoading ? 'नोंदवत आहे...' : 'देणगीदार जतन करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
