// ========================================
// COMBAT COMPONENT
// Manages: Attack, Defense, Damage, Determination, Conditions
// ========================================

import { emit, on } from '../utils/events.js';
import { calculatePenalty } from '../utils/calculations.js';

class Combat {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            // Attack
            atkTierBase: 0,
            atkPrec: 0,
            atkMod: 0,
            atkTotal: 0,

            // Defense
            defBase: 10,
            defResist: 0,
            defMod: 0,
            defTotal: 10,

            // Damage Reduction (fixed value, no calculation)
            rdTotal: 0,

            // Damage Die
            dadoDano: '-',

            // Determination
            detBase: 0,
            detEsp: 0,
            detComprado: 0,
            detTotal: 0,
            detAtual: 0,

            // Conditions
            conditions: {
                condCansado: false,
                condArranhado: false,
                condFerido: false,
                condGrave: false,
                condDerrotado: false
            },
            penaltyTotal: 0
        };
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="two-column">
                <!-- Determinação e Condições -->
                <section class="section determination">
                    <h3>DETERMINAÇÃO E CONDIÇÕES</h3>
                    <div class="det-grid">
                        <div class="form-group">
                            <label>DET. BASE (TIER)</label>
                            <input type="number" id="detBase" value="${this.data.detBase}" readonly>
                        </div>
                        <div class="form-group">
                            <label>ESPÍRITO</label>
                            <input type="number" id="detEsp" value="${this.data.detEsp}" readonly>
                        </div>
                        <div class="form-group">
                            <label>DET. COMPRADO</label>
                            <input type="number" id="detComprado" value="${this.data.detComprado}" min="0">
                        </div>
                        <div class="form-group highlight">
                            <label>DET. TOTAL</label>
                            <input type="number" id="detTotal" value="${this.data.detTotal}" readonly>
                        </div>
                        <div class="form-group current">
                            <label>DET. ATUAL</label>
                            <input type="number" id="detAtual" value="${this.data.detAtual}" min="0">
                        </div>
                    </div>

                    <div class="conditions">
                        <h4>CONDIÇÕES</h4>
                        <div class="condition-list">
                            <label class="condition-item">
                                <input type="checkbox" id="condCansado" ${this.data.conditions.condCansado ? 'checked' : ''}>
                                <span>CANSADO (0)</span>
                            </label>
                            <label class="condition-item">
                                <input type="checkbox" id="condArranhado" ${this.data.conditions.condArranhado ? 'checked' : ''}>
                                <span>ARRANHADO (-1)</span>
                            </label>
                            <label class="condition-item">
                                <input type="checkbox" id="condFerido" ${this.data.conditions.condFerido ? 'checked' : ''}>
                                <span>FERIDO (-2)</span>
                            </label>
                            <label class="condition-item">
                                <input type="checkbox" id="condGrave" ${this.data.conditions.condGrave ? 'checked' : ''}>
                                <span>GRAVEMENTE FERIDO (-4)</span>
                            </label>
                            <label class="condition-item">
                                <input type="checkbox" id="condDerrotado" ${this.data.conditions.condDerrotado ? 'checked' : ''}>
                                <span>DERROTADO</span>
                            </label>
                        </div>
                        <div class="penalty-display">
                            <strong>PENALIDADE TOTAL:</strong> <span id="penaltyTotal">${this.data.penaltyTotal}</span>
                        </div>
                    </div>
                </section>

                <!-- Combate -->
                <section class="section combat">
                    <h3>COMBATE</h3>
                    <div class="combat-grid">
                        <div class="form-group">
                            <label>BÔNUS BASE (TIER)</label>
                            <input type="number" id="atkTierBase" value="${this.data.atkTierBase}" readonly>
                        </div>
                        <div class="form-group">
                            <label>PRECISÃO</label>
                            <input type="number" id="atkPrec" value="${this.data.atkPrec}" readonly>
                        </div>
                        <div class="form-group">
                            <label>MOD ATAQUE</label>
                            <input type="number" id="atkMod" value="${this.data.atkMod}">
                        </div>
                        <div class="form-group highlight">
                            <label>BÔNUS DE ATAQUE</label>
                            <input type="number" id="atkTotal" value="${this.data.atkTotal}" readonly>
                        </div>

                        <div class="form-group full-width">
                            <label>DADO DE DANO</label>
                            <input type="text" id="dadoDano" value="${this.data.dadoDano}" readonly>
                        </div>

                        <div class="form-group">
                            <label>BASE DEFESA</label>
                            <input type="number" id="defBase" value="${this.data.defBase}">
                        </div>
                        <div class="form-group">
                            <label>RESISTÊNCIA</label>
                            <input type="number" id="defResist" value="${this.data.defResist}" readonly>
                        </div>
                        <div class="form-group">
                            <label>MOD DEFESA</label>
                            <input type="number" id="defMod" value="${this.data.defMod}">
                        </div>
                        <div class="form-group highlight">
                            <label>DEFESA TOTAL</label>
                            <input type="number" id="defTotal" value="${this.data.defTotal}" readonly>
                        </div>

                        <div class="form-group full-width">
                            <label>REDUÇÃO DE DANO</label>
                            <input type="number" id="rdTotal" value="${this.data.rdTotal}" min="0">
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    attachListeners() {
        // Combat modifiers
        ['atkMod', 'defBase', 'defMod', 'rdTotal'].forEach(id => {
            const input = this.container.querySelector(`#${id}`);
            if (input) {
                input.addEventListener('input', () => {
                    this.data[id] = parseInt(input.value) || 0;
                    this.calculateCombat();
                });
            }
        });

        // Determination
        const detComprado = this.container.querySelector('#detComprado');
        const detAtual = this.container.querySelector('#detAtual');

        if (detComprado) {
            detComprado.addEventListener('input', () => {
                this.data.detComprado = parseInt(detComprado.value) || 0;
                this.calculateDetermination();
                // Emit event for PAX tracking (2 PAX per DET point)
                emit('determination:purchased', { detComprado: this.data.detComprado });
            });
        }

        if (detAtual) {
            detAtual.addEventListener('input', () => {
                this.data.detAtual = parseInt(detAtual.value) || 0;
                emit('determination:changed', this.data);
            });
        }

        // Conditions
        Object.keys(this.data.conditions).forEach(condId => {
            const checkbox = this.container.querySelector(`#${condId}`);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.data.conditions[condId] = checkbox.checked;
                    this.calculatePenalties();
                });
            }
        });
    }

    subscribeToEvents() {
        on('tier:changed', (data) => {
            if (data.tierData) {
                this.data.atkTierBase = data.tierData.baseAtk;
                this.data.detBase = data.tierData.baseDet;
                this.data.dadoDano = data.tierData.dadoDano;
                this.data.defBase = data.tierData.defBase;
                this.updateDisplay();
                this.calculateCombat();
                this.calculateDetermination();
            }
        });

        on('precision:changed', (data) => {
            this.data.atkPrec = data.value;
            this.updateDisplay();
            this.calculateCombat();
        });

        on('resistance:changed', (data) => {
            this.data.defResist = data.value;
            this.updateDisplay();
            this.calculateCombat();
        });

        on('spirit:changed', (data) => {
            this.data.detEsp = data.value;
            this.updateDisplay();
            this.calculateDetermination();
        });
    }

    calculateCombat() {
        // Attack
        this.data.atkTotal = this.data.atkTierBase + this.data.atkPrec + this.data.atkMod;

        // Defense
        this.data.defTotal = this.data.defBase + this.data.defResist + this.data.defMod;

        // RD is a fixed value, no calculation needed

        this.updateDisplay();
        emit('combat:updated', this.data);
    }

    calculateDetermination() {
        this.data.detTotal = this.data.detBase + this.data.detEsp + this.data.detComprado;

        // Auto-update current if not set or exceeds total
        if (this.data.detAtual === 0 || this.data.detAtual > this.data.detTotal) {
            this.data.detAtual = this.data.detTotal;
        }

        this.updateDisplay();
        emit('determination:changed', this.data);
    }

    calculatePenalties() {
        const conditionsArray = [
            { id: 'condArranhado', value: -1 },
            { id: 'condFerido', value: -2 },
            { id: 'condGrave', value: -4 },
            { id: 'condDerrotado', value: -999 }
        ];

        this.data.penaltyTotal = calculatePenalty(this.data.conditions, conditionsArray);

        const penaltySpan = this.container.querySelector('#penaltyTotal');
        if (penaltySpan) {
            penaltySpan.textContent = this.data.penaltyTotal;
        }

        emit('conditions:changed', { conditions: this.data.conditions, penalty: this.data.penaltyTotal });
    }

    updateDisplay() {
        // Update all readonly fields
        const fields = ['atkTierBase', 'atkPrec', 'atkTotal', 'defResist', 'defTotal',
            'rdTotal', 'detBase', 'detEsp', 'detTotal', 'detAtual', 'dadoDano'];

        fields.forEach(field => {
            const input = this.container.querySelector(`#${field}`);
            if (input) {
                input.value = this.data[field];
            }
        });
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = { ...this.data, ...data };
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
    }
}

export default Combat;
