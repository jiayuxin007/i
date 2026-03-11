Write-Host "正在启动本地服务器..." -ForegroundColor Green
Write-Host "服务器启动后，请在浏览器中访问: http://localhost:8000" -ForegroundColor Yellow
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# 检查 Python 是否可用
try {
    python -m http.server 8000
} catch {
    Write-Host "Python 不可用，尝试使用 Node.js..." -ForegroundColor Yellow
    try {
        npx http-server -p 8000
    } catch {
        Write-Host "错误: 需要安装 Python 或 Node.js" -ForegroundColor Red
        Write-Host "Python: https://www.python.org/downloads/" -ForegroundColor Cyan
        Write-Host "Node.js: https://nodejs.org/" -ForegroundColor Cyan
        pause
    }
}