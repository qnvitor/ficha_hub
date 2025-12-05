// ========================================
// JLU SHEET - MAIN ORCHESTRATOR
// Coordinates all components and manages global state
// ========================================

import CharacterInfo from './components/CharacterInfo.js';
import Attributes from './components/Attributes.js';
import Combat from './components/Combat.js';
import Capabilities from './components/Capabilities.js';
import Limitations from './components/Limitations.js';
import Knowledge from './components/Knowledge.js';

import { saveSheet, loadSheet, clearSheet, exportSheet, importSheet } from './utils/storage.js';
import { on } from './utils/events.js';

class JLUSheet {
    constructor() {
        this.components = {};
        this.autoSaveTimeout = null;
        this.init();
    }

    init() {
        console.log('Initializing JLU Sheet...');
        this.initializeComponents();
        this.attachGlobalListeners();
        this.setupAutoSave();
        this.loadSheet();
        console.log('JLU Sheet initialized successfully!');
    }

    initializeComponents() {
        // Initialize all components with error handling
        try {
            this.components.characterInfo = new CharacterInfo('character-info-container');
            console.log('✓ CharacterInfo initialized');
        } catch (error) {
            console.error('✗ CharacterInfo failed:', error);
        }

        try {
            this.components.attributes = new Attributes('attributes-container');
            console.log('✓ Attributes initialized');
        } catch (error) {
            console.error('✗ Attributes failed:', error);
        }

        try {
            this.components.combat = new Combat('combat-container');
            console.log('✓ Combat initialized');
        } catch (error) {
            console.error('✗ Combat failed:', error);
        }

        try {
            this.components.limitations = new Limitations('limitations-container');
            console.log('✓ Limitations initialized');
        } catch (error) {
            console.error('✗ Limitations failed:', error);
        }

        try {
            this.components.knowledge = new Knowledge('knowledge-container');
            console.log('✓ Knowledge initialized');
        } catch (error) {
            console.error('✗ Knowledge failed:', error);
        }

        try {
            this.components.capabilities = new Capabilities('capabilities-container');
            console.log('✓ Capabilities initialized');
        } catch (error) {
            console.error('✗ Capabilities failed:', error);
        }

        console.log('Component initialization complete');
    }

    attachGlobalListeners() {
        // Save button
        const saveBtn = document.getElementById('saveSheet');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSheet());
        }

        // Print button (Save as PDF)
        const printBtn = document.getElementById('printSheet');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printSheet());
        }

        // Clear button
        const clearBtn = document.getElementById('clearSheet');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.confirmClearSheet());
        }

        // Export button
        const exportBtn = document.getElementById('exportSheet');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSheet());
        }

        // Import file input
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => this.handleImport(e));
        }

        // FAB Toggle
        const fabToggle = document.getElementById('fabToggle');
        const fabMenu = document.getElementById('fabMenu');
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

        console.log('Global listeners attached');
    }

    setupAutoSave() {
        // Listen to all update events and trigger auto-save
        const autoSaveEvents = [
            'character:updated',
            'attribute:changed',
            'combat:updated',
            'determination:changed',
            'conditions:changed',
            'capability:updated',
            'limitations:updated',
            'traits:updated',
            'knowledge:updated'
        ];

        autoSaveEvents.forEach(eventName => {
            on(eventName, () => this.scheduleAutoSave());
        });

        console.log('Auto-save configured');
    }

    scheduleAutoSave() {
        // Debounce auto-save to avoid excessive saves
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveSheet(true); // Silent save
        }, 1000);
    }

    saveSheet(silent = false) {
        const sheetData = {};

        // Collect data from all components
        Object.keys(this.components).forEach(key => {
            sheetData[key] = this.components[key].getData();
        });

        const success = saveSheet(sheetData);

        if (!silent) {
            if (success) {
                this.showNotification('✅ Ficha salva com sucesso!', 'success');
            } else {
                this.showNotification('❌ Erro ao salvar ficha', 'error');
            }
        }

        return success;
    }

    loadSheet() {
        const sheetData = loadSheet();

        if (!sheetData) {
            console.log('No saved data found');
            return false;
        }

        // Load data into all components
        Object.keys(this.components).forEach(key => {
            if (sheetData[key]) {
                this.components[key].setData(sheetData[key]);
            }
        });

        this.showNotification('📂 Ficha carregada!', 'success');
        return true;
    }

    printSheet() {
        // Auto-save before printing
        this.saveSheet(true);

        // Close FAB menu
        const fabMenu = document.getElementById('fabMenu');
        const fabToggle = document.getElementById('fabToggle');
        if (fabMenu) fabMenu.classList.remove('active');
        if (fabToggle) fabToggle.classList.remove('active');

        // Remove all placeholders temporarily for printing
        const allInputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        const placeholders = [];

        allInputs.forEach((input, index) => {
            placeholders[index] = input.placeholder;
            input.placeholder = '';
        });

        // Trigger browser print dialog
        window.print();

        // Restore placeholders after print dialog closes
        setTimeout(() => {
            allInputs.forEach((input, index) => {
                input.placeholder = placeholders[index];
            });
        }, 100);
    }

    confirmClearSheet() {
        const confirmed = confirm('⚠️ Tem certeza que deseja limpar toda a ficha? Esta ação não pode ser desfeita!');

        if (confirmed) {
            clearSheet();
            location.reload();
        }
    }

    exportSheet() {
        const sheetData = {};

        // Collect data from all components
        Object.keys(this.components).forEach(key => {
            sheetData[key] = this.components[key].getData();
        });

        const heroName = sheetData.characterInfo?.heroName || 'personagem';
        const filename = `${heroName.replace(/\s+/g, '-').toLowerCase()}-jlu.json`;

        const success = exportSheet(sheetData, filename);

        if (success) {
            this.showNotification('💾 Ficha exportada!', 'success');
        } else {
            this.showNotification('❌ Erro ao exportar ficha', 'error');
        }
    }

    async handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const sheetData = await importSheet(file);

            // Load imported data into components
            Object.keys(this.components).forEach(key => {
                if (sheetData[key]) {
                    this.components[key].setData(sheetData[key]);
                }
            });

            // Save to localStorage
            saveSheet(sheetData);

            this.showNotification('📥 Ficha importada com sucesso!', 'success');
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('❌ Erro ao importar ficha', 'error');
        }

        // Reset file input
        event.target.value = '';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 6px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.jluSheet = new JLUSheet();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
