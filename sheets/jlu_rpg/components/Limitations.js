// ========================================
// LIMITATIONS COMPONENT
// Manages: Character limitations
// ========================================

import { emit } from '../utils/events.js';

class Limitations {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            limitations: []
        };
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
    }

    render() {
        const rows = this.data.limitations.map((lim, index) => `
            <div class="limitation-row" data-index="${index}">
                <input type="text" class="limitation-name" placeholder="Nome da Limitação" value="${lim.name}" data-index="${index}">
                <textarea class="limitation-desc" placeholder="Descrição" data-index="${index}">${lim.description}</textarea>
                <button class="btn-remove" data-index="${index}">✕</button>
            </div>
        `).join('');

        this.container.innerHTML = `
            <section class="section limitations">
                <h3>LIMITAÇÕES</h3>
                <div class="limitations-table">
                    <div class="limitations-header">
                        <span>LIMITAÇÃO</span>
                        <span>DESCRIÇÃO</span>
                        <span>AÇÃO</span>
                    </div>
                    <div class="limitations-list">
                        ${rows}
                    </div>
                </div>
                <button id="addLimitation" class="btn-add">+ ADICIONAR LIMITAÇÃO</button>
            </section>
        `;
    }

    attachListeners() {
        const addBtn = this.container.querySelector('#addLimitation');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addLimitation());
        }

        const nameInputs = this.container.querySelectorAll('.limitation-name');
        const descInputs = this.container.querySelectorAll('.limitation-desc');
        const removeButtons = this.container.querySelectorAll('.btn-remove');

        nameInputs.forEach(input => {
            input.addEventListener('change', () => {
                const index = parseInt(input.dataset.index);
                this.data.limitations[index].name = input.value;
                emit('limitations:updated', this.data);
            });
        });

        descInputs.forEach(textarea => {
            textarea.addEventListener('change', () => {
                const index = parseInt(textarea.dataset.index);
                this.data.limitations[index].description = textarea.value;
                emit('limitations:updated', this.data);
            });
        });

        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                this.removeLimitation(index);
            });
        });
    }

    addLimitation() {
        this.data.limitations.push({ name: '', description: '' });
        this.render();
        this.attachListeners();
        emit('limitations:updated', this.data);
    }

    removeLimitation(index) {
        this.data.limitations.splice(index, 1);
        this.render();
        this.attachListeners();
        emit('limitations:updated', this.data);
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = { ...this.data, ...data };
        this.render();
        this.attachListeners();
    }
}

export default Limitations;
