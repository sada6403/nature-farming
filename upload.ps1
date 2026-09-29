# Run this in your local Windows PowerShell inside faring folder:
# .\upload.ps1

Write-Host "Uploading deploy-bundle.tar.gz (11MB) to VPS..." -ForegroundColor Cyan
scp deploy-bundle.tar.gz root@72.61.115.222:/root/

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBundle uploaded successfully!" -ForegroundColor Green
    Write-Host "Now switch to your VPS SSH terminal and run:" -ForegroundColor Yellow
    Write-Host "tar -xzf /root/deploy-bundle.tar.gz deploy/server-setup.sh && bash deploy/server-setup.sh" -ForegroundColor White
} else {
    Write-Host "`nUpload failed! Please check your VPS connection or password." -ForegroundColor Red
}
