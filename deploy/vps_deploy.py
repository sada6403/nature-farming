#!/usr/bin/env python3
"""VPS deployment script using paramiko SSH"""

import paramiko
import sys
import time
import os

VPS_IP = "72.61.115.222"
VPS_USER = "root"
VPS_PASS = "Nature202601@"

def ssh_connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, timeout=30)
    return client

def run_cmd(client, cmd, print_output=True):
    print(f"\n>>> {cmd[:80]}...")
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    output = ""
    for line in iter(stdout.readline, ""):
        output += line
        if print_output:
            print(line, end="")
    err = stderr.read().decode()
    if err and print_output:
        print(f"STDERR: {err}")
    return output

def upload_file(sftp, local_path, remote_path):
    try:
        sftp.put(local_path, remote_path)
        print(f"  Uploaded: {os.path.basename(local_path)}")
    except Exception as e:
        print(f"  ERROR uploading {local_path}: {e}")

def upload_dir(sftp, client, local_dir, remote_dir):
    """Upload directory recursively"""
    run_cmd(client, f"mkdir -p {remote_dir}", print_output=False)
    for item in os.listdir(local_dir):
        if item in ['node_modules', '.next', '.git', '__pycache__']:
            continue
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        if os.path.isdir(local_path):
            upload_dir(sftp, client, local_path, remote_path)
        else:
            upload_file(sftp, local_path, remote_path)

def main():
    print("=" * 50)
    print("Faring VPS Deployment")
    print("=" * 50)

    print("\n[1/6] Connecting to VPS...")
    client = ssh_connect()
    sftp = client.open_sftp()
    print(f"Connected to {VPS_IP}")

    print("\n[2/6] Checking & installing dependencies on VPS...")
    run_cmd(client, "node -v 2>/dev/null || echo 'Node not installed'")

    # Install Node.js if not present
    node_check = run_cmd(client, "which node 2>/dev/null | wc -l", print_output=False)
    if "0" in node_check:
        print("Installing Node.js 20...")
        run_cmd(client, "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -")
        run_cmd(client, "apt-get install -y nodejs")

    run_cmd(client, "npm install -g pm2 2>/dev/null; pm2 -v")
    run_cmd(client, "apt-get install -y nginx -q")
    run_cmd(client, "mkdir -p /var/www/faring/website /var/www/faring/admin")

    # Check ports
    print("\n[3/6] Checking available ports...")
    run_cmd(client, "ss -tlnp | grep LISTEN")

    print("\n[4/6] Uploading files to VPS...")

    base = r"c:\Users\USER\OneDrive\Documents\Desktop\faring"

    print("\n  Uploading website...")
    upload_dir(sftp, client, os.path.join(base, "website"), "/var/www/faring/website")

    # Upload .env.local
    env_website = os.path.join(base, "website", ".env.local")
    if os.path.exists(env_website):
        upload_file(sftp, env_website, "/var/www/faring/website/.env.local")

    print("\n  Uploading admin...")
    upload_dir(sftp, client, os.path.join(base, "admin"), "/var/www/faring/admin")

    env_admin = os.path.join(base, "admin", ".env.local")
    if os.path.exists(env_admin):
        upload_file(sftp, env_admin, "/var/www/faring/admin/.env.local")

    # Upload PM2 ecosystem config
    ecosystem = os.path.join(base, "deploy", "ecosystem.config.js")
    upload_file(sftp, ecosystem, "/var/www/faring/ecosystem.config.js")

    print("\n[5/6] Building apps on VPS (this takes a few minutes)...")

    print("\n  Building website...")
    run_cmd(client, "cd /var/www/faring/website && npm install && npm run build")

    print("\n  Building admin...")
    run_cmd(client, "cd /var/www/faring/admin && npm install && npm run build")

    print("\n  Starting apps with PM2...")
    run_cmd(client, "cd /var/www/faring && pm2 delete all 2>/dev/null; pm2 start ecosystem.config.js")
    run_cmd(client, "pm2 save")
    run_cmd(client, "pm2 startup | tail -1 | bash 2>/dev/null; echo 'PM2 startup configured'")

    print("\n[6/6] Setting up Nginx...")

    nginx_config = """
server {
    listen 80;
    server_name 72.61.115.222;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 8080;
    server_name 72.61.115.222;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3001;
        add_header Cache-Control "public, immutable";
    }
}
"""

    # Write nginx config
    nginx_tmp = "/tmp/faring_nginx.conf"
    with sftp.open(nginx_tmp, 'w') as f:
        f.write(nginx_config)

    run_cmd(client, f"cp {nginx_tmp} /etc/nginx/sites-available/faring")
    run_cmd(client, "ln -sf /etc/nginx/sites-available/faring /etc/nginx/sites-enabled/faring")
    run_cmd(client, "rm -f /etc/nginx/sites-enabled/default")

    # Open firewall
    run_cmd(client, "ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 8080/tcp && ufw --force enable")

    # Test and restart nginx
    run_cmd(client, "nginx -t && systemctl restart nginx")

    print("\n  Final status:")
    run_cmd(client, "pm2 status")
    run_cmd(client, "systemctl is-active nginx")

    sftp.close()
    client.close()

    print("\n" + "=" * 50)
    print("DEPLOYMENT COMPLETE!")
    print("=" * 50)
    print(f"\nCustomer Website: http://72.61.115.222")
    print(f"Admin Panel:      http://72.61.115.222:8080")
    print("\nIMPORTANT: Change your VPS root password now!")
    print("=" * 50)

if __name__ == "__main__":
    main()
