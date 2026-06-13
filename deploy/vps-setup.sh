#!/bin/bash
# VPS First-Time Setup Script
# Run this once on your VPS: bash vps-setup.sh

set -e

echo "=== Checking available ports ==="
echo "Ports currently in use:"
ss -tlnp | grep LISTEN

echo ""
echo "=== Installing Node.js 20 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo ""
echo "=== Installing PM2 (process manager) ==="
sudo npm install -g pm2

echo ""
echo "=== Installing Nginx ==="
sudo apt-get install -y nginx

echo ""
echo "=== Installing Git ==="
sudo apt-get install -y git

echo ""
echo "=== Creating app directories ==="
sudo mkdir -p /var/www/faring/website
sudo mkdir -p /var/www/faring/admin
sudo chown -R $USER:$USER /var/www/faring

echo ""
echo "=== Setup complete! ==="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PM2 version: $(pm2 -v)"
echo ""
echo "Next: Run deploy.sh to upload and start both apps"
