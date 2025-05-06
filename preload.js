const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectFolders: () => ipcRenderer.invoke('select-folders'),
  backupFiles: (source, destination) => ipcRenderer.invoke('backup-files', { source, destination })
});