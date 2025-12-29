const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ipcHandlers = require('./ipcHandlers');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/preload.js'),
            sandbox: false // Required for some file system operations if not fully isolated
        },
        backgroundColor: '#1f1f1f',
        show: false // Don't show until ready-to-show
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Update handlers with new window reference
    ipcHandlers.setWindow(mainWindow);

    // Open DevTools in dev mode
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    // Initialize IPC Handlers
    // Must be after createWindow so mainWindow is defined
    ipcHandlers.init(ipcMain);
    ipcHandlers.setWindow(mainWindow);

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
