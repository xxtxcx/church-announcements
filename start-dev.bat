@echo off
echo Запуск серверів для локальної розробки...
echo.
echo Запускаю сервер синхронізації на порту 3001...
start "Sync Server" cmd /k "npm run sync-server"
timeout /t 2 /nobreak >nul
echo.
echo Запускаю React dev server на порту 3000...
start "React Dev Server" cmd /k "npm start"
echo.
echo Обидва сервери запущено!
echo Сервер синхронізації: http://localhost:3001
echo React додаток: http://localhost:3000
echo.
pause
