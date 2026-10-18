@echo off
chcp 65001 >nul
title 本地文件内容搜索工具 - Windows .exe 打包程序
echo ===================================================
echo     本地文件内容搜索工具 - 一键打包为 Windows .exe
echo     设计者：贺文照
echo ===================================================
echo.

:: 1. 检查 Node.js 环境
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 运行环境！
    echo 请先前往官网下载并安装 Node.js (推荐 LTS 版本):
    echo https://nodejs.org
    echo.
    pause
    exit /b
)

:: 2. 检查依赖项 node_modules
if not exist "node_modules\" (
    echo [提示] 正在安装编译依赖...
    call npm install
)

echo.
echo [1/2] 正在编译前端静态资源与组件...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 前端构建失败，请检查错误提示。
    pause
    exit /b
)

echo.
echo [2/2] 正在调用 Electron 打包为 Windows .exe 安装包与便携绿色版...
:: 配置国内镜像源加速下载 Electron 预编译包与 NSIS 工具
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
call npm run electron:build:win
if %errorlevel% neq 0 (
    echo.
    echo [提示] 如果因下载 electron 较慢超时，可配置国内镜像源后重试：
    echo npm config set ELECTRON_MIRROR https://npmmirror.com/mirrors/electron/
    echo.
    pause
    exit /b
)

echo.
echo ===================================================
echo [完成] 打包成功！
echo 生成的 .exe 可执行文件位于 dist-electron 目录中。
echo 正在为您打开输出文件夹...
echo ===================================================
echo.

explorer dist-electron
pause
