# अष्टविनायक मित्र मंडळ — गणेशोत्सव Cash Collection & Financial Management System
### Ashtavinayak Mitra Mandal — 39th Year Ganeshotsav Management System (Est. 1987, Rohit Colony, Boisar)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Cloud_DB-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![ExcelJS](https://img.shields.io/badge/ExcelJS-Multi--Sheet_Accounting-217346?logo=microsoft-excel&logoColor=white)](https://github.com/exceljs/exceljs)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment_Ready-black?logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🕉️ १. मंडळाची माहिती (Mandal Overview)

- **मंडळाचे नाव**: **अष्टविनायक मित्र मंडळ** (Ashtavinayak Mitra Mandal)
- **स्थापना वर्ष**: **१९८७** (Established: 1987)
- **उत्सव वर्ष**: **३९ वा गणेशोत्सव २०२६** (39th Ganeshotsav)
- **ठिकाण**: **रोहित कॉलनी, बोईसर (पश्चिम)**, ता. जि. पालघर (Rohit Colony, Boisar)
- **घोषवाक्य / ब्रँडिंग**: **|| गणपती बाप्पा मोरया ||**
- **रंगसंगती / थीम**: सणासुदीची समृद्ध महाराष्ट्रीयन थीम (Charcoal, Antique Gold `#D4AF37`, Warm Saffron `#E65100`, Cream & Festive Red)

---

## 🚀 २. मुख्य वैशिष्ट्ये (Key Features)

1. **क्लाउड PostgreSQL + Prisma ORM (Primary Source of Truth)**:
   - संपूर्ण आर्थिक डेटा सुरक्षित रिलेशनल डेटाबेसमध्ये संग्रहित.
   - सुरक्षित sequential receipt numbering (`MNDL-2026-0001`) आणि expense IDs (`EXP-2026-0001`).
2. **व्यावसायिक ExcelJS बहु-पत्रक (Multi-Sheet) हिशोब प्रणाली**:
   - `Ashtavinayak_Mandal_Accounts_2026.xlsx` एकाच फाईलमध्ये ६ सर्वसमावेशक शीट्स:
     - `SUMMARY`: मंडळाची माहिती, एकूण जमा, एकूण खर्च, शिल्लक रक्कम, देणगीदार संख्या, पेमेंट पद्धत वर्गीकरण.
     - `COLLECTIONS`: सर्व सक्रिय व रद्द पावत्यांचा तपशील.
     - `EXPENSES`: वर्गवारीनुसार (Decoration, Sound, Lighting, Food इ.) खर्चाचा हिशोब.
     - `DONORS`: देणगीदारांची डिरेक्टरी व एकूण जीवनगौरव योगदान.
     - `DAILY SUMMARY`: दैनिक हिशोब ताळेबंद.
     - `MONTHLY SUMMARY`: महिनानिहाय हिशोब गोषवारा.
   - सोनेरी/चारकोल हेडर, **Freeze Top Panes**, **₹#,##0.00** चलन फॉरमॅट, **DD/MM/YYYY** दिनांक फॉरमॅट, ऑटो-फिल्टर्स आणि सेल बॉर्डर्स.
3. **अस्सल देणगी पावती छपाई व डाऊनलोड (Bilingual Printable Receipts)**:
   - मराठी व इंग्रजी अक्षरी रकमांचे स्वयंचलित रूपांतर (उदा. *"पाच हजार एकशे रुपये फक्त"* / *"Five Thousand One Hundred Rupees Only"*).
   - A4, A5 आणि 80mm थर्मल प्रिंटरसाठी परिपूर्ण प्रिंट सीएसएस (`@media print`).
   - पावती क्र., देणगीदार, मोबाईल, पत्ता, अधिकृत प्रतिनिधी स्वाक्षरी व मंडळाचा शिक्का.
4. **जलद देणगीदार शोध (Live Donor Auto-Suggestion)**:
   - नवीन पावती करताना मोबाईल किंवा नाव टाईप करताच पूर्वी नोंदवलेले देणगीदार लगेच सुचवले जातात आणि पत्ता आपोआप भरला जातो.
5. **सुरक्षित व्हाईडिंग यंत्रणा (Financial Safety & Soft-Voiding)**:
   - आर्थिक नोंदी कायमस्वरूपी डिलीट न करता कारण देऊन `VOID` केल्या जातात.
   - रद्द केलेल्या पावत्या व खर्च एकूण हिशोबातून आपोआप वगळले जातात.
6. **भूमिका-आधारित सुरक्षा (Role-Based Access Control - RBAC)**:
   - **ADMIN**: सर्व अधिकार (User Management, Audit Logs, Settings, Exports, Voiding).
   - **TREASURER**: पावत्या, खर्च, देणगीदार, आर्थिक अहवाल, Excel Export, Voiding.
   - **COLLECTOR**: नवीन पावती करणे, स्वतःच्या पावत्या पाहणे, पावती प्रिंट करणे, देणगीदार शोध.
7. **ऑडिट ट्रेल (Comprehensive Audit Trail)**:
   - प्रत्येक लॉगिन, पावती निर्मिती, खर्च, व्हाईड आणि एक्सेल एक्सपोर्टची सुरक्षित नोंद.

---

## 🛠️ ३. तंत्रज्ञान (Technology Stack)

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6, React Hot Toast, Canvas Confetti.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Helmet, CORS, Express Rate Limit.
- **Database & ORM**: PostgreSQL, Prisma Client (`@prisma/client`), Prisma CLI.
- **Accounting Engine**: ExcelJS (`exceljs`).
- **Deployment**: Vercel Serverless Ready (`vercel.json`).

---

## 🔑 ४. डीफॉल्ट लॉगिन खाती (Default Seed Accounts)

| Role | Username | Default Password | Permissions |
|---|---|---|---|
| **ADMIN** | `admin` | `Admin@123` | Full Access, Users, Settings, Audit Logs |
| **TREASURER** | `treasurer` | `Treasurer@123` | Collections, Expenses, Reports, Excel Exports |
| **COLLECTOR** | `collector1` | `Collector@123` | New Collection, Print Receipts, Donor Lookup |

---

## 💻 ५. स्थानिक सेटअप (Local Setup & Installation)

### १. कोड क्लोन / डायरेक्टरीमध्ये जा:
```bash
cd mandal-cash-management
```

### २. बॅकएंड डिपेन्डन्सी इन्स्टॉल करा:
```bash
cd server
npm install
```

### ३. पर्यावरण व्हेरिएबल्स कॉन्फिगर करा (`server/.env`):
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/mandal_db?schema=public"
JWT_SECRET="ashtavinayak_ganeshotsav_secret_key_2026_jwt_token_auth"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

> **टीप**: जर स्थानिक पातळीवर PostgreSQL सर्व्हर चालू नसेल, तर प्रणाली स्वयंचलितपणे **Resilient In-Memory Dev Adapter** वापरून सर्व नमुना डेटासह तात्काळ सुरू होते!

### ४. फ्रंटएंड (Frontend) डिपेन्डन्सी इन्स्टॉल करा:
```bash
cd ../frontend
npm install
```

### ५. ॲप्लिकेशन चालवा:
**टर्मिनल १ (Backend Server):**
```bash
cd server
npm start
```
*API उपलब्ध होईल: `http://localhost:5000`*

**टर्मिनल २ (Frontend Vite):**
```bash
cd frontend
npm run dev
```
*वेबसाईट उपलब्ध होईल: `http://localhost:5173`*

---

## ☁️ ६. Vercel वर डिप्लॉयमेंट (Deploying to Vercel)

1. **Cloud PostgreSQL तयार करा**:
   - [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), किंवा [Railway](https://railway.app) वर मोफत PostgreSQL डेटाबेस तयार करा.
   - कनेक्शन स्ट्रिंग कॉपी करा (उदा. `postgresql://user:pass@ep-xyz.neon.tech/mandal_db?sslmode=require`).

2. **Vercel वर प्रोजेक्ट इम्पोर्ट करा**:
   - Vercel डॅशबोर्डमध्ये Git Repository जोडा.
   - Environment Variables मध्ये जोडा:
     - `DATABASE_URL`: तुमचा Cloud PostgreSQL URL
     - `JWT_SECRET`: कोणताही सुरक्षित पासवर्ड स्ट्रिंग
     - `NODE_ENV`: `production`

3. **Prisma Schema Push**:
   ```bash
   cd server
   DATABASE_URL="your-cloud-postgres-url" npx prisma db push
   DATABASE_URL="your-cloud-postgres-url" node prisma/seed.js
   ```

4. **Deploy**:
   - Vercel `vercel.json` कॉन्फिगरेशनद्वारे Frontend आणि Serverless API एकाच डोमेनवर लाइव्ह करेल.

---

## 📊 ७. REST API एंडपॉइंट्स (API Reference)

### Authentication
- `POST /api/auth/login` — युझर लॉगिन
- `GET /api/auth/me` — प्रोफाइल व मंडळ माहिती
- `POST /api/auth/change-password` — पासवर्ड बदलणे

### Collections (पावत्या)
- `GET /api/collections` — पावत्यांची यादी (शोध, फिल्टर्स, पेजिंग)
- `POST /api/collections` — नवीन पावती नोंदवणे (अणु-सुरक्षित क्र. MNDL-2026-XXXX)
- `GET /api/collections/:id` — पावती तपशील व अक्षरी रक्कम
- `PATCH /api/collections/:id/void` — पावती रद्द करणे (कारणासह)

### Expenses (खर्च)
- `GET /api/expenses` — खर्च यादी व वर्गवारी
- `POST /api/expenses` — नवीन खर्च व्हाउचर (EXP-2026-XXXX)
- `PATCH /api/expenses/:id/void` — खर्च व्हाउचर रद्द करणे

### Excel Exports (एक्सेल एक्सपोर्ट)
- `GET /api/exports/complete-accounts` — ६-इन-१ संपूर्ण हिशोब एक्सेल (`.xlsx`)
- `GET /api/exports/collections` — पावत्या एक्सेल
- `GET /api/exports/expenses` — खर्च एक्सेल
- `GET /api/exports/donors` — देणगीदार डिरेक्टरी एक्सेल

### Reports & Analytics
- `GET /api/reports/dashboard` — मुख्य डॅशबोर्ड आकडेवारी व चार्ट्स
- `GET /api/reports/daily` — दैनिक हिशोब ताळेबंद (Daily Cash Book)
- `GET /api/reports/monthly` — महिनानिहाय हिशोब

---

## 🔱 मंडळ संपर्क व माहिती

**अष्टविनायक मित्र मंडळ**  
रोहित कॉलनी, बोईसर (पश्चिम), ता. जि. पालघर — ४०१५०१  
स्थापना : १९८७ • ३९ वा गणेशोत्सव २०२६  
*|| गणपती बाप्पा मोरया || मंगलमूर्ती मोरया ||*
