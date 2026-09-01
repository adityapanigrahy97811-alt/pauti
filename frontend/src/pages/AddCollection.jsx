import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { DonorAutoSuggest } from '../components/DonorAutoSuggest';
import { CollectorSelect } from '../components/CollectorSelect';
import { ReceiptModal } from '../components/ReceiptModal';
import { formatCurrency, numberToWordsMarathi, numberToWordsEnglish } from '../utils/formatters';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import {
  Receipt,
  User,
  Phone,
  MapPin,
  IndianRupee,
  CreditCard,
  Tag,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

export function AddCollection() {
  const { user, settings } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [donorName, setDonorName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [purpose, setPurpose] = useState('Ganeshotsav Donation');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().slice(0, 10));
  const [collectorId, setCollectorId] = useState('');

  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const handleSelectDonor = (donor) => {
    setDonorName(donor.name);
    if (donor.mobile && !donor.mobile.startsWith('NA_')) {
      setMobile(donor.mobile);
    }
    if (donor.address && donor.address !== '-') {
      setAddress(donor.address);
    }
    toast.success(
      lang === 'mr'
        ? `देणगीदार निवडले: ${donor.name} (एकूण पूर्वीचे योगदान: ${formatCurrency(donor.totalContribution)})`
        : `Donor selected: ${donor.name} (Lifetime: ${formatCurrency(donor.totalContribution)})`
    );
  };

  const amountPresets = [101, 251, 501, 1100, 2100, 5100];

  const parsedAmount = parseFloat(amount) || 0;
  const wordsMr = numberToWordsMarathi(parsedAmount);
  const wordsEn = numberToWordsEnglish(parsedAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!donorName.trim()) {
      toast.error(lang === 'mr' ? 'कृपया देणगीदाराचे नाव प्रविष्ट करा.' : 'Please enter donor name.');
      return;
    }

    if (parsedAmount <= 0) {
      toast.error(lang === 'mr' ? 'रक्कम ० पेक्षा जास्त असणे आवश्यक आहे.' : 'Amount must be greater than 0.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/collections', {
        donorName: donorName.trim(),
        mobile: mobile.trim() || '',
        address: address.trim() || '',
        amount: parsedAmount,
        paymentMode,
        purpose,
        collectionDate,
        collectorId: collectorId || user?.id
      });

      if (res.data.success) {
        // Confetti festive celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast.success(
          lang === 'mr'
            ? `पावती तयार झाली: ${res.data.data.receiptNo} 🙏`
            : `Receipt generated: ${res.data.data.receiptNo} 🙏`
        );
        setSelectedReceipt(res.data.data);
        setIsReceiptOpen(true);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || (lang === 'mr' ? 'पावती जतन करण्यात त्रुटी आली.' : 'Failed to save receipt.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setDonorName('');
    setMobile('');
    setAddress('');
    setAmount('');
    setPaymentMode('CASH');
    setPurpose('Ganeshotsav Donation');
    setCollectionDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#181824] via-[#14141E] to-[#101018] border border-amber-500/30 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg sm:text-xl shadow-gold-sm shrink-0">
            🧾
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white font-devanagari">
              {lang === 'mr' ? 'नवीन देणगी पावती नोंदवा' : 'Record New Donation Collection'}
            </h1>
            <p className="text-xs text-amber-400 font-devanagari mt-0.5">
              {lang === 'mr' ? (settings?.mandalName || 'अष्टविनायक मित्र मंडळ') : (settings?.mandalNameEn || 'Ashtavinayak Mitra Mandal')} • {lang === 'mr' ? (settings?.festivalYear || '३९ वा गणेशोत्सव २०२६') : '39th Ganeshotsav 2026'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Collection Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 rounded-3xl bg-[#14141E]/95 border border-amber-500/25 shadow-2xl space-y-5 sm:space-y-6">
        
        {/* Section 1: Donor Information */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300 font-devanagari pb-2 border-b border-gray-800">
            <User className="w-4 h-4 text-amber-400" />
            <span>{lang === 'mr' ? '१. देणगीदार माहिती (Donor Information)' : '1. Donor Information'}</span>
          </div>

          <div>
            {/* Auto-suggest Search / Name */}
            <DonorAutoSuggest
              value={donorName}
              onChange={setDonorName}
              onSelectDonor={handleSelectDonor}
              placeholder={lang === 'mr' ? 'देणगीदाराचे पूर्ण नाव...' : 'Type donor full name...'}
              label={lang === 'mr' ? 'देणगीदाराचे नाव (Donor Name)' : 'Donor Full Name'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                {lang === 'mr' ? 'मोबाईल क्र. (Mobile Number)' : 'Mobile Number'}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder={lang === 'mr' ? 'उदा. 9822001122' : 'e.g. 9822001122'}
                  maxLength={10}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono transition-all"
                />
                <Phone className="w-4 h-4 text-amber-400/70 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                {lang === 'mr' ? 'पत्ता / कॉलनी (Address / Area)' : 'Address / Area'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={lang === 'mr' ? 'उदा. रोहित कॉलनी, बोईसर' : 'e.g. Rohit Colony, Boisar'}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-devanagari transition-all"
                />
                <MapPin className="w-4 h-4 text-amber-400/70 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Collection Amount & Payment Mode */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300 font-devanagari pb-2 border-b border-gray-800">
            <IndianRupee className="w-4 h-4 text-amber-400" />
            <span>{lang === 'mr' ? '२. देणगी रक्कम व पेमेंट (Amount & Payment)' : '2. Donation Amount & Payment'}</span>
          </div>

          <div className="space-y-3">
            {/* Amount Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 font-devanagari mb-1.5">
                {lang === 'mr' ? 'जलद रक्कम निवडा (Quick Amount):' : 'Quick Amount Presets:'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {amountPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-mono font-bold transition-all min-h-[44px] ${
                      parsedAmount === preset
                        ? 'bg-amber-500 text-black border-amber-400 shadow-gold-sm'
                        : 'bg-[#0F0F17] border-gray-800 text-gray-300 hover:border-amber-500/50 active:scale-95'
                    }`}
                  >
                    ₹{preset.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount & Payment Mode Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                  {lang === 'mr' ? 'रक्कम (Amount in ₹) *' : 'Amount (in ₹) *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={lang === 'mr' ? 'उदा. ५०१' : 'e.g. 501'}
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-lg font-mono font-bold text-emerald-400 placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-all min-h-[46px]"
                  />
                  <IndianRupee className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                  {lang === 'mr' ? 'पेमेंट प्रकार (Payment Mode) *' : 'Payment Mode *'}
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-sm text-white focus:outline-none focus:border-amber-400 transition-all min-h-[46px]"
                >
                  <option value="CASH">{lang === 'mr' ? 'रोख (CASH)' : 'Cash (CASH)'}</option>
                  <option value="UPI">{lang === 'mr' ? 'युपीआय / QR Code (UPI)' : 'UPI / QR Code (UPI)'}</option>
                  <option value="BANK_TRANSFER">{lang === 'mr' ? 'बँक ट्रान्सफर (Bank Transfer)' : 'Bank Transfer / NEFT'}</option>
                </select>
              </div>
            </div>

            {/* Live Amount in Words Card */}
            {parsedAmount > 0 && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-amber-300 font-devanagari shrink-0">
                    {lang === 'mr' ? 'अक्षरी रक्कम:' : 'In Words:'}
                  </span>
                  <span className="font-bold text-white font-devanagari">{wordsMr}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Date & Collector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
              {lang === 'mr' ? 'पावती दिनांक (Collection Date)' : 'Collection Date'}
            </label>
            <div className="relative">
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400 min-h-[44px]"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <CollectorSelect
              value={collectorId}
              onChange={(id) => setCollectorId(id)}
              label={lang === 'mr' ? 'पावती घेणारा प्रतिनिधी (Collector) *' : 'Collector / Representative *'}
              placeholder={lang === 'mr' ? 'प्रतिनिधी निवडा...' : 'Select collector...'}
            />
          </div>
        </div>

        {/* Submit & Reset Buttons */}
        <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetForm}
            className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 border border-gray-800 transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'फॉर्म रिसेट करा (Clear Form)' : 'Clear Form'}</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white text-sm font-bold shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-devanagari active:scale-98 min-h-[48px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {lang === 'mr' ? 'पावती जतन करा व प्रिंट काढा' : 'Save & Print Receipt'}
                </span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Instant Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        collection={selectedReceipt}
        onCollectAgain={handleResetForm}
      />

    </div>
  );
}
