# VPS Deployment Guide

This deploys the public website on port 3000 and the admin app on port 3001. Nginx is the only public entry point. Supabase remains the managed PostgreSQL/Auth/Storage backend.

## Prerequisites

- Ubuntu 22.04 or newer VPS
- Node.js 20 or newer, Nginx, PM2 and Git
- Two DNS records pointing to the VPS, for example `example.com` and `admin.example.com`
- The production SQL and admin bootstrap in [`../BACKEND-SETUP.md`](../BACKEND-SETUP.md) completed first

## First-time server setup

```bash
sudo apt update
sudo apt install -y nginx git certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
sudo mkdir -p /var/www/faring/{website,admin}
sudo chown -R "$USER":"$USER" /var/www/faring
```

Upload or clone the repository into `/var/www/faring`. Do not commit `.env.local` files. Create them directly on the VPS from the two `.env.example` templates, then protect them:

```bash
chmod 600 /var/www/faring/website/.env.local
chmod 600 /var/www/faring/admin/.env.local
```

## Build and run

```bash
cd /var/www/faring/website
npm ci
npm run build

cd /var/www/faring/admin
npm ci
npm run build

cd /var/www/faring
pm2 startOrReload deploy/ecosystem.config.js --update-env
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup` once. The apps listen on loopback through Nginx; do not expose ports 3000 or 3001 in UFW.

## HTTPS and Nginx

First obtain certificates (replace the domains):

```bash
sudo certbot certonly --nginx -d example.com -d www.example.com
sudo certbot certonly --nginx -d admin.example.com
```

Copy `deploy/nginx.production.conf.example` to `/etc/nginx/sites-available/faring`, replace all example domains, enable it, and validate:

```bash
sudo ln -sfn /etc/nginx/sites-available/faring /etc/nginx/sites-enabled/faring
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Verify every deployment

```bash
pm2 status
curl --fail http://127.0.0.1:3000/api/health
curl --fail http://127.0.0.1:3001/api/health
sudo nginx -t
```

Then test HTTPS, admin login, one public inquiry, product updates and one gallery upload.

## Updating

```bash
cd /var/www/faring
git pull --ff-only

cd website
npm ci
npm run build

cd ../admin
npm ci
npm run build

cd ..
pm2 startOrReload deploy/ecosystem.config.js --update-env
```

If environment variables changed, rebuild both apps before reloading PM2 because `NEXT_PUBLIC_*` values are embedded at build time.
