import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Power,
  Award,
  Phone,
  Calendar,
  Wallet,
  Receipt,
  X,
  User,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Collectors() {
  const { user, isTreasurer } = useAuth();
  const { lang, t } = useLanguage();

  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCollector, setEditingCollector] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCollectors();
  }, []);

  const fetchCollectors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collectors', {
        params: { includeStats: 'true' }
      });
      if (res.data.success) {
        setCollectors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load collectors:', err);
      toast.error(lang === 'mr' ? 'प्रतिनिधी यादी लोड करण्यात त्रुटी आली.' : 'Failed to load collectors.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormName('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (collector) => {
    setEditingCollector(collector);
    setFormName(collector.name);
    setIsEditModalOpen(true);
  };

  const handleAddCollector = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error(lang === 'mr' ? 'कृपया प्रतिनिधीचे नाव प्रविष्ट करा.' : 'Please enter collector name.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/collectors', {
        name: formName.trim()
      });

      if (res.data.success) {
        toast.success(
          lang === 'mr'
            ? `नवीन प्रतिनिधी यशस्वीपणे जोडले: ${res.data.data.name}`
            : `Collector added: ${res.data.data.name}`
        );
        setIsAddModalOpen(false);
        fetchCollectors();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || (lang === 'mr' ? 'प्रतिनिधी जतन करण्यात त्रुटी आली.' : 'Failed to add collector.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCollector = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !editingCollector) return;

    try {
      setSubmitting(true);
      const res = await api.put(`/collectors/${editingCollector.id}`, {
        name: formName.trim()
      });

      if (res.data.success) {
        toast.success(
          lang === 'mr'
            ? `प्रतिनिधी माहिती अद्ययावत केली: ${res.data.data.name}`
            : `Collector updated: ${res.data.data.name}`
        );
        setIsEditModalOpen(false);
        fetchCollectors();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || (lang === 'mr' ? 'बदल जतन करण्यात त्रुटी आली.' : 'Failed to update collector.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (collector) => {
    const actionText = collector.isActive
      ? (lang === 'mr' ? 'निष्क्रिय' : 'deactivate')
      : (lang === 'mr' ? 'सक्रिय' : 'activate');

    if (!window.confirm(
      lang === 'mr'
        ? `तुम्हाला खात्री आहे का की '${collector.name}' यांना ${actionText} करायचे आहे?`
        : `Are you sure you want to ${actionText} '${collector.name}'?`
    )) {
      return;
    }

    try {
      const res = await api.patch(`/collectors/${collector.id}/status`, {
        isActive: !collector.isActive
      });

      if (res.data.success) {
        toast.success(
          lang === 'mr'
            ? `प्रतिनिधी स्थिती बदलली: ${collector.name}`
            : `Collector status updated: ${collector.name}`
        );
        fetchCollectors();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || (lang === 'mr' ? 'स्थिती बदलण्यात त्रुटी आली.' : 'Failed to toggle status.'));
    }
  };

  // Filter collectors
  const filteredCollectors = collectors.filter((c) => {
    // Status Filter
    if (statusFilter === 'ACTIVE' && !c.isActive) return false;
    if (statusFilter === 'INACTIVE' && c.isActive) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return c.name.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate high-level summary
  const totalActiveCollectors = collectors.filter((c) => c.isActive).length;
  const grandTotalCollected = collectors.reduce((acc, c) => acc + (c.totalCollection || 0), 0);
  const grandTotalReceipts = collectors.reduce((acc, c) => acc + (c.totalCount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner with Action (Mocha Brown & Warm Taupe Palette) */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#2C1814] via-[#1F120E] to-[#140B09] border border-[#C8B09B]/35 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-[0_0_30px_rgba(74,46,43,0.3)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A2E2B] via-[#5A382F] to-[#75493E] border border-[#C8B09B]/50 flex items-center justify-center text-[#E8D7C8] text-xl shadow-[0_0_15px_rgba(200,176,155,0.3)]">
            👥
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#F5ECE3] font-devanagari tracking-wide">
              {lang === 'mr' ? 'पावती प्रतिनिधी व्यवस्थापन (Collectors Management)' : 'Collectors & Field Representatives'}
            </h1>
            <p className="text-xs text-[#E8D7C8]/90 font-devanagari mt-0.5">
              {lang === 'mr'
                ? 'देणगी संकलन प्रतिनिधींची यादी, कामगिरी आकडेवारी व नवीन नोंदणी (लॉगिन खात्याची गरज नाही)'
                : 'Manage field collection representatives & view performance statistics (No login accounts required)'}
            </p>
          </div>
        </div>

        {/* Add Collector Button */}
        {isTreasurer && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A2E2B] via-[#5A382F] to-[#75493E] hover:from-[#5A382F] hover:to-[#8B584B] border border-[#C8B09B]/50 text-[#F5ECE3] text-xs md:text-sm font-bold shadow-[0_0_15px_rgba(74,46,43,0.4)] transition-all font-devanagari shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#E8D7C8]" />
            <span>{lang === 'mr' ? '+ नवीन प्रतिनिधी जोडा' : '+ Add New Collector'}</span>
          </button>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1F120E] to-[#140B09] border border-[#C8B09B]/25 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#C8B09B] font-devanagari">
              {lang === 'mr' ? 'सक्रिय प्रतिनिधी (Active Collectors)' : 'Active Representatives'}
            </span>
            <UserCheck className="w-5 h-5 text-[#E8D7C8]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[#F5ECE3] mt-2">
            {totalActiveCollectors} <span className="text-xs text-[#C8B09B] font-normal">/ {collectors.length}</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1F120E] to-[#140B09] border border-[#C8B09B]/25 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#C8B09B] font-devanagari">
              {lang === 'mr' ? 'प्रतिनिधींमार्फत एकूण संकलन' : 'Total Field Collection'}
            </span>
            <Wallet className="w-5 h-5 text-[#E8D7C8]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[#E8D7C8] mt-2">
            {formatCurrency(grandTotalCollected)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1F120E] to-[#140B09] border border-[#C8B09B]/25 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#C8B09B] font-devanagari">
              {lang === 'mr' ? 'एकूण नोंदवलेल्या पावत्या' : 'Total Receipts Handled'}
            </span>
            <Receipt className="w-5 h-5 text-[#E8D7C8]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[#F5ECE3] mt-2">
            {grandTotalReceipts} <span className="text-xs text-[#C8B09B] font-normal">{lang === 'mr' ? 'पावत्या' : 'receipts'}</span>
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#1E1310] border border-[#301D18] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'mr' ? 'प्रतिनिधीच्या नावाने शोधा...' : 'Search by collector name...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#150D0B] border border-[#C8B09B]/30 text-xs text-[#F5ECE3] placeholder-[#C8B09B]/60 focus:outline-none focus:border-[#E8D7C8]"
          />
          <Search className="w-4 h-4 text-[#C8B09B] absolute left-3 top-2.5" />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'ALL', labelMr: 'सर्व', labelEn: 'All' },
            { id: 'ACTIVE', labelMr: 'सक्रिय (Active)', labelEn: 'Active' },
            { id: 'INACTIVE', labelMr: 'निष्क्रिय (Inactive)', labelEn: 'Inactive' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-[#4A2E2B] to-[#75493E] text-[#F5ECE3] border border-[#C8B09B]/60 shadow-[0_0_10px_rgba(74,46,43,0.4)]'
                  : 'bg-[#150D0B] text-[#C8B09B] hover:text-white border border-[#301D18]'
              }`}
            >
              {lang === 'mr' ? tab.labelMr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Collectors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-16">
            <div className="w-8 h-8 border-2 border-[#E8D7C8] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#C8B09B] font-devanagari">माहिती लोड होत आहे...</p>
          </div>
        ) : filteredCollectors.length === 0 ? (
          <div className="col-span-3 text-center py-16 bg-[#1E1310] rounded-3xl border border-[#301D18] space-y-3">
            <UserCheck className="w-10 h-10 text-[#C8B09B]/50 mx-auto" />
            <p className="text-sm font-bold text-[#F5ECE3] font-devanagari">
              {lang === 'mr' ? 'कोणताही प्रतिनिधी सापडला नाही.' : 'No collectors found.'}
            </p>
            {isTreasurer && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A2E2B] to-[#75493E] text-[#F5ECE3] border border-[#C8B09B]/40 text-xs font-bold font-devanagari hover:opacity-90"
              >
                + नवीन प्रतिनिधी जोडा
              </button>
            )}
          </div>
        ) : (
          filteredCollectors.map((c, index) => (
            <div
              key={c.id}
              className={`p-6 rounded-3xl bg-gradient-to-b from-[#1E1310] to-[#140B09] border shadow-xl hover:border-[#E8D7C8]/60 hover:shadow-[0_0_25px_rgba(74,46,43,0.35)] transition-all space-y-4 relative overflow-hidden flex flex-col justify-between ${
                c.isActive ? 'border-[#C8B09B]/30' : 'border-gray-800 opacity-60'
              }`}
            >
              {/* Top Collector Badge for index 0 if has collection */}
              {index === 0 && (c.totalCollection || 0) > 0 && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4A2E2B]/70 border border-[#C8B09B]/50 text-[#E8D7C8] text-[10px] font-bold shadow-sm">
                  <Award className="w-3.5 h-3.5 text-[#E8D7C8]" />
                  <span>{lang === 'mr' ? 'अव्वल प्रतिनिधी' : 'Top Collector'}</span>
                </div>
              )}

              <div>
                {/* Header Profile */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A2E2B] via-[#5A382F] to-[#75493E] border border-[#C8B09B]/50 flex items-center justify-center text-[#F5ECE3] font-bold text-lg shadow-[0_0_15px_rgba(74,46,43,0.4)]">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F5ECE3] font-devanagari">{c.name}</h3>
                    <p className="text-[11px] text-[#C8B09B] font-devanagari mt-0.5">
                      {lang === 'mr' ? 'पावती प्रतिनिधी' : 'Collection Representative'}
                    </p>
                  </div>
                </div>

                {/* Performance Box */}
                <div className="mt-4 p-4 rounded-2xl bg-[#110907] border border-[#301D18] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#C8B09B] font-devanagari">
                      {lang === 'mr' ? 'एकूण संकलन (Total):' : 'Total Collection:'}
                    </span>
                    <span className="font-mono font-bold text-[#E8D7C8] text-sm">
                      {formatCurrency(c.totalCollection || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#C8B09B] font-devanagari">
                      {lang === 'mr' ? 'पावत्या संख्या (Receipts):' : 'Receipts Handled:'}
                    </span>
                    <span className="font-mono font-bold text-[#F5ECE3]">
                      {c.totalCount || 0} {lang === 'mr' ? 'पावत्या' : 'receipts'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#301D18]">
                    <span className="text-[#E8D7C8] font-devanagari">
                      {lang === 'mr' ? 'आजचे संकलन (Today):' : "Today's Collection:"}
                    </span>
                    <span className="font-mono font-bold text-[#F5ECE3]">
                      {formatCurrency(c.todayCollection || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-[#C8B09B]">
                    <span>{lang === 'mr' ? 'शेवटची पावती:' : 'Last Collection:'}</span>
                    <span className="font-mono text-[#F5ECE3]/80">
                      {c.lastCollectionDate ? formatDate(c.lastCollectionDate) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions Footer */}
              <div className="pt-3 border-t border-[#301D18] flex items-center justify-between text-xs">
                <div>
                  {c.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4A2E2B]/50 border border-[#C8B09B]/40 text-[#E8D7C8] text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E8D7C8] animate-pulse" />
                      {lang === 'mr' ? 'सक्रिय' : 'Active'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/20 text-gray-400 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {lang === 'mr' ? 'निष्क्रिय' : 'Inactive'}
                    </span>
                  )}
                </div>

                {isTreasurer && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(c)}
                      className="p-1.5 rounded-lg bg-[#241713] hover:bg-[#4A2E2B] text-[#C8B09B] hover:text-[#E8D7C8] transition-colors"
                      title={lang === 'mr' ? 'संपादित करा' : 'Edit Collector'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        c.isActive
                          ? 'bg-[#241713] hover:bg-red-500/20 text-[#C8B09B] hover:text-red-400'
                          : 'bg-[#241713] hover:bg-emerald-500/20 text-[#C8B09B] hover:text-emerald-400'
                      }`}
                      title={c.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Add Collector Modal (Mocha Brown & Warm Taupe Theme) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#1E1310] border border-[#C8B09B]/50 rounded-3xl p-6 shadow-[0_0_35px_rgba(74,46,43,0.6)] space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#301D18]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4A2E2B] via-[#5A382F] to-[#75493E] border border-[#C8B09B]/50 flex items-center justify-center text-[#E8D7C8] shadow-sm">
                  <UserCheck className="w-5 h-5 text-[#E8D7C8]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5ECE3] font-devanagari tracking-wide">
                    {lang === 'mr' ? 'नवीन पावती प्रतिनिधी जोडा' : 'Add New Collector'}
                  </h3>
                  <p className="text-[11px] text-[#C8B09B] font-devanagari">
                    {lang === 'mr' ? 'देणगी पावतीसाठी प्रतिनिधीचे नाव' : 'Field representative for receipts'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[#C8B09B] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCollector} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#E8D7C8] font-devanagari mb-1">
                  {lang === 'mr' ? 'प्रतिनिधीचे नाव (Collector Name) *' : 'Collector Name *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={lang === 'mr' ? 'उदा. सचिन जाधव, राहुल मोरे...' : 'e.g. Sachin Jadhav, Rahul More...'}
                    required
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#150D0B] border border-[#C8B09B]/40 text-sm text-[#F5ECE3] placeholder-[#C8B09B]/60 focus:outline-none focus:border-[#E8D7C8] focus:ring-1 focus:ring-[#E8D7C8]"
                  />
                  <User className="w-4 h-4 text-[#C8B09B] absolute left-3 top-3" />
                </div>
              </div>

              <div className="pt-3 border-t border-[#301D18] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#C8B09B] hover:text-white hover:bg-white/5"
                >
                  {lang === 'mr' ? 'रद्द करा (Cancel)' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A2E2B] via-[#5A382F] to-[#75493E] hover:from-[#5A382F] hover:to-[#8B584B] border border-[#C8B09B]/50 text-[#F5ECE3] text-xs font-bold shadow-[0_0_15px_rgba(74,46,43,0.4)] transition-all flex items-center gap-1.5 disabled:opacity-50 font-devanagari"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-[#E8D7C8] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-[#E8D7C8]" />
                      <span>{lang === 'mr' ? 'प्रतिनिधी जोडा' : 'Add Collector'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Collector Modal (Mocha Brown & Warm Taupe Theme) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#1E1310] border border-[#C8B09B]/50 rounded-3xl p-6 shadow-[0_0_35px_rgba(74,46,43,0.6)] space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#301D18]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4A2E2B] via-[#5A382F] to-[#75493E] border border-[#C8B09B]/50 flex items-center justify-center text-[#E8D7C8] shadow-sm">
                  <Edit2 className="w-5 h-5 text-[#E8D7C8]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5ECE3] font-devanagari tracking-wide">
                    {lang === 'mr' ? 'प्रतिनिधी माहिती संपादित करा' : 'Edit Collector Details'}
                  </h3>
                  <p className="text-[11px] text-[#C8B09B] font-devanagari">
                    {editingCollector?.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-[#C8B09B] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCollector} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#E8D7C8] font-devanagari mb-1">
                  {lang === 'mr' ? 'प्रतिनिधीचे नाव (Collector Name) *' : 'Collector Name *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#150D0B] border border-[#C8B09B]/40 text-sm text-[#F5ECE3] placeholder-[#C8B09B]/60 focus:outline-none focus:border-[#E8D7C8]"
                  />
                  <User className="w-4 h-4 text-[#C8B09B] absolute left-3 top-3" />
                </div>
              </div>

              <div className="pt-3 border-t border-[#301D18] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#C8B09B] hover:text-white hover:bg-white/5"
                >
                  {lang === 'mr' ? 'रद्द करा (Cancel)' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A2E2B] via-[#5A382F] to-[#75493E] hover:from-[#5A382F] hover:to-[#8B584B] border border-[#C8B09B]/50 text-[#F5ECE3] text-xs font-bold shadow-[0_0_15px_rgba(74,46,43,0.4)] transition-all flex items-center gap-1.5 disabled:opacity-50 font-devanagari"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-[#E8D7C8] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#E8D7C8]" />
                      <span>{lang === 'mr' ? 'बदल जतन करा' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
