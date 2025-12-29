# 🛩️ Drone Footage Merge Tool

[![Electron](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)](https://www.electronjs.org/)
[![Platform - Windows & macOS](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-blue?style=for-the-badge)](https://github.com/yourusername/drone-vid-merge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**An internal office tool for automatically merging drone footage from multiple memory cards into organized, editor-ready folders.**

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [Development](#development)
- [Technical Architecture](#-technical-architecture)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The **Drone Footage Merge Tool** is a cross-platform desktop application designed for production offices that handle large volumes of drone footage. It automatically scans multiple memory cards, identifies matching `VID_` folders, and merges them into a single organized structure with zero risk of file overwriting.

### 🔍 **Problem Solved**
- **Time-consuming manual copying** from 6+ memory cards per shoot
- **Risk of overwriting files** with identical names across cards
- **Disorganized folder structures** that slow down editing workflows
- **No audit trail** of what was merged and when

### ✅ **Solution**
- **One-click merging** of all matching footage
- **Automatic duplicate handling** with smart renaming
- **Flat, organized output** ready for editing
- **Complete audit logs** of every merge operation

---

## ✨ Features

### 🚀 **Core Features**
- **Cross-Platform Support**: Native Windows (.exe) and macOS (.dmg) applications
- **Smart Scanning**: Read-only scan to preview merge operations before execution
- **Mandatory Confirmation**: Merge button disabled until explicit user confirmation
- **Zero Overwrite Risk**: Automatic renaming of duplicates (`Card1__filename.ext`)
- **Complete Logging**: Real-time log panel + persistent log file for auditing
- **Progress Tracking**: Live progress bar and per-folder status updates

### 🔧 **Technical Features**
- **Non-Destructive Operations**: Never modifies or deletes source files
- **Metadata Preservation**: Maintains original file timestamps and attributes
- **Streaming Copy**: Handles large files without RAM overload
- **Error Resilience**: Graceful handling of permission issues and disk space problems

### 📁 **Supported Workflow**
```
Input (Multiple Cards)          →        Output (Organized)
                                
SD Card/                        →        Merged/
├── Card 1/                     →        ├── VID_20240101_120000/
├── Card 2/                     →        │   ├── Card1__DJI_0001.MP4
├── Card 3/                     →        │   ├── Card1__DJI_0001.SRT
├── Card 4/                     →        │   ├── Card2__DJI_0001.MP4
├── Card 5/                     →        │   └── SD__DJI_0001.MP4
└── SD Card/                    →        └── _merge_log_2024-01-01.txt
```

---

## 📦 Installation

### For End Users (Office Staff)

#### Windows
1. Download the latest `DroneMerge-win.exe` from [Releases](../../releases)
2. Run the installer (no admin rights required)
3. Launch from Start Menu or Desktop shortcut

#### macOS
1. Download the latest `DroneMerge-mac.dmg` from [Releases](../../releases)
2. Drag the app to your Applications folder
3. Launch from Applications (may need to right-click → Open on first run)

### System Requirements
- **Windows**: Windows 10/11 (64-bit), 4GB RAM, 500MB free disk space
- **macOS**: macOS 10.14+, Intel or Apple Silicon, 4GB RAM
- **Storage**: Enough free space for duplicated footage during merge

---

## 📖 Usage Guide

### 🎬 **Basic Workflow**

1. **Launch Application**
   ```
   Double-click Drone Merge Tool
   ```

2. **Select Folders**
   - **Input**: Choose folder containing your memory card folders (Card 1, Card 2, etc.)
   - **Output**: Choose where merged footage should be saved

3. **Scan & Review**
   - Click "Scan" to preview what will be merged
   - Review the summary showing:
     - Number of VID folders detected
     - Total file count
     - Estimated size
     - Any filename collisions

4. **Confirm & Merge**
   - ✅ Check both confirmation boxes
   - ✅ Acknowledge you've verified the paths
   - Click "Start Merge" (only enabled after confirmation)

5. **Monitor Progress**
   - Watch real-time progress
   - View detailed logs in the panel
   - Cancel anytime if needed

6. **Completion**
   - View success summary
   - Access log file in output folder
   - Open merged footage location

### 🎥 **Example Scenario**

**Shoot Day**: 6 memory cards, 24 VID folders, 500+ files

| Manual Process | With This Tool |
|----------------|----------------|
| ⏱️ 45+ minutes | ⏱️ 2 minutes |
| 🎲 High error risk | ✅ Zero overwrite risk |
| 📁 Disorganized | 📁 Perfectly organized |
| ❌ No audit trail | 📋 Complete logs |

### ⚠️ **Important Notes**
- **Source files are never modified** - always safe to retry
- **Internet connection not required** - all processing is local
- **Cancel anytime** - partial merges are cleaned up automatically
- **Logs are mandatory** - every operation is recorded

---

## Development

### Internal Office Tool

This tool is designed to automatically merge `VID_...` folders from multiple drone memory cards into a single structure.

### Development Setup

1. **Install Dependencies**:
    ```bash
    npm install
    ```

2. **Run Locally**:
    ```bash
    npm start
    ```

3. **Build**:
    - **Windows**: `npm run dist:win`
    - **macOS**: `npm run dist:mac`

### Structure
See `docs/WORKFLOW.md` and `docs/FEATURES.md` for details.

### Available Scripts
```bash
# Development
npm start          # Launch app in dev mode
npm run dev        # Same as npm start

# Building
npm run build      # Build for current platform
npm run dist:win   # Build Windows executable (.exe)
npm run dist:mac   # Build macOS application (.dmg)
npm run package    # Create distributable packages

# Code Quality
npm run lint       # Run ESLint
npm run format     # Format code with Prettier

# Cleaning
npm run clean      # Remove build artifacts
```

---

## 🏗️ Technical Architecture

### 📂 Project Structure
```
drone-vid-merge/
├── src/
│   ├── main/          # Electron main process
│   ├── renderer/      # UI components
│   ├── preload/       # Secure IPC bridge
│   └── shared/        # Shared utilities
├── build/             # Icons and assets
├── dist/              # Built executables
└── docs/              # Documentation
```

### 🔌 IPC Communication Flow
```
Renderer (UI) → Preload (Secure Bridge) → Main Process → File System
      ↓               ↓                       ↓              ↓
Folder Picker   Exposed APIs            Merge Engine    Read/Write
Progress Bar    Safety Checks           Logging System  Verification
```

### 🛡️ Security Model
- **Sandboxed Renderer**: UI cannot access filesystem directly
- **Limited IPC Exposes**: Only 4 approved actions (scan, confirm, merge, cancel)
- **No Network Calls**: Entirely offline operation
- **Local Files Only**: No cloud uploads or telemetry

### Development Guidelines
1. **File Operations**: Only in `/src/main/fileSystem/` modules
2. **UI Logic**: Only in `/src/renderer/scripts/`
3. **IPC**: Use preload.js as secure bridge
4. **Logging**: Use logger.js for consistent logging

---

## 🤝 Contributing

### For Internal Developers
1. Create feature branch from `main`
2. Follow existing code structure and patterns
3. Update documentation if needed
4. Test on both Windows and macOS
5. Submit pull request

### Code Standards
- **ESLint** configuration provided
- **JavaScript ES6+** with async/await
- **Modular architecture** - single responsibility per file
- **Comprehensive logging** for debugging

### Testing Checklist
- [ ] Scan works with nested folders
- [ ] Merge handles 1000+ files
- [ ] Duplicate renaming works correctly
- [ ] Logs are complete and accurate
- [ ] UI remains responsive during large merges
- [ ] Cancel operation works mid-merge

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

### Usage Rights
- ✅ Free for internal office use
- ✅ Can be modified for specific workflows
- ✅ Can be distributed within organization
- ❌ Cannot be sold or relicensed
- ❌ No warranty provided

---

## 📞 Support

### Internal Office Support
- **Documentation**: Check `/docs/` folder in repository
- **SOP**: Standard Operating Procedure in `docs/SOP.md`
- **Troubleshooting**: Common issues in `docs/TROUBLESHOOTING.md`

### Issue Reporting
1. Check existing issues
2. Include log file from merge attempt
3. Describe exact steps to reproduce
4. Specify OS version and app version

---

## 🚀 Quick Start for New Users

```bash
# Download latest release
# Install application
# Run and select folders
# Scan → Confirm → Merge → Done!
```

**Typical time savings: 40+ minutes per shoot day**

---

## 📊 Version History

| Version | Date       | Changes                          |
|---------|------------|----------------------------------|
| v1.0.0  | 2024-01-15 | Initial release                  |
| v1.1.0  | 2024-02-01 | Added progress tracking          |
| v1.2.0  | 2024-03-01 | Enhanced logging system          |

---

**⭐ If this tool saves your team time, consider starring the repository!**

---
*Built with ❤️ for production teams who hate manual file copying.*