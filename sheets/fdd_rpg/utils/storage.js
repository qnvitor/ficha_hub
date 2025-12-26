// ========================================
// STORAGE UTILITIES
// LocalStorage management for character sheet
// ========================================

const STORAGE_KEY = 'fddRpgSheet';

/**
 * Save sheet data to localStorage
 * @param {Object} sheetData - Complete sheet data
 * @returns {boolean} Success status
 */
export function saveSheet(sheetData) {
    try {
        const jsonData = JSON.stringify(sheetData);
        localStorage.setItem(STORAGE_KEY, jsonData);
        return true;
    } catch (error) {
        console.error('Error saving sheet:', error);
        return false;
    }
}

/**
 * Load sheet data from localStorage
 * @returns {Object|null} Sheet data or null if not found
 */
export function loadSheet() {
    try {
        const jsonData = localStorage.getItem(STORAGE_KEY);
        if (jsonData) {
            return JSON.parse(jsonData);
        }
        return null;
    } catch (error) {
        console.error('Error loading sheet:', error);
        return null;
    }
}

/**
 * Clear sheet data from localStorage
 * @returns {boolean} Success status
 */
export function clearSheet() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing sheet:', error);
        return false;
    }
}

/**
 * Export sheet as JSON file
 * @param {Object} sheetData - Sheet data to export
 * @param {string} filename - Name of the file
 */
export function exportSheet(sheetData, filename = 'fdd-rpg-character.json') {
    try {
        const jsonData = JSON.stringify(sheetData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Error exporting sheet:', error);
        return false;
    }
}

/**
 * Import sheet from JSON file
 * @param {File} file - File to import
 * @returns {Promise<Object>} Parsed sheet data
 */
export function importSheet(file) {
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
export function hasSavedData() {
    return localStorage.getItem(STORAGE_KEY) !== null;
}

export default {
    saveSheet,
    loadSheet,
    clearSheet,
    exportSheet,
    importSheet,
    hasSavedData
};

