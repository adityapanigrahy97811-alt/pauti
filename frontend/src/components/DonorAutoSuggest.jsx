import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Search, UserCheck, Sparkles, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export function DonorAutoSuggest({
  value,
  onChange,
  onSelectDonor,
  placeholder,
  label
}) {
  const { lang } = useLanguage();
  const defaultPlaceholder = lang === 'mr' ? 'देणगीदाराचे पूर्ण नाव टाईप करा...' : 'Type donor full name...';
  const defaultLabel = lang === 'mr' ? 'देणगीदाराचे नाव (Donor Name)' : 'Donor Full Name';
  const activePlaceholder = placeholder || defaultPlaceholder;
  const activeLabel = label || defaultLabel;
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await api.get('/donors/suggest', {
            params: { query: query.trim() }
          });
          if (res.data.success) {
            setSuggestions(res.data.data);
            setIsOpen(res.data.data.length > 0);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (donor) => {
    setQuery(donor.name);
    setIsOpen(false);
    if (onSelectDonor) {
      onSelectDonor(donor);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
        {activeLabel} *
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={activePlaceholder}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
        />
        <Search className="w-4 h-4 text-amber-400/70 absolute left-3 top-3" />
        {loading && (
          <div className="absolute right-3 top-3 w-4 h-4 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
        )}
      </div>

      {/* Auto-suggest Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-[#161622] border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-[11px] font-semibold text-amber-300">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {lang === 'mr' ? 'उपलब्ध देणगीदार' : 'Existing Donors Found'}
            </span>
            <span className="text-gray-400">{suggestions.length} {lang === 'mr' ? 'निकाल' : 'results'}</span>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-gray-800">
            {suggestions.map((donor) => (
              <button
                key={donor.id}
                type="button"
                onClick={() => handleSelect(donor)}
                className="w-full px-3.5 py-2.5 text-left hover:bg-amber-500/10 flex items-center justify-between group transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 font-devanagari flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    {donor.name}
                  </div>
                  {(donor.mobile && !donor.mobile.startsWith('NA_')) || donor.address ? (
                    <div className="text-[11px] text-gray-400 font-mono">
                      {donor.mobile && !donor.mobile.startsWith('NA_') ? `📱 ${donor.mobile} ` : ''}
                      {donor.address && donor.address !== '-' ? `• 📍 ${donor.address}` : ''}
                    </div>
                  ) : null}
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/20">
                    {formatCurrency(donor.totalContribution)}
                  </span>
                  <div className="text-[10px] text-gray-400 font-devanagari mt-0.5">
                    {donor.donationCount} पावत्या
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
