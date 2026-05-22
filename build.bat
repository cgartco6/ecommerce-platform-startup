@echo off
echo ========================================
echo   E-Commerce Platform Builder for Windows
echo ========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/ (LTS version)
    echo Minimum required: v18.x
    pause
    exit /b 1
)

:: Check Node version
for /f "tokens=1 delims=." %%a in ('node -v') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:~1%
if %NODE_MAJOR% LSS 18 (
    echo Node.js version %NODE_MAJOR% detected. Please upgrade to v18 or higher.
    pause
    exit /b 1
)

echo ✓ Node.js found.

:: Run the builder
echo.
echo Building project... (this may take several minutes)
node build.js

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   BUILD COMPLETE!
    echo ========================================
    echo.
    echo To start the application:
    echo   1. Open two terminals
    echo   2. In first: cd ecommerce-platform\backend ^&^& npm run dev
    echo   3. In second: cd ecommerce-platform\frontend ^&^& npm run dev
    echo.
) else (
    echo Build failed. Check errors above.
)
pause
