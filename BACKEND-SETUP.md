# Nature Farming Backend Setup (Custom Node.js + Express + PostgreSQL)

This repository contains a dedicated, standalone **Node.js + Express + PostgreSQL** backend service in `/backend`. Supabase has been completely removed in favor of this self-hosted, scalable backend with:
- **JWT Authentication** (bcrypt password hashing, roles: `admin`, `super_admin`)
- **Direct PostgreSQL Connection Pool** (`pg`)
- **RESTful Endpoints** for products, categories, branches, inquiries, gallery, banners, and settings
- **Local Media Storage & Uploads** via Multer (`/uploads`)
- **Automated Email Notifications** to branch managers via Nodemailer (Gmail/SMTP)
- **Rate-Limiting** for public farmer & contact inquiries

---

## 1. Directory Structure

```
faring/
├── backend/            # Express REST API Server (Port 5000)
│   ├── src/
│   │   ├── config/     # PostgreSQL connection pool (db.js)
│   │   ├── middleware/ # JWT Auth, Multer upload, Rate limiter
│   │   ├── routes/     # Auth, Products, Branches, Inquiries, etc.
│   │   ├── scripts/    # init-db.js, seed-data.js
│   │   └── server.js   # Express entry point
│   ├── uploads/        # Uploaded image files
│   └── package.json
├── website/            # Next.js Public Website (Port 3000)
├── admin/              # Next.js Admin Portal (Port 3001)
└── deploy/             # PM2 ecosystem and Nginx configurations
```

---

## 2. Setting Up the Database & Backend

### 1. Configure Backend Environment
Navigate to `backend/` and copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```

Ensure `DATABASE_URL` points to your PostgreSQL instance:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/nature_farming
PORT=5000
JWT_SECRET=YOUR_SECURE_JWT_SECRET
DEFAULT_ADMIN_EMAIL=admin@nfplantation.com
DEFAULT_ADMIN_PASSWORD=Admin@123456
DEFAULT_ADMIN_NAME=Super Administrator
```

### 2. Install Dependencies & Initialize Database
```bash
npm install
npm run db:init
npm run db:seed
```
- `npm run db:init`: Automatically creates all PostgreSQL tables (`profiles`, `company_settings`, `products`, `branches`, `inquiries`, `gallery`, `faqs`, `ads_banners`, `inquiry_rate_limits`) and inserts the default super administrator user.
- `npm run db:seed`: Seeds sample products, categories, FAQs, and Sri Lankan regional branches.

### 3. Start the Backend Server
```bash
npm run dev
```
The backend starts at `http://localhost:5000`.
- Health check: `http://localhost:5000/api/health`
- Static uploads: `http://localhost:5000/uploads/`

---

## 3. Frontend & Admin Setup

Both `website` and `admin` communicate directly with the backend API:

### 1. Website (`website/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
Run website:
```bash
cd website
npm run dev
# Open http://localhost:3000
```

### 2. Admin Portal (`admin/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
Run admin:
```bash
cd admin
npm run dev
# Open http://localhost:3001
```

Sign in with default credentials:
- **Email:** `admin@nfplantation.com`
- **Password:** `Admin@123456`

---

## 4. Production VPS Deployment (PM2 + Nginx)

In production on your Ubuntu VPS, PM2 manages all three services:
1. `faring-backend` on port `5000`
2. `faring-website` on port `3000`
3. `faring-admin` on port `3001`

### Running with PM2:
```bash
cd /var/www/faring
pm2 startOrReload deploy/ecosystem.config.js --update-env
pm2 save
```

### Nginx Routing:
Nginx routes `/api/` and `/uploads/` to `http://127.0.0.1:5000`. See [`deploy/nginx.production.conf.example`](./deploy/nginx.production.conf.example) for the full configuration.
