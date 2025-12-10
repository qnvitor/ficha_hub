// ========================================
// CAPABILITIES COMPONENT
// Manages: Heroic Capabilities with PAX cost and Grade calculation
// ========================================

import { emit, on } from '../utils/events.js';
import { calculateGrade } from '../utils/calculations.js';

class Capabilities {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            capabilities: [],
            paxGastos: 0
        };
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
    }

    render() {
        const rows = this.data.capabilities.map((cap, index) => `
            <div class="cap-row" data-index="${index}">
                <input type="text" class="cap-name" placeholder="Nome da Capacidade" value="${cap.name}" data-index="${index}">
                <textarea class="cap-desc" placeholder="Descrição da capacidade" data-index="${index}">${cap.desc || ''}</textarea>
                <input type="number" class="cap-pax" value="${cap.pax}" min="0" data-index="${index}">
                <input type="number" class="cap-grade" value="${cap.grade}" min="0" data-index="${index}">
                <label class="checkbox-label">
                    <input type="checkbox" class="cap-counts-pax" data-index="${index}" ${cap.countsForPAX === false ? 'checked' : ''}>
                    <span>Não conta PAX</span>
                </label>
                <button class="btn-remove" data-index="${index}">✕</button>
            </div>
        `).join('');

        this.container.innerHTML = `
            <section class="section capabilities">
                <h3>CAPACIDADES HERÓICAS</h3>
                <div class="capabilities-table">
                    <div class="cap-header">
                        <span>NOME DA CAPACIDADE</span>
                        <span>DESCRIÇÃO</span>
                        <span>PAX GASTOS</span>
                        <span>GRAU</span>
                        <span>NÃO CONTA PAX</span>
                        <span>AÇÃO</span>
                    </div>
                    <div id="capabilitiesList">
                        ${rows}
                    </div>
                </div>
                <button id="addCapability" class="btn-add">+ ADICIONAR CAPACIDADE</button>
            </section>
        `;
    }

    attachListeners() {
        // Add capability button
        const addBtn = this.container.querySelector('#addCapability');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addCapability());
        }

        // Capability inputs
        const nameInputs = this.container.querySelectorAll('.cap-name');
        const descInputs = this.container.querySelectorAll('.cap-desc');
        const paxInputs = this.container.querySelectorAll('.cap-pax');
        const gradeInputs = this.container.querySelectorAll('.cap-grade');
        const removeButtons = this.container.querySelectorAll('.btn-remove');

        nameInputs.forEach(input => {
            input.addEventListener('change', () => {
                const index = parseInt(input.dataset.index);
                this.data.capabilities[index].name = input.value;
                emit('capability:updated', this.data);
            });
        });

        descInputs.forEach(input => {
            input.addEventListener('change', () => {
                const index = parseInt(input.dataset.index);
                this.data.capabilities[index].desc = input.value;
                emit('capability:updated', this.data);
            });
        });

        paxInputs.forEach(input => {
            input.addEventListener('input', () => {
                const index = parseInt(input.dataset.index);
                const pax = parseInt(input.value) || 0;
                const oldPax = this.data.capabilities[index].pax || 0;
                this.data.capabilities[index].pax = pax;
                
                // Only auto-calculate grade if PAX changed significantly or grade matches old calculated value
                // This preserves manually edited grades
                const oldCalculatedGrade = calculateGrade(oldPax);
                const currentGrade = this.data.capabilities[index].grade || 0;
                
                // If current grade matches the old calculated grade, it means it wasn't manually edited
                // So we can safely recalculate. Otherwise, preserve the manual edit.
                if (currentGrade === oldCalculatedGrade || currentGrade === undefined) {
                    this.data.capabilities[index].grade = calculateGrade(pax);
                    this.updateGradeDisplay(index);
                }
                
                this.calculateTotalPAX();
            });
        });

        // Grade inputs - allow manual editing
        gradeInputs.forEach(input => {
            input.addEventListener('input', () => {
                const index = parseInt(input.dataset.index);
                const grade = parseInt(input.value) || 0;
                this.data.capabilities[index].grade = grade;
                emit('capability:updated', this.data);
            });
        });

        // Checkbox for counting PAX (when checked, does NOT count for PAX)
        const countsPaxCheckboxes = this.container.querySelectorAll('.cap-counts-pax');
        countsPaxCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const index = parseInt(checkbox.dataset.index);
                this.data.capabilities[index].countsForPAX = !checkbox.checked;
                this.calculateTotalPAX();
            });
        });

        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                this.removeCapability(index);
            });
        });
    }

    subscribeToEvents() {
        // Listen for PAX updates to validate
        on('pax:updated', (data) => {
            this.validatePAX(data.paxTotal);
        });
    }

    addCapability() {
        this.data.capabilities.push({ name: '', desc: '', pax: 0, grade: 0, countsForPAX: true });
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
        emit('capability:added', this.data);
    }

    removeCapability(index) {
        this.data.capabilities.splice(index, 1);
        this.calculateTotalPAX();
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
        emit('capability:removed', this.data);
    }

    updateGradeDisplay(index) {
        const gradeInput = this.container.querySelector(`.cap-row[data-index="${index}"] .cap-grade`);
        if (gradeInput) {
            gradeInput.value = this.data.capabilities[index].grade;
        }
        emit('capability:pax-changed', this.data);
    }

    calculateTotalPAX() {
        this.data.paxGastos = this.data.capabilities.reduce((sum, cap) => {
            return sum + (cap.countsForPAX !== false ? cap.pax : 0);
        }, 0);
        emit('capabilities:pax-updated', { paxGastos: this.data.paxGastos });
    }

    validatePAX(paxTotal) {
        if (this.data.paxGastos > paxTotal) {
            console.warn('PAX gastos excede PAX total!');
        }
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = { ...this.data, ...data };

        // Ensure all capabilities have grade calculated and countsForPAX default
        // Preserve manually edited grades if they exist
        this.data.capabilities = this.data.capabilities.map(cap => ({
            ...cap,
            // Only calculate grade if it doesn't exist or is undefined
            // This preserves manually edited grades
            grade: cap.grade !== undefined ? cap.grade : calculateGrade(cap.pax),
            countsForPAX: cap.countsForPAX !== undefined ? cap.countsForPAX : true
        }));

        this.calculateTotalPAX();
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
    }
}

export default Capabilities;
