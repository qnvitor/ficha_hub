// ========================================
// ATTRIBUTES COMPONENT
// Manages: All 6 attributes (Potência, Precisão, Agilidade, Resistência, Mente, Espírito)
// PAX System: Every 5 PAX = +3 BASE, TOTAL = BASE + MOD
// ========================================

import { emit, on } from '../utils/events.js';

class Attributes {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.attributes = ['pot', 'prec', 'agi', 'resist', 'mente', 'esp'];
        this.attributeNames = {
            pot: 'POTÊNCIA',
            prec: 'PRECISÃO',
            agi: 'AGILIDADE',
            resist: 'RESISTÊNCIA',
            mente: 'MENTE',
            esp: 'ESPÍRITO'
        };
        this.data = {};
        this.attributeLimit = 6; // Default limit for tier D
        this.initData();
        this.init();
    }

    initData() {
        this.attributes.forEach(attr => {
            this.data[attr] = { pax: 0, base: 0, mod: 0, total: 0 };
        });
    }

    init() {
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
    }

    subscribeToEvents() {
        // Listen for tier changes to update attribute limit
        on('tier:changed', (data) => {
            if (data.tierData && data.tierData.attributeLimit) {
                this.attributeLimit = data.tierData.attributeLimit;
                console.log(`Attribute limit set to ${this.attributeLimit}`);
            }
        });
    }

    render() {
        const rows = this.attributes.map(attr => `
            <div class="attr-row">
                <span class="attr-name">${this.attributeNames[attr]}</span>
                <input type="number" class="attr-pax" data-attr="${attr}" data-field="pax" value="${this.data[attr].pax}" min="0">
                <input type="number" class="attr-base" data-attr="${attr}" value="${this.data[attr].base}" readonly>
                <input type="number" class="attr-mod" data-attr="${attr}" data-field="mod" value="${this.data[attr].mod}">
                <input type="number" class="attr-total" data-attr="${attr}" value="${this.data[attr].total}" readonly>
            </div>
        `).join('');

        this.container.innerHTML = `
            <section class="section attributes">
                <h3>ATRIBUTOS</h3>
                <div class="attributes-table">
                    <div class="attr-header">
                        <span>ATRIBUTO</span>
                        <span>PAX</span>
                        <span>BASE</span>
                        <span>MOD</span>
                        <span>TOTAL</span>
                    </div>
                    ${rows}
                </div>
            </section>
        `;
    }

    attachListeners() {
        const inputs = this.container.querySelectorAll('input[data-attr]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                const attr = input.dataset.attr;
                const field = input.dataset.field;

                if (field) {
                    this.data[attr][field] = parseInt(input.value) || 0;
                    this.calculateAttribute(attr);
                }
            });
        });
    }

    calculateAttribute(attr) {
        const { pax, mod } = this.data[attr];

        // Calculate BASE from PAX: every 5 PAX = +3 BASE
        const base = Math.floor(pax / 5) * 3;
        this.data[attr].base = base;

        // Calculate TOTAL: BASE + MOD (PAX doesn't count directly)
        const total = base + mod;
        this.data[attr].total = total;

        // Update display
        const baseInput = this.container.querySelector(`input[data-attr="${attr}"].attr-base`);
        const totalInput = this.container.querySelector(`input[data-attr="${attr}"].attr-total`);

        if (baseInput) baseInput.value = base;
        if (totalInput) totalInput.value = total;

        // Emit specific events for attributes that affect other components
        emit('attribute:changed', { attribute: attr, value: total });

        if (attr === 'esp') {
            emit('spirit:changed', { value: total });
        }
        if (attr === 'prec') {
            emit('precision:changed', { value: total });
        }
        if (attr === 'resist') {
            emit('resistance:changed', { value: total });
        }

        // Emit event with PAX spent on attributes
        this.emitAttributesPax();
    }

    emitAttributesPax() {
        const totalPax = this.attributes.reduce((sum, attr) => sum + (this.data[attr].pax || 0), 0);
        emit('attributes:pax-updated', { paxGastos: totalPax });
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = { ...this.data, ...data };
        this.render();
        this.attachListeners();

        // Recalculate all attributes
        this.attributes.forEach(attr => this.calculateAttribute(attr));
    }
}

export default Attributes;
