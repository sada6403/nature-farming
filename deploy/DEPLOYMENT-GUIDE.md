# VPS Deployment Guide

## Architecture
| App | Internal Port | External Access |
|-----|--------------|-----------------|
| Website (Customer) | 3000 | http://72.61.115.222 (port 80) |
| Admin Panel | 3001 | http://72.61.115.222:8080 |

---

## Step 1: VPS First-Time Setup

SSH into your VPS:
```bash
ssh root@72.61.115.222
```

Run these commands on VPS:
```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt-get install -y nginx

# Create app folders
mkdir -p /var/www/faring/website
mkdir -p /var/www/faring/admin

# Check ports (make sure 80, 3000, 3001, 8080 are free)
ss -tlnp | grep LISTEN
```

---

## Step 2: Upload Files from Windows

Open PowerShell in the `faring` project folder and run:

```powershell
# Upload website files
scp -r .\website\src root@72.61.115.222:/var/www/faring/website/
scp -r .\website\public root@72.61.115.222:/var/www/faring/website/
scp .\website\package.json root@72.61.115.222:/var/www/faring/website/
scp .\website\package-lock.json root@72.61.115.222:/var/www/faring/website/
scp .\website\next.config.ts root@72.61.115.222:/var/www/faring/website/
scp .\website\tsconfig.json root@72.61.115.222:/var/www/faring/website/
scp .\website\.env.local root@72.61.115.222:/var/www/faring/website/

# Upload admin files
scp -r .\admin\src root@72.61.115.222:/var/www/faring/admin/
scp -r .\admin\public root@72.61.115.222:/var/www/faring/admin/
scp .\admin\package.json root@72.61.115.222:/var/www/faring/admin/
scp .\admin\package-lock.json root@72.61.115.222:/var/www/faring/admin/
scp .\admin\next.config.ts root@72.61.115.222:/var/www/faring/admin/
scp .\admin\tsconfig.json root@72.61.115.222:/var/www/faring/admin/
scp .\admin\.env.local root@72.61.115.222:/var/www/faring/admin/

# Upload PM2 config
scp .\deploy\ecosystem.config.js root@72.61.115.222:/var/www/faring/

# Upload Nginx config
scp .\deploy\nginx.conf root@72.61.115.222:/etc/nginx/sites-available/faring
```

---

## Step 3: Build & Start Apps on VPS

SSH back into VPS:
```bash
ssh root@72.61.115.222
```

Build website:
```bash
cd /var/www/faring/website
npm install
npm run build
```

Build admin:
```bash
cd /var/www/faring/admin
npm install
npm run build
```

Start both with PM2:
```bash
cd /var/www/faring
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # copy and run the command it gives you
```

---

## Step 4: Setup Nginx

```bash
# Enable the site
ln -sf /etc/nginx/sites-available/faring /etc/nginx/sites-enabled/faring
rm -f /etc/nginx/sites-enabled/default

# Open firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 8080/tcp
ufw --force enable

# Test and restart nginx
nginx -t
systemctl restart nginx
```

---

## Step 5: Verify

```bash
# Check apps are running
pm2 status

# Check nginx is running
systemctl status nginx

# Test locally on VPS
curl http://localhost:3000   # website
curl http://localhost:3001   # admin
```

Then open in browser:
- **Customer:** http://72.61.115.222
- **Admin:** http://72.61.115.222:8080

---

## Useful PM2 Commands

```bash
pm2 status              # see both apps
pm2 logs faring-website # website logs
pm2 logs faring-admin   # admin logs
pm2 restart faring-website
pm2 restart faring-admin
pm2 stop all
pm2 start all
```

## Re-deploy after code changes

From Windows PowerShell:
```powershell
# Upload new files (repeat Step 2)
# Then on VPS:
ssh root@72.61.115.222 "cd /var/www/faring/website && npm run build && pm2 restart faring-website"
ssh root@72.61.115.222 "cd /var/www/faring/admin && npm run build && pm2 restart faring-admin"
```
