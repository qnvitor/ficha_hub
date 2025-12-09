// ========================================
// CHARACTER INFO COMPONENT
// Manages: Name, Identity, Image, Tier, PAX, Origin, Archetype
// ========================================

import { emit, on } from '../utils/events.js';
import { TIER_DATA } from '../data/tierData.js';

class CharacterInfo {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            heroName: '',
            secretIdentity: '',
            imageUrl: '',
            tier: '',
            paxTotal: 0,
            paxGastos: 0,
            paxDisponiveis: 0,
            origin: '',
            archetype: ''
        };
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
    }

    subscribeToEvents() {
        // Listen for PAX spent on attributes
        on('attributes:pax-updated', (data) => {
            this.attributesPax = data.paxGastos || 0;
            this.calculatePAX();
        });

        // Listen for PAX spent on capabilities
        on('capabilities:pax-updated', (data) => {
            this.capabilitiesPax = data.paxGastos || 0;
            this.calculatePAX();
        });

        // Listen for DET. COMPRADO (each costs 2 PAX)
        on('determination:purchased', (data) => {
            this.determinationPax = (data.detComprado || 0) * 2;
            this.calculatePAX();
        });

        // Listen for Knowledge (each costs 4 PAX)
        on('knowledge:pax-updated', (data) => {
            this.knowledgePax = data.paxGastos || 0;
            this.calculatePAX();
        });

        // Listen for Traits PAX
        on('traits:pax-updated', (data) => {
            this.traitsPax = data.paxGastos || 0;
            this.calculatePAX();
        });

        // Listen for Items PAX
        on('items:pax-updated', (data) => {
            this.itemsPax = data.paxGastos || 0;
            this.calculatePAX();
        });
    }

    calculatePAX() {
        const attributesPax = this.attributesPax || 0;
        const capabilitiesPax = this.capabilitiesPax || 0;
        const determinationPax = this.determinationPax || 0;
        const knowledgePax = this.knowledgePax || 0;
        const traitsPax = this.traitsPax || 0;
        const itemsPax = this.itemsPax || 0;

        this.data.paxGastos = attributesPax + capabilitiesPax + determinationPax + knowledgePax + traitsPax + itemsPax;
        this.data.paxDisponiveis = this.data.paxTotal - this.data.paxGastos;

        // Update display
        const paxGastosInput = document.getElementById('paxGastos');
        const paxDisponiveisInput = document.getElementById('paxDisponiveis');

        if (paxGastosInput) paxGastosInput.value = this.data.paxGastos;
        if (paxDisponiveisInput) paxDisponiveisInput.value = this.data.paxDisponiveis;

        // Emit event
        emit('pax:updated', {
            paxTotal: this.data.paxTotal,
            paxGastos: this.data.paxGastos,
            paxDisponiveis: this.data.paxDisponiveis
        });
    }

    render() {
        this.container.innerHTML = `
            <section class="section identification">
                <h3>IDENTIFICAÇÃO E INFORMAÇÕES</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="heroName">Nome do Herói</label>
                        <input type="text" id="heroName" placeholder="Ex: Superman" value="${this.data.heroName}">
                    </div>
                    <div class="form-group">
                        <label for="secretIdentity">Identidade Secreta</label>
                        <input type="text" id="secretIdentity" placeholder="Ex: Clark Kent" value="${this.data.secretIdentity}">
                    </div>
                    <div class="form-group">
                        <label for="archetype">Arquétipo</label>
                        <input type="text" id="archetype" placeholder="Ex: Alienígena" value="${this.data.archetype}">
                    </div>
                    <div class="form-group">
                        <label for="origin">Origem</label>
                        <input type="text" id="origin" placeholder="Ex: Krypton" value="${this.data.origin}">
                    </div>
                    <div class="form-group">
                        <label for="tier">Tier</label>
                        <select id="tier">
                            <option value="">Selecione</option>
                            <option value="D" ${this.data.tier === 'D' ? 'selected' : ''}>D</option>
                            <option value="C" ${this.data.tier === 'C' ? 'selected' : ''}>C</option>
                            <option value="B" disabled ${this.data.tier === 'B' ? 'selected' : ''}>B (Em breve)</option>
                            <option value="A" disabled ${this.data.tier === 'A' ? 'selected' : ''}>A (Em breve)</option>
                            <option value="S" disabled ${this.data.tier === 'S' ? 'selected' : ''}>S (Em breve)</option>
                        </select>
                    </div>
                </div>
                
                <h4 style="margin-top: 20px; margin-bottom: 10px;">PONTOS DE ASCENSÃO (PAX)</h4>
                <div class="pax-grid">
                    <div class="form-group">
                        <label for="paxTotal">PAX TOTAL</label>
                        <input type="number" id="paxTotal" value="${this.data.paxTotal}" min="0">
                    </div>
                    <div class="form-group">
                        <label for="paxGastos">PAX GASTOS</label>
                        <input type="number" id="paxGastos" value="${this.data.paxGastos}" readonly>
                    </div>
                    <div class="form-group highlight">
                        <label for="paxDisponiveis">PAX DISPONÍVEIS</label>
                        <input type="number" id="paxDisponiveis" value="${this.data.paxDisponiveis}" readonly>
                    </div>
                </div>
            </section>
        `;
    }

    attachListeners() {
        const tierSelect = this.container.querySelector('#tier');
        const paxTotalInput = this.container.querySelector('#paxTotal');
        const heroName = this.container.querySelector('#heroName');
        const secretIdentity = this.container.querySelector('#secretIdentity');
        const archetype = this.container.querySelector('#archetype');
        const origin = this.container.querySelector('#origin');

        if (tierSelect) {
            tierSelect.addEventListener('change', () => {
                this.data.tier = tierSelect.value;
                const tierData = TIER_DATA[tierSelect.value];

                // Auto-fill PAX total when tier is selected
                if (tierData && paxTotalInput) {
                    this.data.paxTotal = tierData.pax;
                    paxTotalInput.value = tierData.pax;
                    this.calculatePAX();
                }

                emit('tier:changed', {
                    tier: tierSelect.value,
                    tierData: tierData
                });
                emit('character:updated', this.data);
            });
        }

        // Allow manual PAX Total editing
        if (paxTotalInput) {
            paxTotalInput.addEventListener('input', () => {
                this.data.paxTotal = parseInt(paxTotalInput.value) || 0;
                this.calculatePAX();
                emit('character:updated', this.data);
            });
        }

        [heroName, secretIdentity, archetype, origin].forEach(input => {
            if (input) {
                input.addEventListener('change', () => {
                    this.data[input.id] = input.value;
                    emit('character:updated', this.data);
                });
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

export default CharacterInfo;
