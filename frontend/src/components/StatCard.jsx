import React from 'react';
import { formatCurrencyCompact } from '../utils/formatters';

export function StatCard({
  title,
  titleEn,
  value,
  isCurrency = true,
  icon: Icon,
  colorScheme = 'gold', // gold, saffron, emerald, blue, red
  subtitle,
  onClick
}) {
  const schemeStyles = {
    gold: {
      border: 'border-amber-500/30 hover:border-amber-500/60',
      iconBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      glow: 'hover:shadow-gold-sm',
      gradientText: 'gold-gradient-text'
    },
    saffron: {
      border: 'border-orange-500/30 hover:border-orange-500/60',
      iconBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      glow: 'hover:shadow-saffron-sm',
      gradientText: 'saffron-gradient-text'
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      gradientText: 'text-emerald-400'
    },
    blue: {
      border: 'border-blue-500/30 hover:border-blue-500/60',
      iconBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      glow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]',
      gradientText: 'text-blue-400'
    },
    red: {
      border: 'border-red-500/30 hover:border-red-500/60',
      iconBg: 'bg-red-500/15 text-red-400 border-red-500/30',
      glow: 'hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]',
      gradientText: 'text-red-400'
    }
  }[colorScheme] || {
    border: 'border-gray-800',
    iconBg: 'bg-gray-800 text-gray-300',
    glow: '',
    gradientText: 'text-white'
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-card-gradient border ${schemeStyles.border} ${schemeStyles.glow} transition-all duration-200 backdrop-blur-sm ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{titleEn}</p>
          <h4 className="text-sm font-bold text-white font-devanagari mt-0.5">{title}</h4>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${schemeStyles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-tight ${schemeStyles.gradientText}`}>
          {isCurrency ? formatCurrencyCompact(value) : value?.toLocaleString('en-IN') || 0}
        </div>
        {subtitle && (
          <p className="text-[11px] text-gray-400 font-devanagari mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
