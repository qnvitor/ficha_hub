// ========================================
// POWERS COMPONENT
// Two dynamic lists: Active Powers and Passive Powers
// Each item: Name field and Description textarea
// ========================================

import { emit } from '../utils/events.js';

class Powers {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            active: [],
            passive: []
        };
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
    }

    renderPowerList(type, powers, title) {
        const powerRows = powers.map((power, index) => `
            <div class="power-item" data-type="${type}" data-index="${index}">
                <div class="power-header">
                    <input type="text" class="power-name" data-type="${type}" data-index="${index}" 
                           value="${power.name}" placeholder="Nome da Habilidade">
                    <button type="button" class="btn-remove-power" data-type="${type}" data-index="${index}">✕</button>
                </div>
                <textarea class="power-description" data-type="${type}" data-index="${index}" 
                          rows="3" placeholder="Descrição da habilidade...">${power.description}</textarea>
            </div>
        `).join('');

        return `
            <div class="power-category">
                <div class="power-category-header">
                    <h4>${title}</h4>
                    <button type="button" class="btn-add-power" data-type="${type}">+ Adicionar</button>
                </div>
                <div class="power-list">
                    ${powerRows || '<div class="power-empty">Nenhuma habilidade adicionada</div>'}
                </div>
            </div>
        `;
    }

    render() {
        this.container.innerHTML = `
            <section class="section powers">
                <h3>HABILIDADES</h3>
                <div class="powers-container">
                    ${this.renderPowerList('active', this.data.active, 'Ativas')}
                    ${this.renderPowerList('passive', this.data.passive, 'Passivas')}
                </div>
            </section>
        `;
    }

    attachListeners() {
        // Add power buttons
        const addBtns = this.container.querySelectorAll('.btn-add-power');
        addBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.addPower(type);
            });
        });

        // Remove power buttons
        const removeBtns = this.container.querySelectorAll('.btn-remove-power');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const index = parseInt(e.target.dataset.index);
                this.removePower(type, index);
            });
        });

        // Power name inputs
        const nameInputs = this.container.querySelectorAll('.power-name');
        nameInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleNameChange(e));
        });

        // Power description textareas
        const descInputs = this.container.querySelectorAll('.power-description');
        descInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleDescriptionChange(e));
        });
    }

    addPower(type) {
        this.data[type].push({
            name: '',
            description: ''
        });
        this.render();
        this.attachListeners();
        emit('powers:updated', this.data);
    }

    removePower(type, index) {
        this.data[type].splice(index, 1);
        this.render();
        this.attachListeners();
        emit('powers:updated', this.data);
    }

    handleNameChange(event) {
        const type = event.target.dataset.type;
        const index = parseInt(event.target.dataset.index);
        this.data[type][index].name = event.target.value;
        emit('powers:updated', this.data);
    }

    handleDescriptionChange(event) {
        const type = event.target.dataset.type;
        const index = parseInt(event.target.dataset.index);
        this.data[type][index].description = event.target.value;
        emit('powers:updated', this.data);
    }

    getData() {
        return {
            active: [...this.data.active],
            passive: [...this.data.passive]
        };
    }

    setData(data) {
        this.data = {
            active: Array.isArray(data?.active) ? data.active : [],
            passive: Array.isArray(data?.passive) ? data.passive : []
        };
        this.render();
        this.attachListeners();
    }
}

export default Powers;

