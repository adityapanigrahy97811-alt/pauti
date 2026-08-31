import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ExcelExportButton } from '../components/ExcelExportButton';
import {
  downloadCompleteAccountsExcel,
  downloadCollectionsExcel,
  downloadExpensesExcel,
  downloadDonorsExcel
} from '../services/exportService';
import {
  FileSpreadsheet,
  Database,
  ShieldCheck,
  Download,
  CalendarDays,
  Users,
  Receipt,
  TrendingDown,
  Sparkles,
  Info
} from 'lucide-react';

export function DataManagement() {
  const { settings } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-card-gradient border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL Primary Database + ExcelJS System</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-devanagari">
            डेटा व्यवस्थापन व एक्सेल हिशोब सिस्टीम (Data & Excel Accounting)
          </h1>
          <p className="text-xs md:text-sm text-gray-400 font-devanagari mt-1">
            {settings?.mandalName || 'अष्टविनायक मित्र मंडळ, रोहित कॉलनी, बोईसर'} (सन २०२६)
          </p>
        </div>

        <ExcelExportButton
          onExport={downloadCompleteAccountsExcel}
          label="संपूर्ण हिशोब Excel डाउनलोड"
          labelEn="Download 6-in-1 Workbook"
          variant="gold"
          size="lg"
        />
      </div>

      {/* Cloud Architecture Notice Card */}
      <div className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 font-devanagari leading-relaxed">
          <p className="font-bold text-amber-300">महत्त्वाची नोंद (Primary Source of Truth):</p>
          <p className="mt-0.5">
            सर्व पावत्या, खर्च, देणगीदार आणि आर्थिक व्यवहार थेट क्लाउड **PostgreSQL** डेटाबेसमध्ये कायमस्वरूपी सुरक्षित साठवले जातात. एक्सेल फायली या थेट डेटाबेसमधून तयार केल्या जातात.
          </p>
        </div>
      </div>

      {/* Grid of Excel Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: 6-in-1 Complete Accounts */}
        <div className="p-6 rounded-3xl bg-card-gradient border border-amber-500/40 shadow-xl hover:shadow-gold-sm transition-all flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl shadow-gold-sm mb-3">
              📊
            </div>
            <h3 className="text-base font-bold text-white font-devanagari">
              १. संपूर्ण हिशोब ताळेबंद (Complete Accounts Workbook)
            </h3>
            <p className="text-xs text-gray-400 font-devanagari mt-1.5 leading-relaxed">
              एकाच <span className="text-amber-300 font-mono font-bold">.xlsx</span> फाइलमध्ये ६ शीट्स: SUMMARY, COLLECTIONS, EXPENSES, DONORS, DAILY SUMMARY आणि MONTHLY SUMMARY.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-800">
            <ExcelExportButton
              onExport={downloadCompleteAccountsExcel}
              label="संपूर्ण हिशोब .xlsx डाउनलोड"
              variant="gold"
              size="md"
            />
          </div>
        </div>

        {/* Card 2: Collections Export */}
        <div className="p-6 rounded-3xl bg-card-gradient border border-gray-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl mb-3">
              🧾
            </div>
            <h3 className="text-base font-bold text-white font-devanagari">
              २. देणगी पावत्या एक्सेल (Collections Ledger)
            </h3>
            <p className="text-xs text-gray-400 font-devanagari mt-1.5 leading-relaxed">
              पावती क्र., दिनांक, देणगीदार, मोबाईल, पत्ता, रक्कम, पेमेंट प्रकार, प्रतिनिधी व निर्मिती वेळ.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-800">
            <ExcelExportButton
              onExport={() => downloadCollectionsExcel()}
              label="पावत्या Excel (.xlsx)"
              variant="primary"
              size="md"
            />
          </div>
        </div>

        {/* Card 3: Expenses Export */}
        <div className="p-6 rounded-3xl bg-card-gradient border border-gray-800 hover:border-red-500/30 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center text-xl mb-3">
              💸
            </div>
            <h3 className="text-base font-bold text-white font-devanagari">
              ३. गणेशोत्सव खर्च एक्सेल (Expenses Ledger)
            </h3>
            <p className="text-xs text-gray-400 font-devanagari mt-1.5 leading-relaxed">
              व्हाउचर क्र., वर्गवारी (Decoration, Sound, Pooja इ.), खर्च विवरण, रक्कम, पेमेंट पद्धत व नोंदी.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-800">
            <ExcelExportButton
              onExport={() => downloadExpensesExcel()}
              label="खर्च Excel (.xlsx)"
              variant="primary"
              size="md"
            />
          </div>
        </div>

        {/* Card 4: Donors Directory Export */}
        <div className="p-6 rounded-3xl bg-card-gradient border border-gray-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xl mb-3">
              👥
            </div>
            <h3 className="text-base font-bold text-white font-devanagari">
              ४. देणगीदार डिरेक्टरी (Donors Directory)
            </h3>
            <p className="text-xs text-gray-400 font-devanagari mt-1.5 leading-relaxed">
              सर्व देणगीदारांची यादी, संपर्क मोबाईल, पत्ता, एकूण जीवनगौरव योगदान आणि पावत्यांची संख्या.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-800">
            <ExcelExportButton
              onExport={downloadDonorsExcel}
              label="देणगीदार Excel (.xlsx)"
              variant="primary"
              size="md"
            />
          </div>
        </div>

        {/* Card 5: Formatted Excel Features */}
        <div className="p-6 rounded-3xl bg-[#14141E] border border-gray-800 flex flex-col justify-between space-y-3 md:col-span-2">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300 font-devanagari">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>व्यावसायिक एक्सेल वैशिष्ट्ये (Professional Excel Styling)</span>
            </div>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300 font-devanagari">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> बोल्ड सोनेरी आणि चारकोल हेडर रंगसंगती
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Freeze Top Panes (स्क्रोल करताना हेडर स्थिर)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> भारतीय चलन फॉरमॅट: <span className="font-mono text-amber-300">₹#,##0.00</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> दिनांक फॉरमॅट: <span className="font-mono text-amber-300">DD/MM/YYYY</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Auto-filters व स्वयंचलित सेल बॉर्डर
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> मजकुराच्या लांबीनुसार स्वयंचलित कॉलम रुंदी
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
