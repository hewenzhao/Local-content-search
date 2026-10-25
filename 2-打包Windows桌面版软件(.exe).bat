@echo off
setlocal
cd /d "%~dp0"
title 本地文件内容搜索工具 v2.0 (Oct, 2026) - Windows .exe 打包程序

echo ===================================================
echo   本地文件内容搜索工具 v2.0 (Oct, 2026) - 快速打包
echo   设计者：贺文照
echo ===================================================
echo.

node build-electron.cjs
if %errorlevel% neq 0 (
    echo.
    echo 打包出现异常，请检查上方日志输出。
    pause
    exit /b %errorlevel%
)

if exist "dist-electron\" (
    start "" "dist-electron"
)

echo.
echo 打包流程结束。
pause
