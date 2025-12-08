// ========================================
// ITEMS COMPONENT
// Manages: Character items with PAX cost
// ========================================

import { emit } from '../utils/events.js';

class Items {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            items: [],
            paxGastos: 0
        };
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
    }

    render() {
        const rows = this.data.items.map((item, index) => `
            <div class="item-row" data-index="${index}">
                <input type="text" class="item-name" placeholder="Nome do Item" value="${item.name}" data-index="${index}">
                <textarea class="item-desc" placeholder="Descrição" data-index="${index}">${item.description || ''}</textarea>
                <input type="number" class="item-pax" value="${item.pax}" min="0" data-index="${index}">
                <label class="checkbox-label">
                    <input type="checkbox" class="item-counts-pax" data-index="${index}" ${item.countsForPAX === false ? 'checked' : ''}>
                    <span>Não conta PAX</span>
                </label>
                <button class="btn-remove" data-index="${index}">✕</button>
            </div>
        `).join('');

        this.container.innerHTML = `
            <section class="section items">
                <h3>ITENS</h3>
                <div class="items-table">
                    <div class="item-header">
                        <span>NOME</span>
                        <span>DESCRIÇÃO</span>
                        <span>PAX</span>
                        <span>NÃO CONTA PAX</span>
                        <span>AÇÃO</span>
                    </div>
                    <div class="items-list">
                        ${rows}
                    </div>
                    <button id="addItem" class="btn-add">+ ADICIONAR ITEM</button>
                </div>
            </section>
        `;
    }

    attachListeners() {
        const addBtn = this.container.querySelector('#addItem');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addItem());
        }

        const nameInputs = this.container.querySelectorAll('.item-name');
        const descInputs = this.container.querySelectorAll('.item-desc');
        const paxInputs = this.container.querySelectorAll('.item-pax');
        const removeButtons = this.container.querySelectorAll('.btn-remove');

        nameInputs.forEach(input => {
            input.addEventListener('change', () => {
                const index = parseInt(input.dataset.index);
                this.data.items[index].name = input.value;
                emit('items:updated', this.data);
            });
        });

        descInputs.forEach(textarea => {
            textarea.addEventListener('change', () => {
                const index = parseInt(textarea.dataset.index);
                this.data.items[index].description = textarea.value;
                emit('items:updated', this.data);
            });
        });

        paxInputs.forEach(input => {
            input.addEventListener('input', () => {
                const index = parseInt(input.dataset.index);
                const pax = parseInt(input.value) || 0;
                this.data.items[index].pax = pax;
                this.calculateTotalPAX();
            });
        });

        // Checkbox for counting PAX (when checked, does NOT count for PAX)
        const countsPaxCheckboxes = this.container.querySelectorAll('.item-counts-pax');
        countsPaxCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const index = parseInt(checkbox.dataset.index);
                this.data.items[index].countsForPAX = !checkbox.checked;
                this.calculateTotalPAX();
            });
        });

        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                this.removeItem(index);
            });
        });
    }

    addItem() {
        this.data.items.push({ name: '', description: '', pax: 0, countsForPAX: true });
        this.render();
        this.attachListeners();
        emit('items:updated', this.data);
    }

    removeItem(index) {
        this.data.items.splice(index, 1);
        this.calculateTotalPAX();
        this.render();
        this.attachListeners();
        emit('items:updated', this.data);
    }

    calculateTotalPAX() {
        this.data.paxGastos = this.data.items.reduce((sum, item) => {
            return sum + (item.countsForPAX !== false ? item.pax : 0);
        }, 0);
        emit('items:pax-updated', { paxGastos: this.data.paxGastos });
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = { ...this.data, ...data };
        // Ensure all items have countsForPAX default
        this.data.items = this.data.items.map(item => ({
            ...item,
            countsForPAX: item.countsForPAX !== undefined ? item.countsForPAX : true
        }));
        this.calculateTotalPAX();
        this.render();
        this.attachListeners();
    }
}

export default Items;
