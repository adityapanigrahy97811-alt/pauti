import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Save, Sparkles, Building, Receipt, Shield } from 'lucide-react';

export function Settings() {
  const { settings, refreshMe } = useAuth();

  const [mandalName, setMandalName] = useState('');
  const [mandalNameEn, setMandalNameEn] = useState('');
  const [establishedYear, setEstablishedYear] = useState('1987');
  const [festivalYear, setFestivalYear] = useState('३९ वा गणेशोत्सव');
  const [location, setLocation] = useState('रोहित कॉलनी, बोईसर');
  const [locationEn, setLocationEn] = useState('Rohit Colony, Boisar');
  const [brandingText, setBrandingText] = useState('|| गणपती बाप्पा मोरया ||');
  const [receiptPrefix, setReceiptPrefix] = useState('MNDL');
  const [receiptFooterMarathi, setReceiptFooterMarathi] = useState('आपल्या सहकार्याबद्दल मनःपूर्वक धन्यवाद.');
  const [receiptFooterEnglish, setReceiptFooterEnglish] = useState('Thank you for your generous contribution.');
  const [authorizedSignatoryTitle, setAuthorizedSignatoryTitle] = useState('कार्याध्यक्ष / खजिनदार');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setMandalName(settings.mandalName || 'अष्टविनायक मित्र मंडळ');
      setMandalNameEn(settings.mandalNameEn || 'Ashtavinayak Mitra Mandal');
      setEstablishedYear(String(settings.establishedYear || 1987));
      setFestivalYear(settings.festivalYear || '३९ वा गणेशोत्सव');
      setLocation(settings.location || 'रोहित कॉलनी, बोईसर');
      setLocationEn(settings.locationEn || 'Rohit Colony, Boisar');
      setBrandingText(settings.brandingText || '|| गणपती बाप्पा मोरया ||');
      setReceiptPrefix(settings.receiptPrefix || 'MNDL');
      setReceiptFooterMarathi(settings.receiptFooterMarathi || 'आपल्या सहकार्याबद्दल मनःपूर्वक धन्यवाद.');
      setReceiptFooterEnglish(settings.receiptFooterEnglish || 'Thank you for your generous contribution.');
      setAuthorizedSignatoryTitle(settings.authorizedSignatoryTitle || 'कार्याध्यक्ष / खजिनदार');
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('/settings', {
        mandalName,
        mandalNameEn,
        establishedYear,
        festivalYear,
        location,
        locationEn,
        brandingText,
        receiptPrefix,
        receiptFooterMarathi,
        receiptFooterEnglish,
        authorizedSignatoryTitle
      });

      if (res.data.success) {
        toast.success('मंडळ सेटिंग्ज यशस्वीपणे जतन केल्या!');
        refreshMe();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'सेटिंग्ज जतन करण्यात त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-card-gradient border border-amber-500/30 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-devanagari">
            मंडळ माहिती व पावती सेटिंग्ज (Mandal & Receipt Settings)
          </h1>
          <p className="text-xs text-gray-400 font-devanagari mt-0.5">
            पावती फॉरमॅट, मंडळ नाव, उत्सव वर्ष व संदेश सानुकूल करा
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-card-gradient border border-amber-500/25 shadow-2xl space-y-6">
        
        {/* Section 1: Mandal Info */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300 font-devanagari mb-4 pb-2 border-b border-gray-800">
            <Building className="w-4 h-4 text-amber-400" />
            <span>१. मंडळ माहिती (Mandal Branding Details)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">मंडळाचे नाव (मराठी)</label>
              <input
                type="text"
                value={mandalName}
                onChange={(e) => setMandalName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">Mandal Name (English)</label>
              <input
                type="text"
                value={mandalNameEn}
                onChange={(e) => setMandalNameEn(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">स्थापना वर्ष (Established Year)</label>
              <input
                type="number"
                value={establishedYear}
                onChange={(e) => setEstablishedYear(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">उत्सव वर्ष (Festival Edition)</label>
              <input
                type="text"
                value={festivalYear}
                onChange={(e) => setFestivalYear(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">पत्ता / ठिकाण (मराठी)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">Location (English)</label>
              <input
                type="text"
                value={locationEn}
                onChange={(e) => setLocationEn(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Receipt Formats */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300 font-devanagari mb-4 pb-2 border-b border-gray-800">
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>२. पावती स्वरूप व संदेश (Receipt Format & Footer)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">पावती उपसर्ग (Receipt Prefix)</label>
              <input
                type="text"
                value={receiptPrefix}
                onChange={(e) => setReceiptPrefix(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">स्वाक्षरी पदनाम (Authorized Title)</label>
              <input
                type="text"
                value={authorizedSignatoryTitle}
                onChange={(e) => setAuthorizedSignatoryTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">पावती तळटीप संदेश (Marathi Footer)</label>
              <input
                type="text"
                value={receiptFooterMarathi}
                onChange={(e) => setReceiptFooterMarathi(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white text-xs font-bold shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all flex items-center gap-2 font-devanagari"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'जतन करत आहे...' : 'बदल जतन करा (Save Settings)'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
