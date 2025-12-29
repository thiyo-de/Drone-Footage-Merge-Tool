module.exports = {
    VID_FOLDER_REGEX: /^VID_\d{8}_\d{6}$/, // Matches VID_YYYYMMDD_HHMMSS
    LOG_FILE_PREFIX: '_merge_log_',

    // Status codes
    STATUS: {
        IDLE: 'IDLE',
        SCANNING: 'SCANNING',
        CONFIRM_WAIT: 'CONFIRM_WAIT',
        MERGING: 'MERGING',
        COMPLETED: 'COMPLETED',
        ERROR: 'ERROR'
    }
};
