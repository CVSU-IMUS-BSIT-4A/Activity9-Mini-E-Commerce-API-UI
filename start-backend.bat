@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
cd backend
echo.
echo Checking if data folder exists...
if not exist "data" (
    echo Data folder not found. Running seed script...
    call npm run seed
    echo.
)
echo.
echo Starting backend server...
call npm run start:dev
pause
