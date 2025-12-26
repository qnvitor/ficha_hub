// ========================================
// HEADER IDENTITY COMPONENT
// Manages: Name, Player, Semideus Level, Armamento Level
// ========================================

import { emit } from '../utils/events.js';

class HeaderIdentity {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.armamentoOptions = ['Espadachim', 'Atirador', 'Lutador'];
        this.semideusOptions = [
            'Zeus',
            'Hera',
            'Poseidon',
            'Hades',
            'Deméter',
            'Atena',
            'Apolo',
            'Ártemis',
            'Ares',
            'Afrodite',
            'Hefesto',
            'Hermes',
            'Dionísio',
            'Nike',
            'Hecate',
            'Nyx',
            'Nemesis',
            'Thanatos'
        ];
        this.data = {
            characterName: '',
            player: '',
            semideusLevel: 0,
            semideusTitle: '',
            armamentoLevel: 0,
            armamentoName: ''
        };
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
    }

    render() {
        this.container.innerHTML = `
            <section class="section header-identity">
                <h3>IDENTIFICAÇÃO</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="characterName">Nome do Personagem</label>
                        <input type="text" id="characterName" class="form-input" 
                               value="${this.data.characterName}" placeholder="Nome do Personagem">
                    </div>
                    <div class="form-group">
                        <label for="player">Jogador</label>
                        <input type="text" id="player" class="form-input" 
                               value="${this.data.player}" placeholder="Nome do Jogador">
                    </div>
                </div>
                
                <div class="form-grid compound-fields">
                    <div class="form-group compound-field">
                        <label>Nível Semideus</label>
                        <div class="compound-input-group">
                            <input type="number" id="semideusLevel" class="form-input compound-number" 
                                   value="${this.data.semideusLevel}" min="0" placeholder="Nível">
                            <select id="semideusTitle" class="form-input compound-text">
                                <option value="">Selecione...</option>
                                ${this.semideusOptions.map(option => 
                                    `<option value="${option}" ${this.data.semideusTitle === option ? 'selected' : ''}>${option}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-group compound-field">
                        <label>Nível Armamento</label>
                        <div class="compound-input-group">
                            <input type="number" id="armamentoLevel" class="form-input compound-number" 
                                   value="${this.data.armamentoLevel}" min="0" placeholder="Nível">
                            <select id="armamentoName" class="form-input compound-text">
                                <option value="">Selecione...</option>
                                ${this.armamentoOptions.map(option => 
                                    `<option value="${option}" ${this.data.armamentoName === option ? 'selected' : ''}>${option}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    attachListeners() {
        const inputs = this.container.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleChange(e));
        });

        // Select para semideus
        const semideusSelect = this.container.querySelector('#semideusTitle');
        if (semideusSelect) {
            semideusSelect.addEventListener('change', (e) => this.handleChange(e));
        }

        // Select para armamento
        const armamentoSelect = this.container.querySelector('#armamentoName');
        if (armamentoSelect) {
            armamentoSelect.addEventListener('change', (e) => this.handleChange(e));
        }
    }

    handleChange(event) {
        const field = event.target.id;
        let value = event.target.value;

        // Convert number fields
        if (field === 'semideusLevel' || field === 'armamentoLevel') {
            value = parseInt(value) || 0;
        }

        this.data[field] = value;
        emit('identity:updated', this.data);
    }

    getData() {
        return { ...this.data };
    }

    setData(data) {
        this.data = { ...this.data, ...data };
        // Garantir que semideusTitle está nas opções válidas ou vazio
        if (this.data.semideusTitle && !this.semideusOptions.includes(this.data.semideusTitle)) {
            this.data.semideusTitle = '';
        }
        // Garantir que armamentoName está nas opções válidas ou vazio
        if (this.data.armamentoName && !this.armamentoOptions.includes(this.data.armamentoName)) {
            this.data.armamentoName = '';
        }
        this.render();
        this.attachListeners();
    }
}

export default HeaderIdentity;

