const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: '本地文件全文搜索',
    backgroundColor: '#f5f5f4',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    autoHideMenuBar: true,
  });

  // Check if running in development mode
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_DEV_URL;

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    // In production build, load the local index.html from dist
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
            .card { background: white; padding: 36px 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); max-width: 540px; text-align: center; border: 1px solid #e2e8f0; }
            h2 { color: #dc2626; margin-top: 0; font-size: 20px; }
            p { font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0; }
            .box { background: #0f172a; color: #38bdf8; padding: 14px 18px; border-radius: 8px; text-align: left; font-family: Consolas, monospace; margin: 18px 0; font-size: 13px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ 未找到前端编译文件 (dist/index.html)</h2>
            <p>因为尚未执行前端代码打包，dist 目录不存在，所以暂无页面内容。</p>
            <div class="box">
              # 1. 请在终端或命令提示符中执行编译命令：<br/>
              <b>npm run build</b><br/><br/>
              # 2. 编译成功后重新启动 Electron 即可：<br/>
              <b>npm run electron:start</b>
            </div>
            <p>执行 <code>npm run build</code> 后，重新运行本窗口即可正常使用。</p>
          </div>
        </body>
        </html>
      `)}`);
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for Native Windows File System Operations

// 1. Native Windows Folder Selection Dialog
ipcMain.handle('dialog:select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择要检索的本地文件夹',
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// 2. Native Windows Multi-Files Selection Dialog
ipcMain.handle('dialog:select-files', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择要检索的本地文件',
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: '兼容文档',
        extensions: ['txt', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'pdf', 'html', 'htm', 'md', 'json', 'log'],
      },
      { name: '所有文件', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths;
});

// 3. Open File with Windows Default Application (e.g. Word, Excel, Acrobat, Notepad)
ipcMain.handle('shell:open-path', async (event, fullPath) => {
  try {
    if (!fs.existsSync(fullPath)) {
      return { success: false, error: '文件不存在或已被移除' };
    }
    const errorMessage = await shell.openPath(fullPath);
    if (errorMessage) {
      return { success: false, error: errorMessage };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 4. Reveal & Highlight File in Windows File Explorer
ipcMain.handle('shell:show-in-folder', async (event, fullPath) => {
  try {
    if (fs.existsSync(fullPath)) {
      shell.showItemInFolder(fullPath);
      return { success: true };
    } else {
      // Fallback: check if parent folder exists
      const parentDir = path.dirname(fullPath);
      if (fs.existsSync(parentDir)) {
        shell.openPath(parentDir);
        return { success: true };
      }
      return { success: false, error: '目录不存在' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 5. Recursively scan directory for supported files
ipcMain.handle('fs:scan-directory', async (event, dirPath) => {
  const supportedExtensions = new Set([
    '.txt', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.pdf',
    '.html', '.htm', '.md', '.log', '.json', '.xml', '.yaml', '.yml',
  ]);

  const results = [];

  function scan(dir) {
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        // Skip common ignored directories to stay fast
        if (['node_modules', '.git', '$RECYCLE.BIN', 'System Volume Information', 'dist'].includes(item.name)) {
          continue;
        }

        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          scan(fullPath);
        } else if (item.isFile()) {
          const ext = path.extname(item.name).toLowerCase();
          if (supportedExtensions.has(ext)) {
            try {
              const stat = fs.statSync(fullPath);
              results.push({
                fullPath,
                name: item.name,
                size: stat.size,
                mtime: stat.mtimeMs,
                extension: ext.replace('.', ''),
              });
            } catch (statErr) {
              // skip unreadable file
            }
          }
        }
      }
    } catch (err) {
      // directory permission error or inaccessible
    }
  }

  scan(dirPath);
  return results;
});

// 6. Read local file content from disk as Buffer
ipcMain.handle('fs:read-file-buffer', async (event, fullPath) => {
  try {
    const buffer = fs.readFileSync(fullPath);
    const stat = fs.statSync(fullPath);
    return {
      success: true,
      data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      size: stat.size,
      mtime: stat.mtimeMs,
      name: path.basename(fullPath),
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
