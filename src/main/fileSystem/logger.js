const fs = require('fs');
const path = require('path');
const { LOG_FILE_PREFIX } = require('../../shared/constants');

class Logger {
    constructor() {
        this.logFilePath = null;
        this.mainWindow = null;
    }

    init(window) {
        this.mainWindow = window;
    }

    startNewLog(outputFolder) {
        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
        const filename = `${LOG_FILE_PREFIX}${timestamp}.txt`;
        this.logFilePath = path.join(outputFolder, filename);

        const header = `DRONE MERGE LOG - STARTED AT ${new Date().toLocaleString()}\n------------------------------------------------\n\n`;
        try {
            fs.writeFileSync(this.logFilePath, header);
            return this.logFilePath;
        } catch (e) {
            console.error('Failed to create log file', e);
            return null;
        }
    }

    log(message) {
        const time = new Date().toLocaleTimeString();
        const fullMsg = `[${time}] ${message}`;

        // 1. Send to UI
        if (this.mainWindow) {
            this.mainWindow.webContents.send('app:log', fullMsg);
        }

        // 2. Append to file
        if (this.logFilePath) {
            try {
                fs.appendFileSync(this.logFilePath, fullMsg + '\n');
            } catch (e) {
                console.error('Failed to write to log file', e);
            }
        } else {
            console.log(fullMsg);
        }
    }
}

module.exports = new Logger();
