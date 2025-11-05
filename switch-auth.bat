@echo off
REM Script to switch between local and Replit authentication (Windows)
REM Usage: switch-auth.bat [local|replit]

if "%1"=="" (
    echo Usage: switch-auth.bat [local^|replit]
    echo.
    echo   local   - Use local development authentication
    echo   replit  - Use Replit OpenID Connect authentication
    exit /b 1
)

if "%1"=="local" (
    echo Switching to LOCAL authentication...
    powershell -Command "(Get-Content server\routes.ts) -replace 'from \"\.\/replitAuth\"', 'from \"\.\/localAuth\"' | Set-Content server\routes.ts"
    echo. 
    echo Changed server\routes.ts to use localAuth
    echo.
    echo You can now run: npm run dev
    echo You'll be auto-logged in as: test@local.dev
) else if "%1"=="replit" (
    echo Switching to REPLIT authentication...
    powershell -Command "(Get-Content server\routes.ts) -replace 'from \"\.\/localAuth\"', 'from \"\.\/replitAuth\"' | Set-Content server\routes.ts"
    echo.
    echo Changed server\routes.ts to use replitAuth
    echo.
    echo You can now deploy to Replit with proper authentication
) else (
    echo Invalid option: %1
    echo Use 'local' or 'replit'
    exit /b 1
)

echo.
echo Don't forget to restart your development server!
