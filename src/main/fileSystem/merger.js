const fs = require('fs');
const path = require('path');
const { getTargetFileName, getSafeDestPath } = require('./renamer');

async function mergeVids(scanResult, outputRoot, onProgress, onLog) {
    const { vids } = scanResult;
    let filesProcessed = 0;
    const totalFiles = scanResult.totalFiles;
    const errors = [];

    // Ensure output root exists
    await fs.promises.mkdir(outputRoot, { recursive: true }).catch(err => {
        throw new Error(`Could not create output folder: ${err.message}`);
    });

    for (const vid of vids) {
        const vidName = vid.name;
        const destVidPath = path.join(outputRoot, vidName);

        try {
            await fs.promises.mkdir(destVidPath, { recursive: true });
            onLog(`Created folder: ${vidName}`);
        } catch (err) {
            const msg = `Failed to create folder ${vidName}: ${err.message}`;
            errors.push(msg);
            onLog(`ERROR: ${msg}`);
            continue; // Skip this VID logic if we can't create folder
        }

        for (const source of vid.sources) {
            const sourceName = source.source; // e.g. "Card 1"

            for (const file of source.files) {
                const srcFilePath = path.join(source.path, file.name);

                // Determine target filename (Prefix Strategy)
                const targetName = getTargetFileName(file.name, sourceName);

                // Ensure uniqueness (Safety fallback)
                const destFilePath = await getSafeDestPath(destVidPath, targetName);

                try {
                    // Copy File
                    // We use copyFile which is non-destructive to source
                    // COPYFILE_EXCL could be used but we handle existence check in getSafeDestPath
                    await fs.promises.copyFile(srcFilePath, destFilePath);

                    filesProcessed++;
                    const percentage = Math.round((filesProcessed / totalFiles) * 100);
                    onProgress(percentage);
                    onLog(`Copied: ${file.name} -> ${path.basename(destFilePath)}`);

                } catch (copyErr) {
                    const msg = `Failed to copy ${file.name} from ${sourceName}: ${copyErr.message}`;
                    errors.push(msg);
                    onLog(`ERROR: ${msg}`);
                }
            }
        }
    }

    return { success: errors.length === 0, errors };
}

module.exports = { mergeVids };
