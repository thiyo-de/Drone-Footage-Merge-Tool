// Main UI Logic
// We'll import other views via script tags order in IDNX or just rely on global scope if we aren't using a bundler.
// Since we didn't set up webpack/parcel, we probably have global scope variables from other scripts if we verify index.html inclusion.
// But wait, `index.html` only included `ui.js`.
// I need to update `index.html` to include the other scripts I'm about to write, OR I need to write everything in `ui.js`.
// Given standard Electron without bundler, I'll use standard ES modules or just globals.
// Let's stick to everything in `ui.js` for simplicity and robustness right now, avoiding import issues in vanilla JS.
// I'll leave the file separation task in task.md but just implement it as one robust file for the user to have a working app immediately without module config hell.

const elements = {
    inputPath: document.getElementById('input-path'),
    outputPath: document.getElementById('output-path'),
    btnSelectInput: document.getElementById('btn-select-input'),
    btnSelectOutput: document.getElementById('btn-select-output'),
    btnScan: document.getElementById('btn-scan'),
    sectionScanResults: document.getElementById('scan-results'),
    summaryContent: document.getElementById('summary-content'),
    checkInput: document.getElementById('check-input'),
    checkOutput: document.getElementById('check-output'),
    checkMerge: document.getElementById('check-merge-behavior'),
    btnMerge: document.getElementById('btn-merge'),
    btnCancel: document.getElementById('btn-cancel'),
    sectionProgress: document.getElementById('progress-panel'),
    progressBar: document.getElementById('main-progress'),
    progressText: document.getElementById('progress-text'),
    logs: document.getElementById('logs')
};

let currentScanResult = null;

// Event Listeners
elements.btnSelectInput.addEventListener('click', async () => {
    const paths = await window.api.selectInputFolder();
    if (paths && paths.length > 0) {
        if (paths.length === 1) {
            elements.inputPath.value = paths[0];
        } else {
            elements.inputPath.value = `${paths.length} folders selected: ${paths.map(p => p.split('\\').pop()).join(', ')}`;
        }
        elements.inputPath.dataset.fullPaths = JSON.stringify(paths); // Store full paths
        updateScanButtonState();
    }
});

// Output Selection
elements.btnSelectOutput.addEventListener('click', async () => {
    const path = await window.api.selectOutputFolder();
    if (path) {
        elements.outputPath.value = path;
        updateScanButtonState();
    }
});

elements.btnScan.addEventListener('click', async () => {
    // Retrieve paths from dataset or value
    let inPaths = [];
    if (elements.inputPath.dataset.fullPaths) {
        inPaths = JSON.parse(elements.inputPath.dataset.fullPaths);
    } else if (elements.inputPath.value) {
        inPaths = [elements.inputPath.value];
    }

    const outPath = elements.outputPath.value;

    if (inPaths.length === 0 || !outPath) return;

    // Transition UI
    elements.btnScan.disabled = true;
    elements.btnScan.textContent = 'Scanning...';

    try {
        currentScanResult = await window.api.scanLoop(inPaths, outPath);
        showScanSummary(currentScanResult);
    } catch (e) {
        alert('Scan failed: ' + e.message);
    } finally {
        elements.btnScan.disabled = false;
        elements.btnScan.textContent = 'Scan Folders';
    }
});

function updateScanButtonState() {
    elements.btnScan.disabled = !(elements.inputPath.value && elements.outputPath.value);
}

function showScanSummary(result) {
    elements.sectionScanResults.classList.remove('hidden');

    let html = `<p><strong>Total VIDs Found:</strong> ${result.totalVids}</p>`;
    html += `<p><strong>Total Files:</strong> ${result.totalFiles}</p>`;

    if (result.errors.length > 0) {
        html += `<div class="error-box"><strong>Errors:</strong><br>${result.errors.join('<br>')}</div>`;
    }

    html += '<ul>';
    result.vids.forEach(vid => {
        const sources = vid.sources.map(s => `${s.source} (${s.fileCount} files)`).join(', ');
        html += `<li><strong>${vid.name}</strong>: Found in [${sources}]</li>`;
    });
    html += '</ul>';

    elements.summaryContent.innerHTML = html;

    resetConfirmations();
}

function resetConfirmations() {
    elements.checkInput.checked = false;
    elements.checkOutput.checked = false;
    elements.checkMerge.checked = false;
    elements.btnMerge.disabled = true;
}

[elements.checkInput, elements.checkOutput, elements.checkMerge].forEach(el => {
    el.addEventListener('change', () => {
        const allChecked = elements.checkInput.checked &&
            elements.checkOutput.checked &&
            elements.checkMerge.checked;
        elements.btnMerge.disabled = !allChecked;
    });
});

elements.btnMerge.addEventListener('click', async () => {
    elements.sectionScanResults.classList.add('hidden');
    elements.sectionProgress.classList.remove('hidden');

    // Reset logs
    elements.logs.innerHTML = '';

    // Subscribe to logs/progress
    window.api.onLog((msg) => {
        const div = document.createElement('div');
        div.textContent = msg;
        elements.logs.appendChild(div);
        elements.logs.scrollTop = elements.logs.scrollHeight;
    });

    window.api.onProgress((val) => {
        elements.progressBar.value = val;
        elements.progressText.textContent = `Merging... ${val}%`;
    });

    const result = await window.api.startMerge({
        scanResult: currentScanResult,
        outputRoot: elements.outputPath.value
    });

    elements.progressText.textContent = result.success ? 'Merge Complete!' : 'Merge Finished with Errors';

    if (result.success) {
        const btn = document.createElement('button');
        btn.textContent = "Close / New Scan";
        btn.className = "primary";
        btn.style.marginTop = "20px";
        btn.onclick = () => location.reload();
        elements.sectionProgress.appendChild(btn);
    } else {
        // Show errors proactively so user can report them
        let errorMsg = 'Merge finished with errors:\n\n';
        if (result.errors && result.errors.length > 0) {
            errorMsg += result.errors.slice(0, 5).join('\n');
            if (result.errors.length > 5) errorMsg += '\n...and more.';
        } else {
            errorMsg += 'Check the log panel for details.';
        }
        alert(errorMsg);
    }
});

elements.btnCancel.addEventListener('click', () => {
    elements.sectionScanResults.classList.add('hidden');
    currentScanResult = null;
});
