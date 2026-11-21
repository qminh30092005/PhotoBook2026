@echo off
rem Bấm đúp file này để chạy bản thử trên máy: Apps Script giả lập (cổng 5174) + web (cổng 3000).
rem Đóng 2 cửa sổ đen để tắt.
chcp 65001 >nul
cd /d "%~dp0"
start "Our Archive - API gia lap" cmd /k node scripts\mock-api.js
node scripts\build.js || (pause & exit /b 1)
start "" http://localhost:3000
node scripts\dev.js
pause
