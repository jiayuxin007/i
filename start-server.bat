@echo off
echo 正在启动本地服务器...
echo 服务器启动后，请在浏览器中访问: http://localhost:8000
echo 按 Ctrl+C 停止服务器
echo.
cd /d "%~dp0"
python -m http.server 8000
pause