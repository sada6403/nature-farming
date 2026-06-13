#!/bin/bash
# Run this ON YOUR VPS to check available ports
# ssh root@72.61.115.222
# bash check-ports.sh

echo "=== Ports currently in use ==="
ss -tlnp

echo ""
echo "=== Checking if our ports are free ==="
for PORT in 80 3000 3001 8080; do
    if ss -tlnp | grep -q ":${PORT} "; then
        echo "Port $PORT: OCCUPIED"
    else
        echo "Port $PORT: FREE"
    fi
done

echo ""
echo "=== UFW Firewall status ==="
ufw status 2>/dev/null || echo "UFW not installed"

echo ""
echo "=== Nginx status ==="
systemctl status nginx 2>/dev/null | head -5 || echo "Nginx not installed"
