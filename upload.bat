@echo off
echo ========================================================
echo Uploading Nature Farming Deployment Bundle to VPS...
echo ========================================================
scp deploy-bundle.tar.gz root@72.61.115.222:/root/
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo SUCCESS: deploy-bundle.tar.gz uploaded to VPS!
    echo.
    echo Now in your VPS SSH terminal, run:
    echo tar -xzf /root/deploy-bundle.tar.gz deploy/server-setup.sh ^&^& bash deploy/server-setup.sh
    echo ========================================================
) else (
    echo.
    echo Upload failed. Please check network/password.
)
pause
