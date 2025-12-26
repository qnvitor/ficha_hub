// ========================================
// COMBAT STATUS COMPONENT
// Manages: Fardos/Maldições, Bençãos, Testes de Morte (3 success / 3 failure)
// ========================================

import { emit } from '../utils/events.js';

class CombatStatus {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            fardosMaladicoes: '',
            bencaos: '',
            testesMorte: {
                sucesso1: false,
                sucesso2: false,
                sucesso3: false,
                falha1: false,
                falha2: false,
                falha3: false
            }
        };
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
    }

    render() {
        const { testesMorte } = this.data;

        this.container.innerHTML = `
            <section class="section combat-status">
                <h3>STATUS DE COMBATE</h3>
                <div class="combat-status-grid">
                    <div class="form-group">
                        <label for="fardosMaladicoes">Fardos/Maldições</label>
                        <textarea id="fardosMaladicoes" class="form-textarea" 
                                  rows="4" placeholder="Descreva os fardos e maldições...">${this.data.fardosMaladicoes}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="bencaos">Bençãos</label>
                        <textarea id="bencaos" class="form-textarea" 
                                  rows="4" placeholder="Descreva as bençãos...">${this.data.bencaos}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Testes de Morte</label>
                        <div class="death-saves">
                            <div class="death-saves-group">
                                <span class="death-saves-label">Sucessos</span>
                                <div class="death-saves-checkboxes">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="sucesso1" ${testesMorte.sucesso1 ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="sucesso2" ${testesMorte.sucesso2 ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="sucesso3" ${testesMorte.sucesso3 ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="death-saves-group">
                                <span class="death-saves-label">Falhas</span>
                                <div class="death-saves-checkboxes">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="falha1" ${testesMorte.falha1 ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="falha2" ${testesMorte.falha2 ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="falha3" ${testesMorte.falha3 ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    attachListeners() {
        // Textareas
        const textareas = this.container.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', (e) => this.handleTextareaChange(e));
        });

        // Checkboxes
        const checkboxes = this.container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleCheckboxChange(e));
        });
    }

    handleTextareaChange(event) {
        const field = event.target.id;
        this.data[field] = event.target.value;
        emit('combat-status:updated', this.data);
    }

    handleCheckboxChange(event) {
        const field = event.target.id;
        this.data.testesMorte[field] = event.target.checked;
        emit('combat-status:updated', this.data);
    }

    getData() {
        return { ...this.data };
    }

    setData(data) {
        this.data = {
            fardosMaladicoes: data?.fardosMaladicoes || '',
            bencaos: data?.bencaos || '',
            testesMorte: {
                sucesso1: data?.testesMorte?.sucesso1 || false,
                sucesso2: data?.testesMorte?.sucesso2 || false,
                sucesso3: data?.testesMorte?.sucesso3 || false,
                falha1: data?.testesMorte?.falha1 || false,
                falha2: data?.testesMorte?.falha2 || false,
                falha3: data?.testesMorte?.falha3 || false
            }
        };
        this.render();
        this.attachListeners();
    }
}

export default CombatStatus;

