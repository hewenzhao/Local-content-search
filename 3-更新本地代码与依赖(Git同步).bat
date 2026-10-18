@echo off
chcp 65001 >nul
title 本地文件内容搜索工具 - 代码与依赖同步更新器
echo ===================================================
echo     本地文件内容搜索工具 - 更新本地代码与依赖
echo     设计者：贺文照
echo ===================================================
echo.

:: 检查 Git 环境
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [提示] 您的电脑当前尚未安装 Git 命令行工具。
    echo.
    echo 推荐的两种更新方式：
    echo 1. 【最简单推荐 - 直接下载更新包】：
    echo    在 Google AI Studio 页面右上角菜单中点击 [Export to ZIP] (导出ZIP)，
    echo    下载后解压并直接覆盖替换当前文件夹内的文件即可。
    echo.
    echo 2. 【使用 Git 自动同步】：
    echo    请先前往官网下载并安装 Git for Windows:
    echo    https://git-scm.com/download/win
    echo    安装后重新运行此脚本即可一键拉取 GitHub 最新版本。
    echo.
    pause
    exit /b
)

:: 已安装 Git，尝试从远程拉取更新
echo [1/3] 正在从 GitHub 仓库拉取最新代码 (git pull)...
git pull origin main
if %errorlevel% neq 0 (
    echo.
    echo [提示] 如果拉取失败，请检查网络或是否配置了远程仓库地址。
    echo 您也可以随时从 Google AI Studio 导出最新 ZIP 覆盖更新。
    echo.
)

echo.
echo [2/3] 正在检查并更新 npm 依赖包...
call npm install

echo.
echo [3/3] 正在验证编译...
call npm run build

echo.
echo ===================================================
echo [完成] 本地代码与运行依赖已更新至最新版本！
echo 双击运行 [1-启动本地检索服务(浏览器模式).bat] 即可体验最新功能。
echo ===================================================
echo.
pause
