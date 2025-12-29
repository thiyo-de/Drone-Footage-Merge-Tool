const fs = require('fs');
const path = require('path');

async function verifyMerge(scanResult, outputRoot, logger) {
    let missingFiles = 0;

    logger.log('--- STARTING VERIFICATION ---');

    for (const vid of scanResult.vids) {
        const destVidPath = path.join(outputRoot, vid.name);

        // Check if VID folder exists
        try {
            await fs.promises.access(destVidPath);
        } catch {
            logger.log(`ERROR: Missing VID folder ${vid.name}`);
            missingFiles += vid.sources.reduce((acc, s) => acc + s.files.length, 0);
            continue;
        }

        // Verify file counts
        // We expect the destination folder to have equal or more files than source inputs
        // (More if there were pre-existing files, which shouldn't happen in a clean folder)

        try {
            const destFiles = await fs.promises.readdir(destVidPath);
            let vidTotalSourceFiles = 0;

            for (const source of vid.sources) {
                vidTotalSourceFiles += source.files.length;
            }

            if (destFiles.length < vidTotalSourceFiles) {
                logger.log(`WARNING: File count mismatch in ${vid.name}. Expected ${vidTotalSourceFiles}, found ${destFiles.length}`);
                missingFiles += (vidTotalSourceFiles - destFiles.length);
            } else {
                logger.log(`Verified ${vid.name}: ${destFiles.length} files.`);
            }

        } catch (err) {
            logger.log(`ERROR: Verification failed for ${vid.name}: ${err.message}`);
        }
    }

    if (missingFiles === 0) {
        logger.log('VERIFICATION SUCCESSFUL: All files accounted for.');
        return true;
    } else {
        logger.log(`VERIFICATION FAILED: ${missingFiles} files missing mostly.`);
        return false;
    }
}

module.exports = { verifyMerge };
