const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    openExternal: (url) => ipcRenderer.invoke('openExternal', url),
    execCommand: (command) => ipcRenderer.invoke('execCommand', command),
    closeWindow: () => ipcRenderer.invoke('closeWindow')
});