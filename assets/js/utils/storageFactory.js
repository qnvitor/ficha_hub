// ========================================
// STORAGE FACTORY
// Creates storage utilities with a unique storage key
// Eliminates code duplication across RPG sheets
// ========================================

/**
 * Creates storage utilities for a specific RPG sheet
 * @param {string} storageKey - Unique key for localStorage (e.g., 'jluRpgSheet', 'fddRpgSheet')
 * @param {string} defaultFilename - Default filename for exports (e.g., 'jlu-character.json')
 * @returns {Object} Storage utilities object
 */
export function createStorage(storageKey, defaultFilename = 'character.json') {
    if (!storageKey) {
        throw new Error('Storage key is required');
    }

    /**
     * Save sheet data to localStorage
     * @param {Object} sheetData - Complete sheet data
     * @returns {boolean} Success status
     */
    function saveSheet(sheetData) {
        try {
            const jsonData = JSON.stringify(sheetData);
            localStorage.setItem(storageKey, jsonData);
            return true;
        } catch (error) {
            console.error(`Error saving sheet (${storageKey}):`, error);
            return false;
        }
    }

    /**
     * Load sheet data from localStorage
     * @returns {Object|null} Sheet data or null if not found
     */
    function loadSheet() {
        try {
            const jsonData = localStorage.getItem(storageKey);
            if (jsonData) {
                return JSON.parse(jsonData);
            }
            return null;
        } catch (error) {
            console.error(`Error loading sheet (${storageKey}):`, error);
            return null;
        }
    }

    /**
     * Clear sheet data from localStorage
     * @returns {boolean} Success status
     */
    function clearSheet() {
        try {
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error(`Error clearing sheet (${storageKey}):`, error);
            return false;
        }
    }

    /**
     * Export sheet as JSON file
     * @param {Object} sheetData - Sheet data to export
     * @param {string} filename - Name of the file (optional, uses defaultFilename if not provided)
     */
    function exportSheet(sheetData, filename = null) {
        try {
            const jsonData = JSON.stringify(sheetData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename || defaultFilename;
            a.click();

            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error(`Error exporting sheet (${storageKey}):`, error);
            return false;
        }
    }

    /**
     * Import sheet from JSON file
     * @param {File} file - File to import
     * @returns {Promise<Object>} Parsed sheet data
     */
    function importSheet(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Check if there is saved data
     * @returns {boolean} True if data exists
     */
    function hasSavedData() {
        return localStorage.getItem(storageKey) !== null;
    }

    return {
        saveSheet,
        loadSheet,
        clearSheet,
        exportSheet,
        importSheet,
        hasSavedData
    };
}

export default createStorage;

