# Features

## Core Features

*   **Folder Scanning**: Recursively scans input for `VID_...` folders.
*   **Smart Grouping**: Groups folders with identical names (e.g., `VID_20231027_100000` from multiple cards).
*   **Flat Merge**: Merges contents of grouped folders into a single output folder.
*   **Collision Handling**: Automatically renames files if duplicates exist (`{ParentName}__{OriginalName}`).
*   **Verification**: Checks file counts after copying.

## Tech Stack
*   Electron
*   Node.js

## Safety
*   Read-only Scan mode.
*   Non-destructive copy (originals are untouched).
*   Mandatory user confirmation.
