import React from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';

export function EmptyState({
  title = 'कोणतीही नोंद सापडली नाही',
  titleEn = 'No records found',
  description = 'अद्याप या विभागात कोणतीही माहिती उपलब्ध नाही.',
  actionText,
  onAction,
  icon: Icon = Sparkles
}) {
  return (
    <div className="py-14 px-4 text-center rounded-2xl bg-card-gradient border border-amber-500/20 max-w-md mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-gold-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-white font-devanagari">{title}</h3>
      <p className="text-xs text-gray-400 mt-0.5">{titleEn}</p>
      <p className="text-xs text-gray-400 font-devanagari mt-2 max-w-xs mx-auto">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold font-devanagari shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}
