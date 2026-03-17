@echo off
cd /d "%~dp0"
echo === TU DONG DEPLOY LEN GITHUB/VERCEL ===

if exist .git\index.lock (
    del /f /q .git\index.lock
    echo [OK] Da xoa file khoa (index.lock).
) else (
    echo [INFO] Trang thai Git on dinh...
)

if exist "%USERPROFILE%\.git\index.lock" (
    del /f /q "%USERPROFILE%\.git\index.lock"
    echo [OK] Da xoa file khoa o thu muc User (C:\Users\admin).
)

echo Dang thuc hien: git add .
git add .
echo Dang thuc hien: git commit...
git commit -m "Redeploy: Cap nhat code moi nhat"

echo Dang thuc hien: Doi ten nhanh thanh main (Fix loi refspec)...
git branch -M main

echo Dang thuc hien: git push...
git push origin main

echo === HOAN TAT ===
echo Code da duoc day len GitHub. Vercel se tu dong build va deploy lai.
pause