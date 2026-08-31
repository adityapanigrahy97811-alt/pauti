import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, Download, X, CheckCircle, Share2, Sparkles } from 'lucide-react';
import { formatCurrency, formatDate, numberToWordsMarathi, numberToWordsEnglish } from '../utils/formatters';

export function ReceiptModal({ isOpen, onClose, collection, onCollectAgain }) {
  const { settings: globalSettings } = useAuth();
  const receiptRef = useRef(null);

  if (!isOpen || !collection) return null;

  const currentSettings = collection.settings || globalSettings;

  const handlePrint = () => {
    window.print();
  };

  const amountMarathi = collection.amountInWordsMr || numberToWordsMarathi(collection.amount);
  const amountEnglish = collection.amountInWordsEn || numberToWordsEnglish(collection.amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#14141E] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-[#1A1A26]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-devanagari">अधिकृत पावती (Donation Receipt)</h3>
              <p className="text-xs text-amber-400/80 font-mono">{collection.receiptNo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-semibold hover:from-amber-400 hover:to-orange-500 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              पावती छापा (Print)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 md:p-8 bg-[#0F0F16] overflow-y-auto max-h-[calc(85vh-120px)]">
          <div
            id="printable-receipt"
            ref={receiptRef}
            className="bg-white text-gray-900 rounded-xl p-6 md:p-8 border-2 border-amber-800/80 shadow-md relative font-devanagari"
          >
            {/* Traditional Top Ganesh Header & Mantra */}
            <div className="text-center border-b-2 border-amber-700/60 pb-4">
              <div className="text-sm font-bold text-amber-900 tracking-widest uppercase">
                ॥ श्री गणेशाय नमः ॥
              </div>
              <div className="text-lg font-extrabold text-orange-700 tracking-wider mt-0.5">
                {currentSettings?.brandingText || '|| गणपती बाप्पा मोरया ||'}
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-amber-950 mt-1 tracking-tight">
                {currentSettings?.mandalName || 'अष्टविनायक मित्र मंडळ'}
              </h2>
              <p className="text-xs md:text-sm font-semibold text-gray-700">
                {currentSettings?.location || 'रोहित कॉलनी, बोईसर (पश्चिम), ता. जि. पालघर'}
              </p>

              <div className="mt-2 inline-flex items-center gap-3 px-3 py-0.5 rounded-full bg-amber-100/80 border border-amber-300 text-[11px] font-bold text-amber-900">
                <span>स्थापना : {currentSettings?.establishedYear || '१९८७'}</span>
                <span>•</span>
                <span>{currentSettings?.festivalYear || '३९ वा गणेशोत्सव २०२६'}</span>
              </div>
            </div>

            {/* Receipt Subtitle Banner */}
            <div className="my-4 flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="px-3 py-1 bg-amber-900 text-white rounded font-bold text-xs tracking-wider">
                देणगी पावती / DONATION RECEIPT
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-gray-500">पावती क्र. / No: </span>
                <span className="text-sm font-extrabold font-mono text-orange-800">{collection.receiptNo}</span>
              </div>
            </div>

            {/* Receipt Body Details */}
            <div className="space-y-3 text-xs md:text-sm text-gray-800">
              <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                <span className="font-semibold text-gray-600">दिनांक / Date:</span>
                <span className="font-bold text-gray-900">{formatDate(collection.collectionDate)}</span>
              </div>

              <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                <span className="font-semibold text-gray-600">श्री / सौ / मे. (Received from):</span>
                <span className="font-bold text-gray-950 text-sm md:text-base">{collection.donorName}</span>
              </div>

              {collection.mobile && !collection.mobile.startsWith('NA_') && collection.mobile !== '-' && (
                <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                  <span className="font-semibold text-gray-600">मोबाईल क्र. / Mobile:</span>
                  <span className="font-bold font-mono text-gray-900">{collection.mobile}</span>
                </div>
              )}

              {collection.address && collection.address !== '-' && (
                <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                  <span className="font-semibold text-gray-600">पत्ता / Address:</span>
                  <span className="font-medium text-gray-800 text-right">{collection.address}</span>
                </div>
              )}

              <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                <span className="font-semibold text-gray-600">कारण / Purpose:</span>
                <span className="font-semibold text-orange-900">{collection.purpose || 'Ganeshotsav Donation'}</span>
              </div>

              <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                <span className="font-semibold text-gray-600">पेमेंट प्रकार / Mode:</span>
                <span className="font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs">
                  {collection.paymentMode}
                </span>
              </div>

              <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                <span className="font-semibold text-gray-600">पावती प्रतिनिधी / Collector:</span>
                <span className="font-bold text-gray-950">
                  {collection.collectorName || collection.collector?.name || '-'}
                </span>
              </div>

              {/* Amount Highlight Box */}
              <div className="my-4 p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl border border-amber-300 flex items-center justify-between">
                <span className="font-bold text-sm text-amber-950">देणगी रक्कम / Amount:</span>
                <span className="text-xl md:text-2xl font-black text-orange-700 font-mono">
                  {formatCurrency(collection.amount)}
                </span>
              </div>

              {/* Amount In Words */}
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs space-y-1">
                <div>
                  <span className="font-semibold text-gray-600">अक्षरी (मराठी): </span>
                  <span className="font-bold text-gray-900">{amountMarathi}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">In Words (English): </span>
                  <span className="italic text-gray-800">{amountEnglish}</span>
                </div>
              </div>
            </div>

            {/* Signature & Seal Section */}
            <div className="mt-8 pt-4 border-t border-gray-300 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="h-10 flex items-end justify-center font-bold text-xs text-gray-800">
                  {collection.collectorName || collection.collector?.name || 'अधिकृत प्रतिनिधी'}
                </div>
                <div className="border-t border-gray-400 pt-1 text-[11px] font-semibold text-gray-600">
                  पावती घेणारा (Collector Signature)
                </div>
              </div>

              <div>
                <div className="h-10 flex items-end justify-center font-bold text-xs text-amber-950">
                  {currentSettings?.mandalName || 'अष्टविनायक मित्र मंडळ'}
                </div>
                <div className="border-t border-gray-400 pt-1 text-[11px] font-semibold text-gray-600">
                  {currentSettings?.authorizedSignatoryTitle || 'कार्याध्यक्ष / खजिनदार'} (Authorized Signatory)
                </div>
              </div>
            </div>

            {/* Marathi Blessing Footer & Operator Note */}
            <div className="mt-6 text-center text-xs font-semibold text-orange-950 border-t-2 border-amber-600/40 pt-3">
              <p>॥ {currentSettings?.receiptFooterMarathi || 'आपल्या सहकार्याबद्दल मनःपूर्वक धन्यवाद'} ॥</p>
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-normal mt-1 px-2">
                <span>नोंदणीकर्ता: {collection.createdBy?.name || 'Admin'}</span>
                <span>ही संगणकीय पावती आहे. / Computer generated receipt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="no-print p-4 border-t border-amber-500/20 bg-[#1A1A26] flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            बंद करा (Close)
          </button>

          <div className="flex items-center gap-2">
            {onCollectAgain && (
              <button
                onClick={() => {
                  onClose();
                  onCollectAgain();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-all"
              >
                + दुसरी पावती करा (Next Collection)
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold hover:from-amber-400 hover:to-orange-500 shadow-saffron-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              प्रिंट काढा (Print Receipt)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
