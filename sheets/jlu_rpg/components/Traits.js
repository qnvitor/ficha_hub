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
                <label class="checkbox-label">
                    <input type="checkbox" class="trait-counts-pax" data-index="${index}" ${trait.countsForPAX === false ? 'checked' : ''}>
                    <span>Não conta PAX</span>
                </label>
                <button class="btn-remove" data-index="${index}">✕</button>
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
                        <span>NÃO CONTA PAX</span>
                        <span>AÇÃO</span>
                    </div>
                    ${rows}
                </div>
                <button class="btn-add" id="addTrait">+ Adicionar Traço</button>
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

            const countsPaxCheckbox = row.querySelector('.trait-counts-pax');
            if (countsPaxCheckbox) {
                countsPaxCheckbox.addEventListener('change', () => {
                    this.traits[index].countsForPAX = !countsPaxCheckbox.checked;
                    this.emitTraitsPax();
                });
            }
        });
    }

    addTrait() {
        this.traits.push({ name: '', desc: '', pax: 0, countsForPAX: true });
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
        // Sum all PAX from traits that count for PAX
        const totalPax = this.traits.reduce((sum, trait) => {
            return sum + (trait.countsForPAX !== false ? (trait.pax || 0) : 0);
        }, 0);
        emit('traits:pax-updated', { paxGastos: totalPax });
    }

    getData() {
        return this.traits;
    }

    setData(data) {
        this.traits = Array.isArray(data) ? data : [];
        // Ensure all traits have countsForPAX default
        this.traits = this.traits.map(trait => ({
            ...trait,
            countsForPAX: trait.countsForPAX !== undefined ? trait.countsForPAX : true
        }));
        this.render();
        this.attachListeners();
        this.emitTraitsPax();
    }
}

export default Traits;
