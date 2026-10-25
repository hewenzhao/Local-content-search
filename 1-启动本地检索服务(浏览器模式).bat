@echo off
setlocal
cd /d "%~dp0"
title 本地文件内容搜索工具 v2.0 (Oct, 2026) - 启动器

echo ===================================================
echo   本地文件内容搜索工具 v2.0 (Oct, 2026) - 快速启动
echo   设计者：贺文照
echo ===================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 运行环境！
    echo 请先前往官网下载安装 Node.js (推荐 LTS 版本): https://nodejs.org
    pause
    exit /b
)

if not exist "node_modules\" (
    echo [提示] 首次运行，正在安装所需依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败，请检查网络后重试。
        pause
        exit /b
    )
)

echo.
echo [成功] 正在启动本地文件检索服务...
echo 浏览器即将打开：http://localhost:3000
echo 如需关闭服务，直接关闭此黑框窗口即可。
echo.

start http://localhost:3000
call npm run dev
pause
