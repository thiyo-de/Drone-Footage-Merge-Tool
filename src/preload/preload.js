const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Folder Selection
    selectInputFolder: () => ipcRenderer.invoke('dialog:selectInput'),
    selectOutputFolder: () => ipcRenderer.invoke('dialog:selectOutput'),

    // Core Actions
    scanLoop: (inputPath, outputPath) => ipcRenderer.invoke('app:scan', inputPath, outputPath),
    startMerge: (options) => ipcRenderer.invoke('app:merge', options),

    // Utils
    openExternal: (path) => ipcRenderer.invoke('shell:open', path),

    // Events
    onProgress: (callback) => ipcRenderer.on('merge:progress', (_event, value) => callback(value)),
    onLog: (callback) => ipcRenderer.on('app:log', (_event, msg) => callback(msg)),

    // Cleanup
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
