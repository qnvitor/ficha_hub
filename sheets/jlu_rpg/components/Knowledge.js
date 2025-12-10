// ========================================
// KNOWLEDGE COMPONENT
// Manages: Character skills/knowledge
// Each knowledge costs 4 PAX
// ========================================

import { emit } from '../utils/events.js';

class Knowledge {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.knowledges = [];
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
    }

    render() {
        const rows = this.knowledges.map((knowledge, index) => `
            <div class="knowledge-row" data-index="${index}">
                <input type="text" class="knowledge-name" value="${knowledge.name}" placeholder="Ex: Investigação">
                <label class="checkbox-label">
                    <input type="checkbox" class="knowledge-counts-pax" data-index="${index}" ${knowledge.countsForPAX === false ? 'checked' : ''}>
                    <span>Não conta PAX</span>
                </label>
                <button class="btn-remove" data-index="${index}">✕</button>
            </div>
        `).join('');

        this.container.innerHTML = `
            <section class="section knowledge">
                <h3>CONHECIMENTOS</h3>
                <div class="knowledge-table">
                    <div class="knowledge-header">
                        <span>CONHECIMENTO</span>
                        <span>NÃO CONTA PAX</span>
                        <span>AÇÃO</span>
                    </div>
                    <div class="knowledge-list">
                        ${rows}
                    </div>  
                </div>
                <button class="btn-add" id="addKnowledge">+ Adicionar Conhecimento</button>
            </section>
        `;
    }

    attachListeners() {
        console.log('Attaching listeners to Knowledge component');
        const addBtn = this.container.querySelector('#addKnowledge');
        console.log('Add button found:', addBtn);

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                console.log('Add Knowledge button clicked!');
                this.addKnowledge();
            });
        }

        // Remove buttons
        this.container.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeKnowledge(index);
            });
        });

        // Input changes
        this.container.querySelectorAll('.knowledge-row').forEach((row, index) => {
            const nameInput = row.querySelector('.knowledge-name');

            if (nameInput) {
                nameInput.addEventListener('change', () => {
                    this.knowledges[index].name = nameInput.value;
                    this.emitKnowledgePax();
                });
            }

            const countsPaxCheckbox = row.querySelector('.knowledge-counts-pax');
            if (countsPaxCheckbox) {
                countsPaxCheckbox.addEventListener('change', () => {
                    this.knowledges[index].countsForPAX = !countsPaxCheckbox.checked;
                    this.emitKnowledgePax();
                });
            }
        });
    }

    addKnowledge() {
        console.log('addKnowledge called, current knowledges:', this.knowledges.length);
        this.knowledges.push({ name: '', countsForPAX: true });
        console.log('After push, knowledges:', this.knowledges.length);
        this.render();
        this.attachListeners();
        this.emitKnowledgePax();
    }

    removeKnowledge(index) {
        this.knowledges.splice(index, 1);
        this.render();
        this.attachListeners();
        this.emitKnowledgePax();
    }

    emitKnowledgePax() {
        // Each knowledge costs 4 PAX, but only if it counts for PAX
        const totalPax = this.knowledges.reduce((sum, knowledge) => {
            return sum + (knowledge.countsForPAX !== false ? 4 : 0);
        }, 0);
        emit('knowledge:pax-updated', { paxGastos: totalPax });
    }

    getData() {
        return this.knowledges;
    }

    setData(data) {
        console.log('setData called with:', data, 'type:', typeof data);

        // Ensure data is always an array
        if (Array.isArray(data)) {
            this.knowledges = data;
        } else if (data && typeof data === 'object') {
            // If it's an object but not an array, convert or set to empty
            this.knowledges = [];
        } else {
            this.knowledges = [];
        }

        // Ensure all knowledges have countsForPAX default
        this.knowledges = this.knowledges.map(knowledge => ({
            ...knowledge,
            countsForPAX: knowledge.countsForPAX !== undefined ? knowledge.countsForPAX : true
        }));

        console.log('this.knowledges after setData:', this.knowledges);
        this.render();
        this.attachListeners();
        this.emitKnowledgePax();
    }
}

export default Knowledge;
