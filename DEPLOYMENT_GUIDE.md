# 🚀 Deployment Guide — Ashtavinayak Mitra Mandal Ganeshotsav Portal

> **श्री गणेशाय नमः** 🙏  
> Comprehensive, Production-Grade Deployment Guide for **अष्टविनायक मित्र मंडळ (बोईसर)** Cash Collection & Financial Accounting Portal.

---

## 📑 Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Recommended Deployment Methods](#2-recommended-deployment-methods)
   - [Option A: Vercel Full-Stack (Easiest & Free)](#option-a-vercel-full-stack-recommended)
   - [Option B: Render.com / Railway + Vercel](#option-b-render--railway-backend--vercel-frontend)
3. [Cloud Database Setup (PostgreSQL)](#3-cloud-database-setup-postgresql)
4. [Environment Variables Checklist](#4-environment-variables-checklist)
5. [Pre-Deployment Security Checklist](#5-pre-deployment-security-checklist)
6. [Default Admin & Treasurer Accounts](#6-default-accounts)

---

## 1. Overview & Architecture
- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts + Auto Code-Splitting
- **Backend**: Node.js + Express + Prisma ORM + Helmet + Anti-Injection Sanitizer + Rate Limiting
- **Database**: PostgreSQL (with Automatic Mock Store Fallback if no database is connected)
- **Exports**: ExcelJS / XLSX Automated Ledger Generation

---

## 2. Recommended Deployment Methods

### Option A: Vercel Full-Stack (Recommended)
You can deploy the **entire project (Frontend + API)** directly on [Vercel](https://vercel.com) with 0 configuration using the included `vercel.json`.

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: Ashtavinayak Ganeshotsav Portal Production Ready"
   git remote add origin https://github.com/YOUR_USERNAME/ashtavinayak-mandal-portal.git
   git push -u origin main
   ```
2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your GitHub repository.
   - Leave Root Directory as `./`.
   - Under **Environment Variables**, add the variables listed in Section 4 below.
   - Click **Deploy**! 🚀

---

### Option B: Render / Railway (Backend) + Vercel (Frontend)

#### Step 1: Deploy Backend on Render.com
1. Go to [render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push`
   - **Start Command**: `npm start` (Automatically boots server & seeds initial Admin if empty)
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your PostgreSQL database URL
   - `JWT_SECRET`: A long secure random string
   - `CLIENT_URL`: Your frontend Vercel URL
   - `NODE_ENV`: `production`
5. Copy your Render backend URL (e.g., `https://ashtavinayak-api.onrender.com`).

#### Step 2: Deploy Frontend on Vercel
1. In Vercel, import the repo.
2. Set **Root Directory**: `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL`: `https://ashtavinayak-api.onrender.com/api`
4. Click **Deploy**!

---

## 3. Cloud Database Setup (PostgreSQL)

You can get a **100% Free PostgreSQL Database** in 1 minute from any of these providers:

### Option 1: Neon.tech (Recommended - Free & Serverless)
1. Go to [neon.tech](https://neon.tech) and sign up.
2. Create a project: `ashtavinayak-mandal`.
3. Copy the `DATABASE_URL` (Connection String with `sslmode=require`).
4. Run migrations locally or in deployment:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

### Option 2: Supabase (Free Tier)
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Under Project Settings -> Database, copy the **URI Connection String** (Port 5432/6543).

> 💡 *Note: If no `DATABASE_URL` is provided, the system automatically uses its high-performance in-memory persistence store, ensuring 100% uptime without crashes.*

---

## 4. Environment Variables Checklist

### Backend (`server/.env` or Render/Vercel Dashboard)
| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port assigned by cloud host |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?sslmode=require` | PostgreSQL Connection URI |
| `JWT_SECRET` | `ashtavinayak_ganeshotsav_super_secure_jwt_2026` | Secret key for signing tokens |
| `JWT_EXPIRES_IN` | `7d` | Session expiration duration |
| `CLIENT_URL` | `https://your-mandal-portal.vercel.app` | Allowed CORS domain |
| `NODE_ENV` | `production` | Environment mode |

### Frontend (`frontend/.env` or Vercel Dashboard)
| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `/api` *(or backend URL)* | Endpoint URL for Axios requests |

---

## 5. Pre-Deployment Security Checklist

- [x] **Anti-Injection Shield**: XSS, SQLi, NoSQL, and Prototype Pollution sanitization active.
- [x] **Rate Limiting**: Brute-force protection on `/api/auth/login` and global API limits.
- [x] **Helmet Security**: Strict HTTP headers, X-Frame-Options, and Content-Type sniffing disabled.
- [x] **Trust Proxy**: Reverse proxy IP tracking enabled for Vercel/Render/Cloudflare.
- [x] **Role Access Control (RBAC)**: Expenses and Balance Sheets restricted to `ADMIN` only.
- [x] **SPA Routing**: Fallback routes configured to prevent 404 on page refresh.
- [x] **Lightweight Bundling**: Code-split into `< 100kB` gzipped vendor chunks.

---

## 6. Default Accounts

| Role | Username | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **मुख्य प्रशासक (ADMIN)** | `admin` | `Admin@1234` | Full Access (Collections, Donors, Expenses, Reports, Users, Settings) |
| **खजिनदार (TREASURER)** | `treasurer` | `Treasurer@1234` | Operator Access (Record Collections, View Donors, Manage Collectors) |

> 🔒 *Recommendation: Change default passwords from the Settings/User Management page after initial deployment.*

---

|| **गणपती बाप्पा मोरया, मंगलमूर्ती मोरया** || 🙏
