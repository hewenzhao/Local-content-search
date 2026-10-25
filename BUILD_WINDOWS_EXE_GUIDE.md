# 本地文件内容搜索工具 - 本地更新、运行与编译指南

本项目已预先配置好 **一键运行脚本**、**Electron 原生打包环境** 以及 **GitHub Actions 云端自动构建**，支持直接在 Windows PC 下秒级更新并使用。

---

## ⚡ 极简方式：Windows 桌面一键双击脚本

解压或更新代码后，项目根目录为您准备了 3 个无需手动敲命令的便捷批处理脚本：

1. **`1-启动本地检索服务(浏览器模式).bat`**
   - **作用**：首次双击自动安装依赖，启动本地极速检索服务，并在默认浏览器中自动打开 `http://localhost:3000`。
   - **特点**：响应最快，直接享受最新特性（支持 TXT、DOC、DOCX、Excel、CSV、JSON、PDF、HTML、短语搜索与解析索引保存）。

2. **`2-打包Windows桌面版软件(.exe).bat`**
   - **作用**：自动编译前端并打包生成独立运行的 Windows `.exe` 桌面程序。
   - **产物**：自动生成在 `dist-electron/` 文件夹中（包含便携单文件免安装版与标准 Setup 安装包）。

3. **`3-更新本地代码与依赖(Git同步).bat`**
   - **作用**：如果您配置了 Git 仓库，双击即可一键从 GitHub 拉取最新提交并刷新依赖。

---

## 🔄 如何在本地 PC 更新最新版代码

### 方式一：直接下载最新代码压缩包（推荐，最省心）
1. 在 Google AI Studio 界面右上角（或右上角设置/更多菜单），选择 **Export to ZIP**（导出为 ZIP 压缩包）。
2. 下载后解压，将解压出的所有文件**直接覆盖替换**到您本地 PC 的工作目录（例如 `E:\Search_Mac\` 或 `D:\file-search-tool\`）。
3. 双击 `1-启动本地检索服务(浏览器模式).bat`（浏览器直接运行）或 `2-打包Windows桌面版软件(.exe).bat`（重新编译 .exe），即可立刻更新到最新版本！

### 方式二：使用 Git 命令行更新
如果您的本地 PC 已安装 Git：
```bash
# 1. 拉取远程主分支最新代码
git pull origin main

# 2. 安装可能新增的依赖
npm install

# 3. 运行本地开发调试
npm run dev

# 4. 或打包为桌面端 exe
npm run electron:build:win
```
> **如果提示 `'git' 不是内部或外部命令`**：说明您的 Windows 尚未安装 Git 命令行工具，可前往 [https://git-scm.com/download/win](https://git-scm.com/download/win) 下载安装；或者直接使用上述【方式一】的 ZIP 覆盖更新。

---

## ☁️ GitHub Actions 云端自动打包（Windows .exe + macOS .dmg）

项目中已内置 `.github/workflows/build.yml` 工作流配置。只要您将代码推送到 GitHub 仓库：
1. 打开您的 GitHub 仓库页面：`https://github.com/hewenzhao/local-file-searcher`
2. 点击顶部的 **Actions** 标签页；
3. GitHub 的云端虚拟机会自动分别在 Windows 和 macOS 系统中执行编译打包；
4. 编译完成后，在 Actions 页面底部即可直接下载构建出的：
   - Windows 版 `.exe` 安装包与便携绿色版
   - macOS 版 `.dmg` 安装镜像与 `.zip`
无需占用您本地电脑的 CPU 和存储空间！

---

## 🎯 本地手动打包命令参考

如果习惯在命令行执行：

| 操作目标 | 执行命令 |
| :--- | :--- |
| 安装依赖 | `npm install` |
| 本地启动（浏览器） | `npm run dev` |
| 启动桌面窗口调试 | `npm run electron:dev` |
| 打包 Windows .exe (安装包+便携版) | `npm run electron:build:win` |
| 仅打包 Windows 单文件便携版 | `npm run electron:build:portable` |
| 打包 macOS .dmg (需在 Mac 或 GitHub Actions) | `npm run electron:build:mac` |

---

## 💡 Windows 桌面版独占增强功能

当打包为 Windows `.exe` 运行时，应用程序会自动启用以下系统级原生特性：
- **在文件资源管理器中定位**：点击即可调用 Windows 资源管理器自动打开文件所在文件夹并**高亮选中该文件**。
- **系统关联程序打开**：点击“打开文件”直接调用您本地关联的 Microsoft Office Word、Excel、Adobe Acrobat 或记事本打开该文件。
- **原生文件与文件夹选择框**：直接调用 Windows 系统的浏览文件夹对话框。
- **原生硬盘读取**：免去网页沙箱对大文件夹的限制，全速流式提取。

---

## ❓ 常见问题排查 (FAQ)

### 1. 首次打开提示“Windows 已保护你的电脑” (SmartScreen)
- **原因**：自行打包的软件未向微软购买昂贵的数字签名证书（EV Code Signing），属于正常的防误触机制。
- **解决办法**：点击弹窗中的 **“更多信息”**，然后点击右下角的 **“仍要运行”** 即可正常开启。

### 2. 打包过程中下载 electron 核心库较慢或超时
- **已全面优化**：项目中的 `build-electron.cjs` 和批处理脚本已**自动内置国内高速镜像加速源**（npmmirror），无需手动设置任何环境变量。
- 如需在命令行手动执行并指定镜像，CMD 中可运行：
  ```cmd
  set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
  set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
  npm run electron:build
  ```
  *(注意：Windows CMD 中请使用 `set` 而不是 `npm config set`)*

### 3. 如何更换软件图标？
- 准备一张 `icon.ico` 图标文件，放置在项目根目录中；
- 在 `electron-builder.json` 中配置 `"win": { "icon": "icon.ico" }` 重新打包即可。
