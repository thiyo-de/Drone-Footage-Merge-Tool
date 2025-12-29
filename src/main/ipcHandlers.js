const { dialog, shell } = require('electron');
const path = require('path');
const scanner = require('./fileSystem/scanner');
const merger = require('./fileSystem/merger');
const verifier = require('./fileSystem/verifier');
const logger = require('./fileSystem/logger');



let mainWindow = null;

function setWindow(window) {
    mainWindow = window;
    logger.init(window);
}

function init(ipcMain) {

    // Dialog: Select Input
    ipcMain.handle('dialog:selectInput', async () => {
        if (!mainWindow) return null;
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory', 'multiSelections']
        });
        if (result.canceled) return null;
        return result.filePaths;
    });

    // Dialog: Select Output
    ipcMain.handle('dialog:selectOutput', async () => {
        if (!mainWindow) return null;
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });
        if (result.canceled) return null;
        return result.filePaths[0];
    });

    // App: Scan
    ipcMain.handle('app:scan', async (event, inputPaths, outputPath) => {
        logger.log(`Starting scan of: ${inputPaths.length} input(s)`);
        const result = await scanner.scanInputPaths(inputPaths);
        logger.log(`Scan complete. Found ${result.totalVids} VIDs.`);
        return result;
    });

    // App: Merge
    ipcMain.handle('app:merge', async (event, { scanResult, outputRoot }) => {
        logger.startNewLog(outputRoot);
        logger.log('--- STARTING MERGE ---');
        logger.log(`Input Source VIDs: ${scanResult.totalVids}`);
        logger.log(`Output: ${outputRoot}`);

        // progress callback
        const onProgress = (percentage) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('merge:progress', percentage);
            }
        };

        const mergeResult = await merger.mergeVids(scanResult, outputRoot, onProgress, (msg) => logger.log(msg));

        if (mergeResult.success) {
            logger.log('Merge process finished. Starting verification...');
            // Verification
            const verifySuccess = await verifier.verifyMerge(scanResult, outputRoot, logger);

            const finalMsg = verifySuccess ? 'ALL DONE: Merge and Verification Successful.' : 'DONE WITH WARNINGS: Check logs.';
            logger.log(finalMsg);

            return { success: verifySuccess, errors: [] }; // already logged errors
        } else {
            logger.log('MERGE HALTED due to critical errors.');
            return { success: false, errors: mergeResult.errors };
        }
    });

    // Shell: Open
    ipcMain.handle('shell:open', async (event, filePath) => {
        await shell.openPath(filePath);
    });
}

module.exports = { init, setWindow };
