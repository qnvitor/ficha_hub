// ========================================
// SKILLS COMPONENT
// Manages: List of skills with numeric value
// Includes default skills and ability to add custom ones
// ========================================

import { emit } from '../utils/events.js';

class Skills {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.defaultSkills = [
            'Armas Brancas', 'Artes', 'Atletismo', 'Atualidades',
            'Ciências', 'Dirigir', 'Flerte', 'Furtividade',
            'História', 'Improvisar', 'Iniciativa', 'Investigação',
            'Luta', 'Magia', 'Medicina', 'Mentir',
            'Mira', 'Percepção', 'Presença', 'Sobrevivência', 'Diplomacia'
        ];
        this.data = [];
        this.initData();
        this.init();
    }

    initData() {
        // Initialize with default skills
        this.data = this.defaultSkills.map(skill => ({
            name: skill,
            trained: false,
            value: 0
        }));
    }

    init() {
        this.render();
        this.attachListeners();
    }

    render() {
        const skillRows = this.data.map((skill, index) => {
            const isDefault = index < this.defaultSkills.length;
            return `
            <div class="skill-row" data-index="${index}">
                <input type="text" class="skill-name" data-index="${index}" 
                       value="${skill.name}" placeholder="Nome da Perícia"
                       ${isDefault ? 'readonly' : ''}>
                <input type="number" class="skill-value" data-index="${index}" 
                       value="${skill.value}" placeholder="0">
                <button type="button" class="btn-remove-skill" data-index="${index}" 
                        ${isDefault ? 'style="display:none"' : ''}>
                    ✕
                </button>
            </div>
        `;
        }).join('');

        this.container.innerHTML = `
            <section class="section skills">
                <h3>PERÍCIAS</h3>
                <div class="skills-header">
                    <span>Nome</span>
                    <span>Bônus</span>
                </div>
                <div class="skills-list">
                    ${skillRows}
                </div>
                <button type="button" class="btn-add-skill">+ Adicionar Perícia</button>
            </section>
        `;
    }

    attachListeners() {
        // Add skill button
        const addBtn = this.container.querySelector('.btn-add-skill');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addSkill());
        }

        // Remove skill buttons
        const removeBtns = this.container.querySelectorAll('.btn-remove-skill');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeSkill(index);
            });
        });

        // Skill inputs
        const nameInputs = this.container.querySelectorAll('.skill-name');
        nameInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleNameChange(e));
        });

        const valueInputs = this.container.querySelectorAll('.skill-value');
        valueInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleValueChange(e));
        });
    }

    addSkill() {
        this.data.push({
            name: '',
            trained: false,
            value: 0
        });
        this.render();
        this.attachListeners();
        emit('skills:updated', this.data);
    }

    removeSkill(index) {
        // Don't allow removing default skills
        if (index >= this.defaultSkills.length) {
            this.data.splice(index, 1);
            this.render();
            this.attachListeners();
            emit('skills:updated', this.data);
        }
    }

    handleNameChange(event) {
        const index = parseInt(event.target.dataset.index);
        // Não permitir editar nome de perícias padrão
        if (index < this.defaultSkills.length) {
            // Restaurar o nome original se tentar editar
            event.target.value = this.data[index].name;
            return;
        }
        this.data[index].name = event.target.value;
        emit('skills:updated', this.data);
    }

    handleValueChange(event) {
        const index = parseInt(event.target.dataset.index);
        this.data[index].value = parseInt(event.target.value) || 0;
        emit('skills:updated', this.data);
    }

    getData() {
        return [...this.data];
    }

    setData(data) {
        if (Array.isArray(data) && data.length > 0) {
            this.data = data;
        } else {
            this.initData();
        }
        this.render();
        this.attachListeners();
    }
}

export default Skills;

