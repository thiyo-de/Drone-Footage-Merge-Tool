const path = require('path');
const fs = require('fs');

/**
 * Determines the destination filename.
 * based on the "FINAL OUTPUT STRUCTURE (LOCKED)" in INFO.
 * Format: {ChildFolderName}__{OriginalFileName}
 * Example: Card1__DJI_0001.MP4
 */
function getTargetFileName(originalName, sourceName) {
    // sanitize sourceName just in case
    const safeSource = sourceName.replace(/[^a-zA-Z0-9_-]/g, '');
    return `${safeSource}__${originalName}`;
}

/**
 * Checks if a file exists, and if so, returns a non-conflicting name (appending _1, _2 if needed).
 * Although the prefix strategy limits collisions, this is a safety fallback.
 */
async function getSafeDestPath(folderPath, fileName) {
    let finalName = fileName;
    let destPath = path.join(folderPath, finalName);
    let counter = 1;

    while (await fileExists(destPath)) {
        const ext = path.extname(fileName);
        const base = path.basename(fileName, ext);
        finalName = `${base}_${counter}${ext}`;
        destPath = path.join(folderPath, finalName);
        counter++;
    }

    return destPath;
}

async function fileExists(path) {
    try {
        await fs.promises.access(path);
        return true;
    } catch {
        return false;
    }
}

module.exports = { getTargetFileName, getSafeDestPath };
