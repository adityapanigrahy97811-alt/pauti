import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'रद्द करण्याची खात्री करा',
  titleEn = 'Confirm Action',
  message,
  requireReason = true,
  confirmButtonText = 'रद्द करा (Void)',
  isDestructive = true
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requireReason && (!reason || !reason.trim())) {
      setError('कृपया रद्द करण्याचे कारण नमूद करा. (Reason is required)');
      return;
    }

    try {
      setLoading(true);
      await onConfirm(reason.trim());
      setReason('');
      setError('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161622] border border-red-500/30 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-devanagari">{title}</h3>
            <p className="text-xs text-gray-400">{titleEn}</p>
          </div>
        </div>

        {/* Message */}
        <div className="mt-4 text-xs md:text-sm text-gray-300">
          {message}
        </div>

        {/* Reason Input */}
        {requireReason && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
              रद्द करण्याचे कारण (Void Reason) *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="उदा. चुकीची रक्कम नोंदवली / पावती रद्द करण्याची विनंती..."
              className="w-full px-3 py-2 rounded-xl bg-[#0F0F17] border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            मागे जा (Cancel)
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 shadow-sm'
                : 'bg-amber-600 hover:bg-amber-500'
            } disabled:opacity-50`}
          >
            {loading ? 'प्रक्रिया सुरू आहे...' : confirmButtonText}
          </button>
        </div>

      </div>
    </div>
  );
}
