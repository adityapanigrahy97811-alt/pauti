import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  mr: {
    // Branding & Header
    mandalName: 'अष्टविनायक मित्र मंडळ',
    festivalYear: '३९ वा गणेशोत्सव २०२६',
    blessing: '|| गणपती बाप्पा मोरया ||',
    location: 'रोहित कॉलनी, बोईसर (स्थापना : १९८७)',
    
    // Navigation
    dashboard: 'डॅशबोर्ड',
    addCollection: 'नवीन पावती नोंदवा',
    collections: 'देणगी पावत्या',
    donors: 'देणगीदार यादी',
    expenses: 'खर्च नोंदणी',
    reports: 'आर्थिक अहवाल',
    dailyReport: 'दैनिक हिशोब ताळेबंद',
    dataManagement: 'डेटा व एक्सेल एक्सपोर्ट',
    collectors: 'प्रतिनिधी कामगिरी',
    users: 'वापरकर्ते व्यवस्थापन',
    auditLogs: 'ऑडिट ट्रेल',
    settings: 'मंडळ सेटिंग्ज',
    logout: 'लॉगआउट',
    
    // Dashboard
    totalCollection: 'एकूण देणगी संकलन',
    totalExpenses: 'एकूण गणेशोत्सव खर्च',
    currentBalance: 'शिल्लक शिल्लक रक्कम',
    todayCollection: 'आजचे संकलन',
    thisMonth: 'चालू महिना संकलन',
    totalDonors: 'नोंदणीकृत देणगीदार',
    quickActions: 'जलद कृती',
    recentCollections: 'अलीकडील पावत्या',
    viewAll: 'सर्व पहा',
    paymentDistribution: 'पेमेंट प्रकार विभागणी',
    collectionTrend: 'दैनिक जमा प्रवाह',

    // Add Collection Form
    newCollectionTitle: 'नवीन देणगी पावती नोंदवा',
    donorInfo: '१. देणगीदार माहिती',
    donorName: 'देणगीदाराचे नाव',
    donorNamePlaceholder: 'देणगीदाराचे पूर्ण नाव टाईप करा...',
    amountPayment: '२. देणगी रक्कम व पेमेंट पद्धत',
    quickAmounts: 'जलद रक्कम निवडा',
    amountInRs: 'रक्कम (₹ मध्ये)',
    paymentMode: 'पेमेंट प्रकार',
    inWordsMarathi: 'अक्षरी रक्कम (मराठी)',
    inWordsEnglish: 'In Words (English)',
    saveAndPrint: 'पावती जतन करा व प्रिंट करा',
    saving: 'जतन करत आहे...',
    resetForm: 'फॉर्म रीसेट',
    
    // Common Actions
    actions: 'कृती',
    date: 'दिनांक',
    receiptNo: 'पावती क्र.',
    amount: 'रक्कम',
    status: 'स्थिती',
    collector: 'प्रतिनिधी',
    active: 'सक्रिय',
    void: 'रद्द (VOID)',
    print: 'प्रिंट',
    voidAction: 'रद्द करा (Void)',
    search: 'शोधा...',
    filters: 'फिल्टर्स',
    exportExcel: 'Excel डाउनलोड',
    save: 'जतन करा',
    cancel: 'रद्द करा',
    close: 'बंद करा',
    history: 'इतिहास',

    // Roles
    admin: 'मुख्य प्रशासक',
    treasurer: 'खजिनदार',
    collectorRole: 'पावती प्रतिनिधी',

    // Language Toggle
    switchLang: 'Language / भाषा'
  },
  en: {
    // Branding & Header
    mandalName: 'Ashtavinayak Mitra Mandal',
    festivalYear: '39th Ganeshotsav 2026',
    blessing: '|| Ganpati Bappa Morya ||',
    location: 'Rohit Colony, Boisar (Est. 1987)',
    
    // Navigation
    dashboard: 'Dashboard',
    addCollection: 'New Collection',
    collections: 'Donation Receipts',
    donors: 'Donors Directory',
    expenses: 'Expenses Ledger',
    reports: 'Financial Reports',
    dailyReport: 'Daily Cash Book',
    dataManagement: 'Data & Excel Export',
    collectors: 'Collector Stats',
    users: 'User Management',
    auditLogs: 'Audit Trail',
    settings: 'Mandal Settings',
    logout: 'Logout',
    
    // Dashboard
    totalCollection: 'Total Collection',
    totalExpenses: 'Total Expenses',
    currentBalance: 'Net Treasury Balance',
    todayCollection: "Today's Collection",
    thisMonth: 'This Month Collection',
    totalDonors: 'Registered Donors',
    quickActions: 'Quick Actions',
    recentCollections: 'Recent Collections',
    viewAll: 'View All',
    paymentDistribution: 'Payment Mode Split',
    collectionTrend: 'Daily Collection Trend',

    // Add Collection Form
    newCollectionTitle: 'Record New Donation Collection',
    donorInfo: '1. Donor Information',
    donorName: 'Donor Full Name',
    donorNamePlaceholder: 'Type donor full name...',
    amountPayment: '2. Donation Amount & Payment Mode',
    quickAmounts: 'Quick Amount Presets',
    amountInRs: 'Amount (in ₹)',
    paymentMode: 'Payment Mode',
    inWordsMarathi: 'In Words (Marathi)',
    inWordsEnglish: 'In Words (English)',
    saveAndPrint: 'Save & Print Receipt',
    saving: 'Saving...',
    resetForm: 'Reset Form',
    
    // Common Actions
    actions: 'Actions',
    date: 'Date',
    receiptNo: 'Receipt No',
    amount: 'Amount',
    status: 'Status',
    collector: 'Collector',
    active: 'Active',
    void: 'Voided',
    print: 'Print',
    voidAction: 'Void',
    search: 'Search...',
    filters: 'Filters',
    exportExcel: 'Download Excel',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    history: 'History',

    // Roles
    admin: 'Administrator',
    treasurer: 'Treasurer',
    collectorRole: 'Collector',

    // Language Toggle
    switchLang: 'Language / भाषा'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('mandal_lang') || 'mr';
  });

  useEffect(() => {
    localStorage.setItem('mandal_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'mr' ? 'en' : 'mr'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['mr']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
