import React, { useState } from 'react';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';

export function ExcelExportButton({
  onExport,
  label = 'Excel डाऊनलोड करा',
  labelEn = 'Export Excel (.xlsx)',
  variant = 'gold', // gold, primary, outline
  size = 'md'
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await onExport();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setLoading(false);
    }
  };

  const variantStyles = {
    gold: 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-gold-sm hover:from-amber-400 hover:to-orange-500 border border-amber-400/30',
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm border border-emerald-400/30',
    outline: 'bg-transparent border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
  }[variant] || '';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs md:text-sm',
    lg: 'px-5 py-2.5 text-sm font-bold'
  }[size] || 'px-4 py-2 text-xs';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-white" />
      ) : (
        <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
      )}
      <span className="font-devanagari">{loading ? 'तयार होत आहे...' : label}</span>
      {labelEn && <span className="text-[10px] opacity-80 hidden sm:inline">({labelEn})</span>}
    </button>
  );
}
