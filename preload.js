const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getConfigFolders: () => ipcRenderer.invoke('get-config-folders'),
  selectDestination: () => ipcRenderer.invoke('select-destination'),
  compareAllFolders: (sourceFolders, destinationRoot) =>
    ipcRenderer.invoke('compare-all-folders', { sourceFolders, destinationRoot }),
  copySelectedFiles: (paths, destinationRoot) =>
    ipcRenderer.invoke('copy-selected-files', { paths, destinationRoot })
});
