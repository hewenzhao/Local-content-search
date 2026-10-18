@echo off
chcp 65001 >nul
title 本地文件内容搜索工具 - 启动器
echo ===================================================
echo     本地文件内容搜索工具 - 本地PC快速启动程序
echo     设计者：贺文照
echo ===================================================
echo.

:: 1. 检查 Node.js 环境
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 运行环境！
    echo 请先前往官网下载并安装 Node.js (推荐 LTS 版本):
    echo https://nodejs.org
    echo 安装完成后，重新双击此脚本即可。
    echo.
    pause
    exit /b
)

:: 2. 检查依赖项 node_modules 是否已安装
if not exist "node_modules\" (
    echo [提示] 首次运行，正在自动为您安装所需运行依赖 (请保持联网)...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败，请检查网络后重试。
        pause
        exit /b
    )
)

echo.
echo [成功] 正在启动本地文件检索服务...
echo 系统将在浏览器中自动打开：http://localhost:3000
echo 如需停止运行，请直接关闭本黑框窗口。
echo.

:: 启动默认浏览器打开页面
start http://localhost:3000

:: 运行 Vite 本地服务
call npm run dev

pause
