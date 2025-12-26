// ========================================
// VITALS COMPONENT
// Manages: Vida (Max/Atual/Temp), Estamina (Max/Atual/Temp), Redução de Dano, Áspis
// Auto-calculates: vidaMax, estaminaMax, aspis
// ========================================

import { emit, on } from '../utils/events.js';

class Vitals {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            vidaMax: 0,
            vidaAtual: 0,
            vidaTemp: 0,
            estaminaMax: 0,
            estaminaAtual: 0,
            estaminaTemp: 0,
            reducaoDano: 0,
            aspis: 0
        };
        // Store references to other components' data for calculations
        this.attributesData = null;
        this.identityData = null;
        // Flags to track if user manually edited vidaMax and estaminaMax
        this.vidaMaxManuallyEdited = false;
        this.estaminaMaxManuallyEdited = false;
        this.init();
    }

    // Benefícios de cada tipo de armamento
    static getArmamentoBonuses(armamentoName) {
        const bonuses = {
            'Espadachim': {
                vidaBonus: 5,
                estaminaBonus: 4
            },
            'Atirador': {
                vidaBonus: 3,
                estaminaBonus: 6
            },
            'Lutador': {
                vidaBonus: 8,
                estaminaBonus: 2
            }
        };
        return bonuses[armamentoName] || { vidaBonus: 0, estaminaBonus: 0 };
    }

    // Benefícios de cada deus do Olimpo (Semideus)
    static getSemideusBonuses(semideusName) {
        const bonuses = {
            'Zeus': {
                vidaBonus: 14,
                estaminaBonus: 15
            },
            'Hera': {
                vidaBonus: 0,
                estaminaBonus: 0
            },
            'Poseidon': {
                vidaBonus: 6,
                estaminaBonus: 25
            },
            'Hades': {
                vidaBonus: 4,
                estaminaBonus: 35
            },
            'Deméter': {
                vidaBonus: 8,
                estaminaBonus: 25
            },
            'Atena': {
                vidaBonus: 7,
                estaminaBonus: 14
            },
            'Apolo': {
                vidaBonus: 7,
                estaminaBonus: 20
            },
            'Ártemis': {
                vidaBonus: 0,
                estaminaBonus: 0
            },
            'Ares': {
                vidaBonus: 18,
                estaminaBonus: 10
            },
            'Afrodite': {
                vidaBonus: 5,
                estaminaBonus: 30
            },
            'Hefesto': {
                vidaBonus: 10,
                estaminaBonus: 25
            },
            'Hermes': {
                vidaBonus: 4,
                estaminaBonus: 30
            },
            'Dionísio': {
                vidaBonus: 7,
                estaminaBonus: 20
            },
            'Nike': {
                vidaBonus: 8,
                estaminaBonus: 30
            },
            'Hecate': {
                vidaBonus: 5,
                estaminaBonus: 35
            },
            'Nyx': {
                vidaBonus: 8,
                estaminaBonus: 20
            },
            'Nemesis': {
                vidaBonus: 6,
                estaminaBonus: 15
            },
            'Thanatos': {
                vidaBonus: 8,
                estaminaBonus: 30
            }
        };
        return bonuses[semideusName] || { vidaBonus: 0, estaminaBonus: 0 };
    }

    init() {
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
    }

    subscribeToEvents() {
        // Listen to attributes changes to recalculate vitals
        on('attributes:updated', (data) => {
            this.attributesData = data;
            this.recalculateVitals();
        });

        // Listen to identity changes (for semideusTitle and armamentoName to get bonuses)
        on('identity:updated', (data) => {
            this.identityData = data;
            this.recalculateVitals();
        });
    }

    recalculateVitals() {
        if (!this.attributesData || !this.identityData) {
            // Wait for both components to be initialized
            return;
        }

        const vigor = parseInt(this.attributesData.vigor?.total) || 0;
        const destreza = parseInt(this.attributesData.destreza?.total) || 0;
        const semideusName = this.identityData.semideusTitle || '';
        const armamentoName = this.identityData.armamentoName || '';

        // Get armamento bonuses
        const armamentoBonuses = Vitals.getArmamentoBonuses(armamentoName);
        // Get semideus (deus) bonuses
        const semideusBonuses = Vitals.getSemideusBonuses(semideusName);

        // Find the attribute marked as foco
        let focoValue = 0;
        const attributes = ['forca', 'destreza', 'vigor', 'inteligencia', 'carisma', 'aparencia'];
        for (const attr of attributes) {
            if (this.attributesData[attr]?.foco === true) {
                focoValue = parseInt(this.attributesData[attr]?.total) || 0;
                break;
            }
        }

        // Calculate Vida Máxima: Vigor * 2 + Bônus do Armamento + Bônus do Deus
        const vidaMaxCalculada = (vigor * 2) + armamentoBonuses.vidaBonus + semideusBonuses.vidaBonus;
        
        // Calculate Estamina Máxima: Destreza * Vigor + Bônus do Armamento + Bônus do Deus
        const estaminaMaxCalculada = (destreza * vigor) + armamentoBonuses.estaminaBonus + semideusBonuses.estaminaBonus;
        
        // Calculate Áspis: 10 + Foco (value of the attribute marked as foco)
        const aspisCalculada = 10 + focoValue;

        // Update calculated values
        // Preserve manually edited values for vidaMax and estaminaMax
        if (!this.vidaMaxManuallyEdited) {
            this.data.vidaMax = vidaMaxCalculada;
        }
        if (!this.estaminaMaxManuallyEdited) {
            this.data.estaminaMax = estaminaMaxCalculada;
        }
        // Áspis is always calculated (readonly)
        this.data.aspis = aspisCalculada;

        // Update UI without triggering change event
        this.updateCalculatedFields();
        
        // Emit update event
        emit('vitals:updated', this.data);
    }

    updateCalculatedFields() {
        const vidaMaxInput = this.container.querySelector('#vidaMax');
        const estaminaMaxInput = this.container.querySelector('#estaminaMax');
        const aspisInput = this.container.querySelector('#aspis');

        if (vidaMaxInput) vidaMaxInput.value = this.data.vidaMax;
        if (estaminaMaxInput) estaminaMaxInput.value = this.data.estaminaMax;
        if (aspisInput) aspisInput.value = this.data.aspis;
    }

    render() {
        this.container.innerHTML = `
            <section class="section vitals">
                <h3>STATUS VITAIS</h3>
                <div class="vitals-grid">
                    <div class="vital-group">
                        <label>Vida</label>
                        <div class="triple-input">
                            <div class="input-group">
                                <label>Máx</label>
                                <input type="number" id="vidaMax" class="form-input" 
                                       value="${this.data.vidaMax}" min="0">
                            </div>
                            <div class="input-group">
                                <label>Atual</label>
                                <input type="number" id="vidaAtual" class="form-input" 
                                       value="${this.data.vidaAtual}" min="0">
                            </div>
                            <div class="input-group">
                                <label>Temp</label>
                                <input type="number" id="vidaTemp" class="form-input" 
                                       value="${this.data.vidaTemp}" min="0">
                            </div>
                        </div>
                    </div>
                    
                    <div class="vital-group">
                        <label>Estamina</label>
                        <div class="triple-input">
                            <div class="input-group">
                                <label>Máx</label>
                                <input type="number" id="estaminaMax" class="form-input" 
                                       value="${this.data.estaminaMax}" min="0">
                            </div>
                            <div class="input-group">
                                <label>Atual</label>
                                <input type="number" id="estaminaAtual" class="form-input" 
                                       value="${this.data.estaminaAtual}" min="0">
                            </div>
                            <div class="input-group">
                                <label>Temp</label>
                                <input type="number" id="estaminaTemp" class="form-input" 
                                       value="${this.data.estaminaTemp}" min="0">
                            </div>
                        </div>
                    </div>
                    
                    <div class="vital-group">
                        <label for="reducaoDano">Redução de Dano</label>
                        <input type="number" id="reducaoDano" class="form-input" 
                               value="${this.data.reducaoDano}" min="0">
                    </div>
                    
                    <div class="vital-group">
                        <label for="aspis">Áspis</label>
                        <input type="number" id="aspis" class="form-input" 
                               value="${this.data.aspis}" min="0" readonly>
                    </div>
                </div>
            </section>
        `;
    }

    attachListeners() {
        // Attach listeners to all inputs except aspis (which remains readonly/calculated)
        const inputs = this.container.querySelectorAll('input:not([readonly])');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleChange(e));
        });
    }

    handleChange(event) {
        const field = event.target.id;
        const value = parseInt(event.target.value) || 0;

        // Don't update aspis manually (it's still calculated)
        if (field === 'aspis') {
            return;
        }

        // Mark vidaMax and estaminaMax as manually edited if user changes them
        if (field === 'vidaMax') {
            this.vidaMaxManuallyEdited = true;
        }
        if (field === 'estaminaMax') {
            this.estaminaMaxManuallyEdited = true;
        }

        // Update field value (including vidaMax and estaminaMax which are now editable)
        this.data[field] = value;
        emit('vitals:updated', this.data);
    }

    getData() {
        return { ...this.data };
    }

    setData(data) {
        // Store the loaded values before any recalculation
        const loadedVidaMax = data?.vidaMax;
        const loadedEstaminaMax = data?.estaminaMax;
        
        // Preserve calculated values if they're being set (from load)
        this.data = { ...this.data, ...data };
        this.render();
        this.attachListeners();
        
        // After setting data, calculate what the values should be
        // Then compare with loaded values to determine if they were manually edited
        setTimeout(() => {
            // Calculate expected values if we have the necessary data
            if (this.attributesData && this.identityData) {
                const vigor = parseInt(this.attributesData.vigor?.total) || 0;
                const destreza = parseInt(this.attributesData.destreza?.total) || 0;
                const semideusName = this.identityData.semideusTitle || '';
                const armamentoName = this.identityData.armamentoName || '';
                
                const armamentoBonuses = Vitals.getArmamentoBonuses(armamentoName);
                const semideusBonuses = Vitals.getSemideusBonuses(semideusName);
                
                const vidaMaxCalculada = (vigor * 2) + armamentoBonuses.vidaBonus + semideusBonuses.vidaBonus;
                const estaminaMaxCalculada = (destreza * vigor) + armamentoBonuses.estaminaBonus + semideusBonuses.estaminaBonus;
                
                // If loaded values differ from calculated, they were manually edited
                if (loadedVidaMax !== undefined && loadedVidaMax !== vidaMaxCalculada) {
                    this.vidaMaxManuallyEdited = true;
                    this.data.vidaMax = loadedVidaMax; // Restore loaded value
                }
                if (loadedEstaminaMax !== undefined && loadedEstaminaMax !== estaminaMaxCalculada) {
                    this.estaminaMaxManuallyEdited = true;
                    this.data.estaminaMax = loadedEstaminaMax; // Restore loaded value
                }
            }
            
            // Now recalculate (will preserve manually edited values)
            this.recalculateVitals();
        }, 100);
    }

    // Method to be called from orchestrator to pass other components' data
    setCalculationData(attributesData, identityData) {
        this.attributesData = attributesData;
        this.identityData = identityData;
        
        // If we have loaded data, check if vidaMax and estaminaMax differ from calculated values
        // This handles the case where data was loaded before attributes/identity were available
        if (this.data && (this.data.vidaMax !== undefined || this.data.estaminaMax !== undefined)) {
            const vigor = parseInt(attributesData.vigor?.total) || 0;
            const destreza = parseInt(attributesData.destreza?.total) || 0;
            const semideusName = identityData.semideusTitle || '';
            const armamentoName = identityData.armamentoName || '';
            
            const armamentoBonuses = Vitals.getArmamentoBonuses(armamentoName);
            const semideusBonuses = Vitals.getSemideusBonuses(semideusName);
            
            const vidaMaxCalculada = (vigor * 2) + armamentoBonuses.vidaBonus + semideusBonuses.vidaBonus;
            const estaminaMaxCalculada = (destreza * vigor) + armamentoBonuses.estaminaBonus + semideusBonuses.estaminaBonus;
            
            // If current values differ from calculated, they were manually edited
            if (this.data.vidaMax !== vidaMaxCalculada) {
                this.vidaMaxManuallyEdited = true;
            }
            if (this.data.estaminaMax !== estaminaMaxCalculada) {
                this.estaminaMaxManuallyEdited = true;
            }
        }
        
        this.recalculateVitals();
    }
}

export default Vitals;

