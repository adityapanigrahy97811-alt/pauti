import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ExcelExportButton } from '../components/ExcelExportButton';
import { downloadExpensesExcel } from '../services/exportService';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  TrendingDown,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Ban,
  Calendar,
  IndianRupee,
  Tag,
  User,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  'Decoration',
  'Sound System',
  'Lighting',
  'Food',
  'Pooja Items',
  'Transport',
  'Printing',
  'Rent',
  'Electricity',
  'Other'
];

export function Expenses() {
  const { user, isTreasurer } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTotal, setActiveTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [paymentMode, setPaymentMode] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [voidModal, setVoidModal] = useState({ isOpen: false, expense: null });

  // Add Form state
  const [formCategory, setFormCategory] = useState('Decoration');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaymentMode, setFormPaymentMode] = useState('CASH');
  const [formPaidBy, setFormPaidBy] = useState(user?.name || '');
  const [formExpenseDate, setFormExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [page, limit, category, paymentMode, status, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchExpenses();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses', {
        params: {
          page,
          limit,
          search,
          category,
          paymentMode,
          status,
          startDate,
          endDate
        }
      });
      if (res.data.success) {
        setExpenses(res.data.data);
        setTotalCount(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
        setActiveTotal(res.data.filteredActiveTotal);
      }
    } catch (err) {
      console.error(err);
      toast.error('खर्च यादी लोड करता आली नाही.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(formAmount);
    if (!formDescription.trim() || !formPaidBy.trim() || isNaN(numAmount) || numAmount <= 0) {
      toast.error('सर्व आवश्यक माहिती योग्यरित्या भरा.');
      return;
    }

    try {
      setAddLoading(true);
      const res = await api.post('/expenses', {
        category: formCategory,
        description: formDescription.trim(),
        amount: numAmount,
        paymentMode: formPaymentMode,
        expenseDate: formExpenseDate,
        paidBy: formPaidBy.trim(),
        notes: formNotes.trim()
      });

      if (res.data.success) {
        toast.success(`खर्च व्हाउचर ${res.data.data.expenseId} नोंदवले गेले!`);
        setIsAddOpen(false);
        setFormDescription('');
        setFormAmount('');
        setFormNotes('');
        fetchExpenses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'खर्च नोंदवण्यात त्रुटी आली.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleVoidExpense = async (reason) => {
    if (!voidModal.expense) return;
    try {
      const res = await api.patch(`/expenses/${voidModal.expense.id}/void`, {
        voidReason: reason
      });
      if (res.data.success) {
        toast.success(`खर्च ${voidModal.expense.expenseId} रद्द (VOID) करण्यात आला.`);
        fetchExpenses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'खर्च रद्द करता आला नाही.');
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-card-gradient border border-amber-500/30 shadow-xl">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-devanagari">
            गणेशोत्सव खर्च व्यवस्थापन (Expenses Management)
          </h1>
          <p className="text-xs text-gray-400 font-devanagari mt-0.5">
            एकूण व्हाउचर्स: <span className="text-amber-400 font-mono font-bold">{totalCount}</span> • सक्रिय एकूण खर्च: <span className="text-red-400 font-mono font-bold">{formatCurrency(activeTotal)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <ExcelExportButton
            onExport={() => downloadExpensesExcel({ category, paymentMode, status, startDate, endDate })}
            label="Excel एक्सपोर्ट"
            labelEn="Expenses .xlsx"
            variant="outline"
            size="sm"
          />

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold shadow-sm hover:from-red-500 hover:to-orange-500 transition-all font-devanagari"
          >
            <PlusCircle className="w-4 h-4" />
            + नवीन खर्च नोंदवा
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
              placeholder="खर्च विवरण, व्यक्तीचे नाव किंवा व्हाऊचर क्र. शोधा..."
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

        {showFilters && (
          <div className="pt-3 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 font-devanagari">वर्गवारी (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">सर्व वर्गवारी (All Categories)</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 font-devanagari">पेमेंट प्रकार (Mode)</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">सर्व प्रकार (All)</option>
                <option value="CASH">CASH (रोख)</option>
                <option value="UPI">UPI (युपीआय)</option>
                <option value="BANK_TRANSFER">Bank Transfer (बँक)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 font-devanagari">सुरुवात दिनांक</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1 font-devanagari">शेवट दिनांक</label>
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

      {/* Expenses Table */}
      <div className="rounded-3xl bg-card-gradient border border-amber-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181824] text-amber-300 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-4 py-3.5">व्हाउचर क्र. (ID)</th>
                <th className="px-4 py-3.5">दिनांक (Date)</th>
                <th className="px-4 py-3.5">वर्गवारी (Category)</th>
                <th className="px-4 py-3.5">खर्च तपशील (Description)</th>
                <th className="px-4 py-3.5">रक्कम (Amount)</th>
                <th className="px-4 py-3.5">पेमेंट पद्धत</th>
                <th className="px-4 py-3.5">खर्च करणारा (Paid By)</th>
                <th className="px-4 py-3.5">स्थिती (Status)</th>
                <th className="px-4 py-3.5 text-right">कृती (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      title="कोणताही खर्च सापडला नाही"
                      titleEn="No expenses found"
                      description="नवीन खर्च नोंदवण्यासाठी खालील बटणावर क्लिक करा."
                      actionText="+ नवीन खर्च"
                      onAction={() => setIsAddOpen(true)}
                    />
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr
                    key={e.id}
                    className={`hover:bg-amber-500/5 transition-colors ${
                      e.status === 'VOID' ? 'opacity-60 bg-red-950/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-amber-400">
                      {e.expenseId}
                    </td>
                    <td className="px-4 py-3.5 text-gray-400">
                      {formatDate(e.expenseDate)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-white max-w-xs">
                      <div>{e.description}</div>
                      {e.notes && <div className="text-[10px] text-gray-400 italic mt-0.5">{e.notes}</div>}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-red-400 text-sm">
                      <span className={e.status === 'VOID' ? 'line-through text-gray-400' : ''}>
                        {formatCurrency(e.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-300">
                      {e.paymentMode}
                    </td>
                    <td className="px-4 py-3.5 text-gray-300">
                      {e.paidBy}
                    </td>
                    <td className="px-4 py-3.5">
                      {e.status === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                          सक्रिय
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-semibold" title={e.voidReason}>
                          रद्द (VOID)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {e.status === 'ACTIVE' && (
                        <button
                          onClick={() => setVoidModal({ isOpen: true, expense: e })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-[11px] font-semibold transition-colors"
                          title="खर्च रद्द करा"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          रद्द (Void)
                        </button>
                      )}
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

      {/* Add Expense Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#161622] border border-amber-500/30 rounded-3xl shadow-2xl p-6 md:p-8">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-devanagari mb-4">
              नवीन खर्च नोंदवा (Record New Expense)
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                  खर्च वर्गवारी (Category) *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                  खर्च विवरण (Description) *
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="उदा. मंडप डेकोरेशन ॲडव्हान्स, डीजे साऊंड भाडे..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                    रक्कम (Amount ₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="उदा. 2500"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs font-mono font-bold text-red-400 placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                    पेमेंट पद्धत *
                  </label>
                  <select
                    value={formPaymentMode}
                    onChange={(e) => setFormPaymentMode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="CASH">CASH (रोख)</option>
                    <option value="UPI">UPI (युपीआय)</option>
                    <option value="BANK_TRANSFER">Bank Transfer (बँक)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                    खर्च दिनांक *
                  </label>
                  <input
                    type="date"
                    value={formExpenseDate}
                    onChange={(e) => setFormExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                    खर्च करणारी व्यक्ती (Paid By) *
                  </label>
                  <input
                    type="text"
                    value={formPaidBy}
                    onChange={(e) => setFormPaidBy(e.target.value)}
                    placeholder="उदा. संतोष सावंत (खजिनदार)"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                  नोंदी / टीप (Notes / Bill Reference)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="उदा. ओमकार इलेक्ट्रॉनिक्स बिल क्र. ४५२"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold shadow-sm hover:from-red-500 hover:to-orange-500 transition-all font-devanagari"
                >
                  {addLoading ? 'नोंदणी सुरू आहे...' : 'खर्च जतन करा (Save Expense)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Void Confirmation Modal */}
      <ConfirmationModal
        isOpen={voidModal.isOpen}
        onClose={() => setVoidModal({ isOpen: false, expense: null })}
        onConfirm={handleVoidExpense}
        title="खर्च व्हाउचर रद्द करा (Void Expense)"
        titleEn={`Expense ID: ${voidModal.expense?.expenseId}`}
        message={`तुम्ही खर्च व्हाउचर ${voidModal.expense?.expenseId} (${formatCurrency(voidModal.expense?.amount)} - ${voidModal.expense?.category}) रद्द करू इच्छिता का?`}
        confirmButtonText="होय, खर्च रद्द करा (Void)"
      />

    </div>
  );
}
