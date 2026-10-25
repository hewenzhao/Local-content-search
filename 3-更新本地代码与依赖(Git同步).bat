@echo off
setlocal
cd /d "%~dp0"
title 本地文件内容搜索工具 - 代码与依赖同步更新器

echo ===================================================
echo     本地文件内容搜索工具 - 更新本地代码与依赖
echo     设计者：贺文照
echo ===================================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [提示] 您的电脑当前尚未安装 Git 命令行工具。
    echo.
    echo 推荐的两种更新方式：
    echo 1. 【最简单推荐 - 直接下载更新包】：
    echo    在页面右上角导出 ZIP，解压覆盖当前文件夹内的文件即可。
    echo 2. 【使用 Git 自动同步】：
    echo    安装 Git for Windows (https://git-scm.com/download/win) 后重新运行此脚本。
    echo.
    pause
    exit /b
)

echo [1/3] 正在拉取最新代码 (git pull)...
git pull origin main

echo.
echo [2/3] 正在检查并更新 npm 依赖包...
call npm install

echo.
echo [3/3] 正在验证前端构建...
call npm run build

echo.
echo ===================================================
echo [完成] 本地代码与运行依赖已更新至最新版本！
echo 双击运行 [1-启动本地检索服务(浏览器模式).bat] 即可使用。
echo ===================================================
echo.
pause
