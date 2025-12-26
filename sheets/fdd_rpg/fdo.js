// ========================================
// FDD RPG SHEET - MAIN ORCHESTRATOR
// Coordinates all components and manages global state
// ========================================

import HeaderIdentity from './components/HeaderIdentity.js';
import Attributes from './components/Attributes.js';
import Vitals from './components/Vitals.js';
import Skills from './components/Skills.js';
import CombatStatus from './components/CombatStatus.js';
import HumanitySystem from './components/HumanitySystem.js';
import CharacterImage from './components/CharacterImage.js';
import Inventory from './components/Inventory.js';
import Powers from './components/Powers.js';

import { createStorage } from '../../assets/js/utils/storageFactory.js';
import { on } from './utils/events.js';
import { initFAB } from '../../assets/js/fab.js';
import { showSuccess, showError } from '../../assets/js/components/Notification.js';

// Create storage instance for FDD RPG
const storage = createStorage('fddRpgSheet', 'fdd-rpg-character.json');

class FDDRpgSheet {
    constructor() {
        this.components = {};
        this.autoSaveTimeout = null;
        this.init();
    }

    init() {
        console.log('Initializing FDD RPG Sheet...');
        this.initializeComponents();
        this.initFAB();
        this.setupAutoSave();
        this.setupCalculations();
        this.loadSheet();
        console.log('FDD RPG Sheet initialized successfully!');
    }

    setupCalculations() {
        // Setup automatic calculations for Vitals and Inventory components
        // This will be called after components are initialized and when data changes
        const updateCalculations = () => {
            if (this.components.attributes && this.components.headerIdentity) {
                const attributesData = this.components.attributes.getData();
                const identityData = this.components.headerIdentity.getData();
                
                // Update Vitals calculations
                if (this.components.vitals) {
                    this.components.vitals.setCalculationData(attributesData, identityData);
                }
                
                // Update Inventory calculations
                if (this.components.inventory) {
                    this.components.inventory.setCalculationData(attributesData, identityData);
                }
            }
        };

        // Initial calculation after a short delay to ensure all components are ready
        setTimeout(updateCalculations, 200);

        // Recalculate when attributes or identity change
        on('attributes:updated', () => {
            updateCalculations();
        });

        on('identity:updated', () => {
            updateCalculations();
        });
    }

    initializeComponents() {
        try {
            this.components.headerIdentity = new HeaderIdentity('header-identity-container');
            console.log('✓ HeaderIdentity initialized');
        } catch (error) {
            console.error('✗ HeaderIdentity failed:', error);
        }

        try {
            this.components.attributes = new Attributes('attributes-container');
            console.log('✓ Attributes initialized');
        } catch (error) {
            console.error('✗ Attributes failed:', error);
        }

        try {
            this.components.vitals = new Vitals('vitals-container');
            console.log('✓ Vitals initialized');
        } catch (error) {
            console.error('✗ Vitals failed:', error);
        }

        try {
            this.components.skills = new Skills('skills-container');
            console.log('✓ Skills initialized');
        } catch (error) {
            console.error('✗ Skills failed:', error);
        }

        try {
            this.components.combatStatus = new CombatStatus('combat-status-container');
            console.log('✓ CombatStatus initialized');
        } catch (error) {
            console.error('✗ CombatStatus failed:', error);
        }

        try {
            this.components.humanitySystem = new HumanitySystem('humanity-system-container');
            console.log('✓ HumanitySystem initialized');
        } catch (error) {
            console.error('✗ HumanitySystem failed:', error);
        }

        try {
            this.components.characterImage = new CharacterImage('character-image-container');
            console.log('✓ CharacterImage initialized');
        } catch (error) {
            console.error('✗ CharacterImage failed:', error);
        }

        try {
            this.components.inventory = new Inventory('inventory-container');
            console.log('✓ Inventory initialized');
        } catch (error) {
            console.error('✗ Inventory failed:', error);
        }

        try {
            this.components.powers = new Powers('powers-container');
            console.log('✓ Powers initialized');
        } catch (error) {
            console.error('✗ Powers failed:', error);
        }

        console.log('Component initialization complete');
    }

    initFAB() {
        initFAB({
            onSave: () => this.saveSheet(),
            onPrint: () => this.printSheet(),
            onExport: () => this.exportSheet(),
            onImport: async (file) => {
                try {
                    const sheetData = await storage.importSheet(file);
                    Object.keys(this.components).forEach(key => {
                        if (sheetData[key]) {
                            this.components[key].setData(sheetData[key]);
                        }
                    });
                    storage.saveSheet(sheetData);
                    showSuccess('📥 Ficha importada com sucesso!');
                } catch (error) {
                    console.error('Import error:', error);
                    showError('❌ Erro ao importar ficha');
                }
            },
            onClear: () => this.confirmClearSheet()
        });
        console.log('FAB initialized');
    }

    setupAutoSave() {
        const autoSaveEvents = [
            'identity:updated',
            'attributes:updated',
            'vitals:updated',
            'skills:updated',
            'combat-status:updated',
            'humanity:updated',
            'image:updated',
            'inventory:updated',
            'powers:updated'
        ];

        autoSaveEvents.forEach(eventName => {
            on(eventName, () => this.scheduleAutoSave());
        });

        console.log('Auto-save configured');
    }

    scheduleAutoSave() {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveSheet(true);
        }, 1000);
    }

    saveSheet(silent = false) {
        const sheetData = {};

        Object.keys(this.components).forEach(key => {
            sheetData[key] = this.components[key].getData();
        });

        const success = storage.saveSheet(sheetData);

        if (!silent) {
            if (success) {
                showSuccess('✅ Ficha salva com sucesso!');
            } else {
                showError('❌ Erro ao salvar ficha');
            }
        }

        return success;
    }

    loadSheet() {
        const sheetData = storage.loadSheet();

        if (!sheetData) {
            console.log('No saved data found');
            return false;
        }

        Object.keys(this.components).forEach(key => {
            if (sheetData[key]) {
                this.components[key].setData(sheetData[key]);
            }
        });

        // Calculations will be triggered automatically by the event listeners
        // when components emit their update events after setData
        showSuccess('📂 Ficha carregada!');
        return true;
    }

    printSheet() {
        this.saveSheet(true);

        const fabMenu = document.getElementById('fabMenu');
        const fabToggle = document.getElementById('fabToggle');
        if (fabMenu) fabMenu.classList.remove('active');
        if (fabToggle) fabToggle.classList.remove('active');

        const allInputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        const placeholders = [];

        allInputs.forEach((input, index) => {
            placeholders[index] = input.placeholder;
            input.placeholder = '';
        });

        const allTextareas = document.querySelectorAll('textarea');
        const originalHeights = [];
        
        allTextareas.forEach((textarea, index) => {
            originalHeights[index] = {
                element: textarea,
                height: textarea.style.height,
                rows: textarea.rows
            };
            
            textarea.style.height = 'auto';
            textarea.style.overflow = 'visible';
            
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = scrollHeight + 'px';
            
            textarea.style.overflowY = 'visible';
            textarea.style.overflowX = 'visible';
        });

        window.addEventListener('beforeprint', () => {
            allTextareas.forEach((textarea) => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
                textarea.style.overflow = 'visible';
                textarea.style.overflowY = 'visible';
            });
            
            // Garantir que os valores do inventário sejam atualizados antes da impressão
            if (this.components.inventory) {
                this.components.inventory.updateStats();
            }
            
            // Garantir que os valores sejam visíveis
            const pesoAtual = document.getElementById('pesoAtual');
            const pesoMaximo = document.getElementById('pesoMaximo');
            const espacoAtual = document.getElementById('espacoAtual');
            
            if (pesoAtual) {
                pesoAtual.style.display = 'inline-block';
                pesoAtual.style.visibility = 'visible';
                pesoAtual.style.opacity = '1';
            }
            if (pesoMaximo) {
                pesoMaximo.style.display = 'inline-block';
                pesoMaximo.style.visibility = 'visible';
                pesoMaximo.style.opacity = '1';
            }
            if (espacoAtual) {
                espacoAtual.style.display = 'inline-block';
                espacoAtual.style.visibility = 'visible';
                espacoAtual.style.opacity = '1';
            }
        }, { once: true });

        window.print();

        setTimeout(() => {
            allInputs.forEach((input, index) => {
                input.placeholder = placeholders[index];
            });
            
            originalHeights.forEach(({ element, height, rows }) => {
                element.style.height = height || '';
                if (rows !== undefined) element.rows = rows;
            });
        }, 100);
    }

    confirmClearSheet() {
        const confirmed = confirm('⚠️ Tem certeza que deseja limpar toda a ficha? Esta ação não pode ser desfeita!');

        if (confirmed) {
            storage.clearSheet();
            location.reload();
        }
    }

    exportSheet() {
        const sheetData = {};

        Object.keys(this.components).forEach(key => {
            sheetData[key] = this.components[key].getData();
        });

        const characterName = sheetData.headerIdentity?.characterName || 'personagem';
        const filename = `${characterName.replace(/\s+/g, '-').toLowerCase()}-fdd-rpg.json`;

        const success = storage.exportSheet(sheetData, filename);

        if (success) {
            showSuccess('💾 Ficha exportada!');
        } else {
            showError('❌ Erro ao exportar ficha');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.fddRpgSheet = new FDDRpgSheet();
});

// CSS animations are now handled by Notification component

