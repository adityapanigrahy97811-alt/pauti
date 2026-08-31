import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { UserCheck, Plus, Search, ChevronDown, Check, X, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';

export function CollectorSelect({
  value,
  onChange,
  onCollectorCreated,
  label,
  placeholder
}) {
  const { lang } = useLanguage();
  const [collectors, setCollectors] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef(null);

  const fetchCollectors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collectors', {
        params: { activeOnly: 'true' }
      });
      if (res.data.success) {
        setCollectors(res.data.data);
        // If no collector currently selected and list has collectors, auto-select first
        if (!value && res.data.data.length > 0 && onChange) {
          onChange(res.data.data[0].id, res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load collectors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectors();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCollector = collectors.find((c) => c.id === value);

  const filteredCollectors = collectors.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return c.name.toLowerCase().includes(q);
  });

  const handleSelect = (collector) => {
    if (onChange) {
      onChange(collector.id, collector);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error(lang === 'mr' ? 'कृपया प्रतिनिधीचे नाव प्रविष्ट करा.' : 'Please enter collector name.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/collectors', {
        name: newName.trim()
      });

      if (res.data.success) {
        const created = res.data.data;
        toast.success(
          lang === 'mr'
            ? `नवीन प्रतिनिधी जोडले: ${created.name} 🙏`
            : `Collector added: ${created.name} 🙏`
        );

        // Update list & select immediately
        setCollectors((prev) => [...prev, created]);
        if (onChange) {
          onChange(created.id, created);
        }
        if (onCollectorCreated) {
          onCollectorCreated(created);
        }

        // Reset & close modal
        setNewName('');
        setIsAddModalOpen(false);
        setIsOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || (lang === 'mr' ? 'प्रतिनिधी जतन करण्यात त्रुटी आली.' : 'Failed to add collector.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultLabel = lang === 'mr' ? 'पावती घेणारा प्रतिनिधी (Collector) *' : 'Collector / Representative *';
  const defaultPlaceholder = lang === 'mr' ? 'प्रतिनिधी निवडा...' : 'Select collector...';

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
        {label || defaultLabel}
      </label>

      {/* Selector Trigger Button (Mocha Brown & Warm Taupe Palette) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A110E] border border-[#C8B09B]/35 text-left text-sm text-[#F5ECE3] flex items-center justify-between hover:border-[#E8D7C8] focus:outline-none focus:border-[#E8D7C8] transition-all shadow-sm group hover:shadow-[0_0_12px_rgba(200,176,155,0.2)]"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4A2E2B] via-[#5A382F] to-[#75493E] border border-[#C8B09B]/40 flex items-center justify-center text-[#E8D7C8] text-xs shrink-0 font-bold shadow-sm">
            👤
          </div>
          <span className="truncate font-devanagari font-semibold tracking-wide">
            {selectedCollector ? (
              <span className="text-[#F5ECE3]">{selectedCollector.name}</span>
            ) : (
              <span className="text-gray-500 font-normal">{placeholder || defaultPlaceholder}</span>
            )}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#C8B09B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-[#1E1310] border border-[#C8B09B]/40 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Search Box */}
          <div className="p-2.5 border-b border-[#301D18] bg-[#160E0C]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'mr' ? 'प्रतिनिधी शोधा...' : 'Search collector name...'}
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#241713] border border-[#C8B09B]/30 text-xs text-[#F5ECE3] placeholder-[#C8B09B]/60 focus:outline-none focus:border-[#E8D7C8]"
              />
              <Search className="w-3.5 h-3.5 text-[#C8B09B] absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Collectors List */}
          <div className="max-h-52 overflow-y-auto divide-y divide-[#301D18]/60">
            {loading ? (
              <div className="py-4 text-center text-xs text-[#C8B09B]">
                <div className="w-4 h-4 border-2 border-[#E8D7C8] border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                लोड होत आहे...
              </div>
            ) : filteredCollectors.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#C8B09B] font-devanagari">
                {lang === 'mr' ? 'कोणताही प्रतिनिधी सापडला नाही.' : 'No active collectors found.'}
              </div>
            ) : (
              filteredCollectors.map((c) => {
                const isSelected = c.id === value;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#4A2E2B]/70 to-[#5A382F]/50 text-[#E8D7C8] font-bold border-l-2 border-[#C8B09B]'
                        : 'text-gray-200 hover:bg-[#4A2E2B]/25 hover:text-[#F5ECE3]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-devanagari text-sm font-semibold">{c.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#E8D7C8]" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom Quick-Add Trigger Button (Mocha Brown & Warm Taupe) */}
          <div className="p-2 border-t border-[#301D18] bg-[#160E0C]">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(true);
                setIsOpen(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#4A2E2B] via-[#5A382F] to-[#75493E] hover:from-[#5A382F] hover:to-[#8B584B] border border-[#C8B09B]/50 text-[#F5ECE3] text-xs font-bold font-devanagari flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#E8D7C8]" />
              <span className="tracking-wide">{lang === 'mr' ? '+ नवीन प्रतिनिधी जोडा' : '+ Add New Collector'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Quick Add Collector Modal (Mocha Brown & Warm Taupe Theme) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#1E1310] border border-[#C8B09B]/50 rounded-3xl p-6 shadow-[0_0_35px_rgba(74,46,43,0.6)] space-y-5 animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
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
                    {lang === 'mr' ? 'देणगी संकलनासाठी प्रतिनिधीचे नाव (Mocha & Taupe)' : 'Field collection representative'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[#C8B09B] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#E8D7C8] font-devanagari mb-1">
                  {lang === 'mr' ? 'प्रतिनिधीचे नाव (Collector Name) *' : 'Collector Full Name *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={lang === 'mr' ? 'उदा. सचिन जाधव, राहुल मोरे...' : 'e.g. Sachin Jadhav, Rahul More...'}
                    required
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#150D0B] border border-[#C8B09B]/40 text-sm text-[#F5ECE3] placeholder-[#C8B09B]/60 focus:outline-none focus:border-[#E8D7C8] focus:ring-1 focus:ring-[#E8D7C8]"
                  />
                  <User className="w-4 h-4 text-[#C8B09B] absolute left-3 top-3" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#301D18] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#C8B09B] hover:text-white hover:bg-white/5 transition-colors"
                >
                  {lang === 'mr' ? 'रद्द करा (Cancel)' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A2E2B] via-[#5A382F] to-[#75493E] hover:from-[#5A382F] hover:to-[#8B584B] border border-[#C8B09B]/50 text-[#F5ECE3] text-xs font-bold shadow-[0_0_15px_rgba(74,46,43,0.5)] transition-all flex items-center gap-1.5 disabled:opacity-50 font-devanagari"
                >
                  {isSubmitting ? (
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

    </div>
  );
}
