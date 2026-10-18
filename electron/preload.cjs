const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  selectDirectory: () => ipcRenderer.invoke('dialog:select-directory'),
  selectFiles: () => ipcRenderer.invoke('dialog:select-files'),
  openPath: (fullPath) => ipcRenderer.invoke('shell:open-path', fullPath),
  showItemInFolder: (fullPath) => ipcRenderer.invoke('shell:show-in-folder', fullPath),
  scanDirectory: (dirPath) => ipcRenderer.invoke('fs:scan-directory', dirPath),
  readFileBuffer: (fullPath) => ipcRenderer.invoke('fs:read-file-buffer', fullPath),
});
