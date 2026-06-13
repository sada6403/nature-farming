#!/bin/bash
# Deploy both apps to VPS
# Run from your LOCAL machine: bash deploy/deploy-vps.sh
# Prerequisites: SSH access to VPS

VPS_IP="72.61.115.222"
VPS_USER="root"
SSH="ssh ${VPS_USER}@${VPS_IP}"

echo "=== Step 1: Uploading website (customer side) ==="
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='.git' \
    ./website/ ${VPS_USER}@${VPS_IP}:/var/www/faring/website/

# Copy env file separately (not excluded by .gitignore)
scp ./website/.env.local ${VPS_USER}@${VPS_IP}:/var/www/faring/website/.env.local

echo ""
echo "=== Step 2: Uploading admin (admin side) ==="
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='.git' \
    ./admin/ ${VPS_USER}@${VPS_IP}:/var/www/faring/admin/

# Copy env file separately
scp ./admin/.env.local ${VPS_USER}@${VPS_IP}:/var/www/faring/admin/.env.local

echo ""
echo "=== Step 3: Uploading PM2 ecosystem config ==="
rsync -avz ./deploy/ecosystem.config.js ${VPS_USER}@${VPS_IP}:/var/www/faring/

echo ""
echo "=== Step 4: Building and starting apps on VPS ==="
$SSH << 'ENDSSH'

echo "--- Installing website dependencies ---"
cd /var/www/faring/website
npm install
npm run build

echo ""
echo "--- Installing admin dependencies ---"
cd /var/www/faring/admin
npm install
npm run build

echo ""
echo "--- Starting apps with PM2 ---"
cd /var/www/faring
pm2 delete faring-website 2>/dev/null || true
pm2 delete faring-admin 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "--- App Status ---"
pm2 status

ENDSSH

echo ""
echo "=== Step 5: Setting up Nginx ==="
rsync -avz ./deploy/nginx.conf ${VPS_USER}@${VPS_IP}:/etc/nginx/sites-available/faring

$SSH << 'ENDSSH'
# Enable site
ln -sf /etc/nginx/sites-available/faring /etc/nginx/sites-enabled/faring

# Remove default nginx page
rm -f /etc/nginx/sites-enabled/default

# Open firewall ports
ufw allow 80/tcp
ufw allow 8080/tcp
ufw allow 22/tcp
ufw --force enable

# Test and reload nginx
nginx -t && systemctl reload nginx
echo "Nginx reloaded!"
ENDSSH

echo ""
echo "================================================"
echo "Deployment complete!"
echo ""
echo "Customer Website: http://72.61.115.222"
echo "Admin Panel:      http://72.61.115.222:8080"
echo "================================================"
