// ========================================
// ATTRIBUTES COMPONENT
// Manages: 6 attributes (Força, Destreza, Vigor, Inteligência, Carisma, Aparência)
// Each attribute has: Valor Total and Foco (checkbox to select main divinity attribute)
// ========================================

import { emit } from '../utils/events.js';

class Attributes {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.attributes = ['forca', 'destreza', 'vigor', 'inteligencia', 'carisma', 'aparencia'];
        this.attributeNames = {
            forca: 'Força',
            destreza: 'Destreza',
            vigor: 'Vigor',
            inteligencia: 'Inteligência',
            carisma: 'Carisma',
            aparencia: 'Aparência'
        };
        this.data = {};
        this.initData();
        this.init();
    }

    initData() {
        this.attributes.forEach(attr => {
            this.data[attr] = { total: 0, foco: false };
        });
    }

    init() {
        this.render();
        this.attachListeners();
    }

    render() {
        const rows = this.attributes.map(attr => `
            <div class="attribute-block">
                <div class="attribute-row-header">
                    <label class="checkbox-label attribute-foco-checkbox">
                        <input type="radio" name="attribute-foco" class="attr-foco" data-attr="${attr}" 
                               ${this.data[attr].foco ? 'checked' : ''}>
                        <span class="checkbox-custom"></span>
                        <span class="foco-label">Foco</span>
                    </label>
                    <div class="attribute-name">${this.attributeNames[attr]}</div>
                </div>
                <div class="attribute-inputs">
                    <div class="input-group">
                        <label>Valor Total</label>
                        <input type="number" class="attr-total" data-attr="${attr}" 
                               value="${this.data[attr].total}" min="0">
                    </div>
                </div>
            </div>
        `).join('');

        this.container.innerHTML = `
            <section class="section attributes">
                <h3>ATRIBUTOS</h3>
                <div class="attributes-grid">
                    ${rows}
                </div>
            </section>
        `;
    }

    attachListeners() {
        // Total value inputs
        const inputs = this.container.querySelectorAll('input.attr-total');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleValueChange(e));
        });

        // Foco radio buttons (only one can be selected)
        const focoInputs = this.container.querySelectorAll('input.attr-foco');
        focoInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleFocoChange(e));
        });
    }

    handleValueChange(event) {
        const attr = event.target.dataset.attr;
        const value = parseInt(event.target.value) || 0;

        this.data[attr].total = value;
        emit('attributes:updated', this.data);
    }

    handleFocoChange(event) {
        const selectedAttr = event.target.dataset.attr;

        // Uncheck all attributes
        this.attributes.forEach(attr => {
            this.data[attr].foco = false;
        });

        // Check only the selected one
        this.data[selectedAttr].foco = true;

        // Update radio buttons visually
        const focoInputs = this.container.querySelectorAll('input.attr-foco');
        focoInputs.forEach(input => {
            input.checked = input.dataset.attr === selectedAttr;
        });

        emit('attributes:updated', this.data);
    }

    getData() {
        return { ...this.data };
    }

    setData(data) {
        if (data) {
            this.attributes.forEach(attr => {
                if (data[attr]) {
                    this.data[attr] = { 
                        total: data[attr].total || 0, 
                        foco: data[attr].foco || false 
                    };
                }
            });
            
            // Ensure only one foco is selected
            const focoCount = this.attributes.filter(attr => this.data[attr].foco).length;
            if (focoCount > 1) {
                // If multiple are selected, keep only the first one
                let firstFound = false;
                this.attributes.forEach(attr => {
                    if (this.data[attr].foco) {
                        if (firstFound) {
                            this.data[attr].foco = false;
                        } else {
                            firstFound = true;
                        }
                    }
                });
            }
        }
        this.render();
        this.attachListeners();
    }
}

export default Attributes;

