// ========================================
// TRAITS COMPONENT
// Manages: Character traits with PAX cost
// ========================================

import { emit } from '../utils/events.js';

class Traits {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.traits = [];
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
    }

    render() {
        const rows = this.traits.map((trait, index) => `
            <div class="trait-row" data-index="${index}">
                <input type="text" class="trait-name" value="${trait.name}" placeholder="Ex: Voo">
                <textarea class="trait-desc" placeholder="Descrição do traço">${trait.desc || ''}</textarea>
                <input type="number" class="trait-pax" value="${trait.pax || 0}" min="0" placeholder="0">
                <button class="btn-remove" data-index="${index}">Remover</button>
            </div>
        `).join('');

        this.container.innerHTML = `
            <section class="section traits">
                <h3>TRAÇOS</h3>
                <div class="traits-list">
                    <div class="trait-header">
                        <span>TRAÇO</span>
                        <span>DESCRIÇÃO</span>
                        <span>PAX</span>
                        <span>AÇÃO</span>
                    </div>
                    ${rows}
                    <button class="btn-add" id="addTrait">+ Adicionar Traço</button>
                </div>
            </section>
        `;
    }

    attachListeners() {
        const addBtn = this.container.querySelector('#addTrait');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addTrait());
        }

        // Remove buttons
        this.container.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeTrait(index);
            });
        });

        // Input changes
        this.container.querySelectorAll('.trait-row').forEach((row, index) => {
            const nameInput = row.querySelector('.trait-name');
            const descInput = row.querySelector('.trait-desc');
            const paxInput = row.querySelector('.trait-pax');

            if (nameInput) {
                nameInput.addEventListener('change', () => {
                    this.traits[index].name = nameInput.value;
                });
            }

            if (descInput) {
                descInput.addEventListener('change', () => {
                    this.traits[index].desc = descInput.value;
                });
            }

            if (paxInput) {
                paxInput.addEventListener('input', () => {
                    this.traits[index].pax = parseInt(paxInput.value) || 0;
                    this.emitTraitsPax();
                });
            }
        });
    }

    addTrait() {
        this.traits.push({ name: '', desc: '', pax: 0 });
        this.render();
        this.attachListeners();
        this.emitTraitsPax();
    }

    removeTrait(index) {
        this.traits.splice(index, 1);
        this.render();
        this.attachListeners();
        this.emitTraitsPax();
    }

    emitTraitsPax() {
        // Sum all PAX from traits
        const totalPax = this.traits.reduce((sum, trait) => sum + (trait.pax || 0), 0);
        emit('traits:pax-updated', { paxGastos: totalPax });
    }

    getData() {
        return this.traits;
    }

    setData(data) {
        this.traits = Array.isArray(data) ? data : [];
        this.render();
        this.attachListeners();
        this.emitTraitsPax();
    }
}

export default Traits;
