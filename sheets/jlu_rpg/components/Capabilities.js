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
                <input type="number" class="cap-pax" value="${cap.pax}" min="0" data-index="${index}">
                <div class="cap-grade">${cap.grade}</div>
                <button class="btn-remove" data-index="${index}">✕</button>
            </div>
        `).join('');

        this.container.innerHTML = `
            <section class="section capabilities">
                <h3>CAPACIDADES HERÓICAS E TRAÇOS</h3>
                <div class="capabilities-table">
                    <div class="cap-header">
                        <span>NOME DA CAPACIDADE</span>
                        <span>PAX GASTOS</span>
                        <span>GRAU</span>
                        <span>AÇÃO</span>
                    </div>
                    <div id="capabilitiesList">
                        ${rows}
                    </div>
                    <button id="addCapability" class="btn-add">+ ADICIONAR CAPACIDADE</button>
                </div>
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
        const paxInputs = this.container.querySelectorAll('.cap-pax');
        const removeButtons = this.container.querySelectorAll('.btn-remove');

        nameInputs.forEach(input => {
            input.addEventListener('change', () => {
                const index = parseInt(input.dataset.index);
                this.data.capabilities[index].name = input.value;
                emit('capability:updated', this.data);
            });
        });

        paxInputs.forEach(input => {
            input.addEventListener('input', () => {
                const index = parseInt(input.dataset.index);
                const pax = parseInt(input.value) || 0;
                this.data.capabilities[index].pax = pax;
                this.data.capabilities[index].grade = calculateGrade(pax);
                this.calculateTotalPAX();
                this.updateGradeDisplay(index);
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
        this.data.capabilities.push({ name: '', pax: 0, grade: 0 });
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
        const gradeDiv = this.container.querySelector(`.cap-row[data-index="${index}"] .cap-grade`);
        if (gradeDiv) {
            gradeDiv.textContent = this.data.capabilities[index].grade;
        }
        emit('capability:pax-changed', this.data);
    }

    calculateTotalPAX() {
        this.data.paxGastos = this.data.capabilities.reduce((sum, cap) => sum + cap.pax, 0);
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

        // Ensure all capabilities have grade calculated
        this.data.capabilities = this.data.capabilities.map(cap => ({
            ...cap,
            grade: calculateGrade(cap.pax)
        }));

        this.calculateTotalPAX();
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
    }
}

export default Capabilities;
