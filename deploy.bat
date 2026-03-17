@echo off
setlocal

set "LOG=%TEMP%\vercel-deploy.log"
if exist "%LOG%" del /q "%LOG%"

echo === DEPLOY VERCEL ===
echo Deploying to Vercel (log: %LOG%)
powershell -NoLogo -NoProfile -Command "npx vercel --prod --yes | Tee-Object -FilePath '%LOG%'; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }"
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo Deployment failed with exit code %EXIT_CODE%. See output above.
  goto :cleanup
)

set "DEPLOY_URL="
for /f "usebackq delims=" %%A in (`powershell -NoLogo -NoProfile -Command "(Get-Content '%LOG%' | Select-String 'Project deployed to' | Select-Object -Last 1).Line -match 'https?://\S+'; if ($Matches) { $Matches[0] }"`) do if not defined DEPLOY_URL set "DEPLOY_URL=%%A"

if defined DEPLOY_URL (
  echo Alias %DEPLOY_URL% -> kemysuong.vercel.app
  npx vercel alias set "%DEPLOY_URL%" kemysuong.vercel.app
) else (
  echo Could not detect deployment URL; skipping alias step.
)

:cleanup
if exist "%LOG%" del /q "%LOG%"
pause
endlocal
