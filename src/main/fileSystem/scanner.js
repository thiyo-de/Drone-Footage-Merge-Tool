const fs = require('fs');
const path = require('path');
const { VID_FOLDER_REGEX } = require('../../shared/constants');

async function scanInputPaths(pathList) {
    const result = {
        vids: {}, // Map<VID_NAME, Array<SourceInfo>>
        totalFiles: 0,
        estimatedSize: 0,
        errors: []
    };

    if (!Array.isArray(pathList) || pathList.length === 0) {
        result.errors.push("No input folders selected.");
        return sortResults(result);
    }

    // Iterate over all user-selected paths
    for (const inputPath of pathList) {
        try {
            await processInputPath(inputPath, result);
        } catch (err) {
            result.errors.push(`Failed to access ${inputPath}: ${err.message}`);
        }
    }

    return sortResults(result);
}

// Determines if path is a Card (direct parent of VIDs) or a Root (contains Cards)
async function processInputPath(inputPath, result) {
    const stats = await fs.promises.stat(inputPath);
    if (!stats.isDirectory()) return;

    const entries = await fs.promises.readdir(inputPath, { withFileTypes: true });

    // Check for VIDs directly inside (Card Level)
    const hasVids = entries.some(e => e.isDirectory() && VID_FOLDER_REGEX.test(e.name));

    if (hasVids) {
        // It's a Card folder
        const cardName = path.basename(inputPath);
        await scanCardFolder(inputPath, cardName, result);
    } else {
        // Assume it's a Root folder (contains Cards)
        // Scan its children
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const cardName = entry.name;
                const cardPath = path.join(inputPath, cardName);

                // We recursively check the children. 
                // But strict requirement says Root -> Card -> VID.
                // So we just call scanCardFolder on the children.
                await scanCardFolder(cardPath, cardName, result);
            }
        }
    }
}

async function scanCardFolder(cardPath, cardName, result) {
    try {
        const entries = await fs.promises.readdir(cardPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory() && VID_FOLDER_REGEX.test(entry.name)) {
                const vidName = entry.name;
                const fullPath = path.join(cardPath, vidName);

                // Count files inside
                const files = await getFiles(fullPath);

                if (!result.vids[vidName]) {
                    result.vids[vidName] = [];
                }

                result.vids[vidName].push({
                    source: cardName,
                    path: fullPath,
                    fileCount: files.length,
                    files: files
                });

                result.totalFiles += files.length;
            }
        }
    } catch (err) {
        // It's okay if a subfolder isn't readable, just log it
        result.errors.push(`Failed to scan card ${cardName}: ${err.message}`);
    }
}

async function getFiles(dirPath) {
    try {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        return entries
            .filter(e => e.isFile() && !e.name.startsWith('.')) // Ignore hidden files
            .map(e => ({
                name: e.name,
                size: 0 // We could stat here if needed, keeping it fast for now
            }));
    } catch (e) {
        return [];
    }
}

function sortResults(result) {
    // Convert map to array for easier UI handling
    const vidList = Object.keys(result.vids).sort().map(vidName => {
        return {
            name: vidName,
            sources: result.vids[vidName]
        };
    });

    return {
        vids: vidList,
        totalVids: vidList.length,
        totalFiles: result.totalFiles,
        errors: result.errors
    };
}

module.exports = { scanInputPaths };
