// ========================================
// FLOATING ACTION BUTTON (FAB) MENU
// Global component for character sheets
// ========================================

/**
 * Creates and initializes the FAB menu for character sheets
 * @param {Object} options - Configuration options
 * @param {Function} options.onSave - Callback for save action
 * @param {Function} options.onPrint - Callback for print action
 * @param {Function} options.onExport - Callback for export action
 * @param {Function} options.onImport - Callback for import action (receives file)
 * @param {Function} options.onClear - Callback for clear action
 */
export function initFAB(options = {}) {
    const {
        onSave,
        onPrint,
        onExport,
        onImport,
        onClear
    } = options;

    // Create FAB HTML structure
    const fabHTML = `
        <div class="fab-container">
            <div class="fab-menu" id="fabMenu">
                ${onSave ? `
                    <button class="fab-option btn-primary" id="saveSheet">
                        <span class="fab-icon">💾</span>
                        <span class="fab-label">SALVAR</span>
                    </button>
                ` : ''}
                ${onPrint ? `
                    <button class="fab-option btn-secondary" id="printSheet">
                        <span class="fab-icon">🖨️</span>
                        <span class="fab-label">SALVAR PDF</span>
                    </button>
                ` : ''}
                ${onExport ? `
                    <button class="fab-option btn-success" id="exportSheet">
                        <span class="fab-icon">⬇️</span>
                        <span class="fab-label">EXPORTAR</span>
                    </button>
                ` : ''}
                ${onImport ? `
                    <label for="importFile" class="fab-option btn-secondary" style="cursor: pointer; margin: 0;">
                        <span class="fab-icon">⬆️</span>
                        <span class="fab-label">IMPORTAR</span>
                    </label>
                    <input type="file" id="importFile" accept=".json" style="display: none;">
                ` : ''}
                ${onClear ? `
                    <button class="fab-option btn-danger" id="clearSheet">
                        <span class="fab-icon">🗑️</span>
                        <span class="fab-label">LIMPAR</span>
                    </button>
                ` : ''}
            </div>
            <button class="fab-button" id="fabToggle">
                <span class="fab-icon-main">⚙️</span>
            </button>
        </div>
    `;

    // Insert FAB into body
    document.body.insertAdjacentHTML('beforeend', fabHTML);

    // Get elements
    const fabToggle = document.getElementById('fabToggle');
    const fabMenu = document.getElementById('fabMenu');

    // Toggle FAB menu
    if (fabToggle && fabMenu) {
        fabToggle.addEventListener('click', () => {
            fabMenu.classList.toggle('active');
            fabToggle.classList.toggle('active');
        });

        // Close FAB when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.fab-container')) {
                fabMenu.classList.remove('active');
                fabToggle.classList.remove('active');
            }
        });
    }

    // Attach event listeners for actions
    if (onSave) {
        const saveBtn = document.getElementById('saveSheet');
        if (saveBtn) {
            saveBtn.addEventListener('click', onSave);
        }
    }

    if (onPrint) {
        const printBtn = document.getElementById('printSheet');
        if (printBtn) {
            printBtn.addEventListener('click', onPrint);
        }
    }

    if (onExport) {
        const exportBtn = document.getElementById('exportSheet');
        if (exportBtn) {
            exportBtn.addEventListener('click', onExport);
        }
    }

    if (onImport) {
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    onImport(file);
                    // Reset file input
                    e.target.value = '';
                }
            });
        }
    }

    if (onClear) {
        const clearBtn = document.getElementById('clearSheet');
        if (clearBtn) {
            clearBtn.addEventListener('click', onClear);
        }
    }
}

