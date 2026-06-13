# Deploy both Next.js apps to VPS
# Run from your LOCAL Windows machine in PowerShell:
# cd faring
# .\deploy\deploy-vps.ps1

$VPS_IP = "72.61.115.222"
$VPS_USER = "root"

Write-Host "=== Step 1: Uploading website (customer side) ===" -ForegroundColor Cyan
scp -r .\website\* "${VPS_USER}@${VPS_IP}:/var/www/faring/website/"
# NOTE: node_modules and .next will not be copied, they'll be built on VPS

Write-Host ""
Write-Host "=== Step 2: Uploading admin (admin side) ===" -ForegroundColor Cyan
scp -r .\admin\* "${VPS_USER}@${VPS_IP}:/var/www/faring/admin/"

Write-Host ""
Write-Host "=== Step 3: Uploading PM2 ecosystem config ===" -ForegroundColor Cyan
scp .\deploy\ecosystem.config.js "${VPS_USER}@${VPS_IP}:/var/www/faring/"

Write-Host ""
Write-Host "=== Step 4: Uploading Nginx config ===" -ForegroundColor Cyan
scp .\deploy\nginx.conf "${VPS_USER}@${VPS_IP}:/etc/nginx/sites-available/faring"

Write-Host ""
Write-Host "=== Step 5: Building and starting apps on VPS ===" -ForegroundColor Cyan
Write-Host "Connecting to VPS..." -ForegroundColor Yellow

$commands = @"
echo '--- Installing website dependencies ---'
cd /var/www/faring/website
npm install
npm run build

echo '--- Installing admin dependencies ---'
cd /var/www/faring/admin
npm install
npm run build

echo '--- Starting apps with PM2 ---'
cd /var/www/faring
pm2 delete faring-website 2>/dev/null || true
pm2 delete faring-admin 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo '--- Configuring Nginx ---'
ln -sf /etc/nginx/sites-available/faring /etc/nginx/sites-enabled/faring
rm -f /etc/nginx/sites-enabled/default

echo '--- Opening firewall ports ---'
ufw allow 80/tcp
ufw allow 8080/tcp
ufw allow 22/tcp
ufw --force enable

echo '--- Restarting Nginx ---'
nginx -t && systemctl restart nginx

echo ''
echo '=== DEPLOYMENT COMPLETE ==='
pm2 status
"@

ssh "${VPS_USER}@${VPS_IP}" $commands

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Customer Website: http://72.61.115.222" -ForegroundColor White
Write-Host "Admin Panel:      http://72.61.115.222:8080" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Green
