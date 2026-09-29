#!/bin/bash
set -e

echo "=========================================="
echo " Nature Farming VPS Deployment & Migration"
echo "=========================================="

# 1. Install & Configure PostgreSQL
echo "[1/6] Setting up PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    apt-get update -q
    apt-get install -y postgresql postgresql-contrib -q
fi

systemctl start postgresql
systemctl enable postgresql

# Create postgres user and database if not exists
echo "Configuring PostgreSQL user and database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='faring'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER faring WITH PASSWORD 'Faring@2026_Secure!';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='nature_farming'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE nature_farming OWNER faring;"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nature_farming TO faring;"

# 2. Extract Deployment Bundle
echo "[2/6] Extracting bundle to /var/www/faring..."
mkdir -p /var/www/faring
tar -xzf /root/deploy-bundle.tar.gz -C /var/www/faring/

# 3. Setup Backend
echo "[3/6] Setting up Backend API (Node + Express + PostgreSQL)..."
cd /var/www/faring/backend

cat << 'EOF' > .env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://faring:Faring@2026_Secure!@localhost:5432/nature_farming
JWT_SECRET=nature_farming_jwt_secret_key_prod_2026_x89a!
JWT_EXPIRES_IN=7d
BACKEND_URL=https://naturefarming.lk
UPLOAD_DIR=./uploads
CORS_ORIGIN=https://naturefarming.lk,https://www.naturefarming.lk,https://admin.naturefarming.lk
DEFAULT_ADMIN_EMAIL=admin@nfplantation.com
DEFAULT_ADMIN_PASSWORD=Admin@123456
DEFAULT_ADMIN_NAME=Super Administrator
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@nfplantation.com
SMTP_PASS=fzcw xoxs cywz uabj
EMAIL_FROM=Nature Farming <info@nfplantation.com>
EOF

mkdir -p uploads
chmod 775 uploads

npm install --production=false
echo "Initializing Database Tables & Seeds..."
npm run db:init
npm run db:seed

# 4. Build Website (Customer Facing Next.js on port 3002)
echo "[4/6] Building Website..."
cd /var/www/faring/website

cat << 'EOF' > .env.local
NEXT_PUBLIC_API_URL=https://naturefarming.lk
EOF

npm install
npm run build

# 5. Build Admin (Admin Portal Next.js on port 3003)
echo "[5/6] Building Admin Portal..."
cd /var/www/faring/admin

cat << 'EOF' > .env.local
NEXT_PUBLIC_API_URL=https://admin.naturefarming.lk
EOF

npm install
npm run build

# 6. Configure PM2 & Nginx
echo "[6/6] Updating PM2 & Nginx..."
cd /var/www/faring

# Safely delete only nature-farming apps without touching other apps
pm2 delete nature-farming 2>/dev/null || true
pm2 delete nature-farming-admin 2>/dev/null || true
pm2 delete nf-farming 2>/dev/null || true
pm2 delete nature-farming-backend 2>/dev/null || true

# Start apps from ecosystem
pm2 start deploy/ecosystem.config.js
pm2 save

# Backup and update Nginx with /api/ and /uploads/ routing
cp /etc/nginx/sites-available/naturefarming /etc/nginx/sites-available/naturefarming.bak 2>/dev/null || true
cp deploy/naturefarming-nginx.conf /etc/nginx/sites-available/naturefarming
ln -sf /etc/nginx/sites-available/naturefarming /etc/nginx/sites-enabled/naturefarming

# Test and reload Nginx
nginx -t && systemctl reload nginx

echo ""
echo "=========================================="
echo " DEPLOYMENT SUCCESSFUL!"
echo "=========================================="
echo "Website: https://naturefarming.lk"
echo "Admin:   https://admin.naturefarming.lk"
echo "Backend: https://naturefarming.lk/api/health"
echo "=========================================="
pm2 status
