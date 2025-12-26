// ========================================
// INVENTORY COMPONENT
// Dynamic table: Item Name, Carga (Quantity), Weight
// Footer stats: Current Weight, Max Weight (calculated), Current Space (sum of cargas), Total Space (editable, default 6)
// ========================================

import { emit, on } from '../utils/events.js';

class Inventory {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            items: [],
            pesoAtual: 0, // Peso atual dos itens carregados
            pesoMaximo: 0, // Calculado: Vigor + Modificadores + Bônus do Armamento
            espacoAtual: 0, // Calculado: soma das cargas dos itens
            espacoTotal: 6 // Padrão 6, mas pode ser expandido (editável) + Bônus do Armamento
        };
        // Store references to other components' data for calculations
        this.attributesData = null;
        this.identityData = null;
        this.init();
    }

    // Benefícios de cada tipo de armamento
    static getArmamentoBonuses(armamentoName) {
        const bonuses = {
            'Espadachim': {
                pesoMaximoBonus: 20, // kg adicionais
                espacoTotalBonus: 1  // espaços adicionais
            },
            'Atirador': {
                pesoMaximoBonus: 15, // kg adicionais
                espacoTotalBonus: 2  // espaços adicionais
            },
            'Lutador': {
                pesoMaximoBonus: 25, // kg adicionais
                espacoTotalBonus: 1  // espaços adicionais
            }
        };
        return bonuses[armamentoName] || { pesoMaximoBonus: 0, espacoTotalBonus: 0 };
    }

    init() {
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
    }

    subscribeToEvents() {
        // Listen to attributes changes to recalculate peso máximo
        on('attributes:updated', (data) => {
            this.attributesData = data;
            this.recalculatePesoMaximo();
        });

        // Listen to identity changes (for armamentoName to get bonuses)
        on('identity:updated', (data) => {
            this.identityData = data;
            this.recalculatePesoMaximo();
        });
    }

    recalculatePesoMaximo() {
        if (!this.attributesData || !this.identityData) {
            // Wait for both components to be initialized
            return;
        }

        const vigor = parseInt(this.attributesData.vigor?.total) || 0;
        const armamentoName = this.identityData.armamentoName || '';

        // Get armamento bonuses
        const armamentoBonuses = Inventory.getArmamentoBonuses(armamentoName);

        // Calculate Peso Máximo: Vigor + Bônus do Armamento
        this.data.pesoMaximo = vigor + armamentoBonuses.pesoMaximoBonus;

        // Update UI
        this.updatePesoMaximoField();
        this.updateEspacoTotalBase();
    }

    updateEspacoTotalBase() {
        if (!this.identityData) return;

        const armamentoName = this.identityData.armamentoName || '';
        const armamentoBonuses = Inventory.getArmamentoBonuses(armamentoName);
        
        // Calculate base espaço total: 6 (padrão) + bônus do armamento
        const espacoTotalBase = 6 + armamentoBonuses.espacoTotalBonus;
        
        // Update espacoTotal to reflect the base + bonus
        // User can still edit it manually after this
        const espacoTotalInput = this.container.querySelector('#espacoTotal');
        if (espacoTotalInput) {
            // Only update if the current value matches the old base (6) or is unset
            // This allows user edits to persist when armamento changes from one to another
            const currentValue = parseInt(this.data.espacoTotal) || 6;
            // If value is at base (6) or less than new base, update it
            if (currentValue <= 6 || currentValue < espacoTotalBase) {
                this.data.espacoTotal = espacoTotalBase;
                espacoTotalInput.value = espacoTotalBase;
            }
        } else {
            // If input doesn't exist yet (during initialization), update data directly
            this.data.espacoTotal = espacoTotalBase;
        }
    }

    updatePesoMaximoField() {
        const pesoMaximoEl = this.container.querySelector('#pesoMaximo');
        if (pesoMaximoEl) {
            pesoMaximoEl.textContent = this.data.pesoMaximo;
        }
    }

    render() {
        const itemRows = this.data.items.map((item, index) => `
            <tr class="inventory-row" data-index="${index}">
                <td>
                    <input type="text" class="item-name" data-index="${index}" 
                           value="${item.name}" placeholder="Nome do Item">
                </td>
                <td>
                    <input type="number" class="item-quantity" data-index="${index}" 
                           value="${item.quantity}" min="0" placeholder="0">
                </td>
                <td>
                    <input type="number" class="item-weight" data-index="${index}" 
                           value="${item.weight || 0}" min="0" step="0.1" placeholder="0">
                </td>
                <td>
                    <button type="button" class="btn-remove-item" data-index="${index}">✕</button>
                </td>
            </tr>
        `).join('');

        this.container.innerHTML = `
            <section class="section inventory">
                <h3>INVENTÁRIO</h3>
                <div class="inventory-table-container">
                    <table class="inventory-table">
                        <thead>
                            <tr>
                                <th>Nome do Item</th>
                                <th>Carga</th>
                                <th>Peso</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="inventoryList">
                            ${itemRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4">
                                    <div class="inventory-stats">
                                        <div class="stat-item">
                                            <span class="stat-label">Peso Atual:</span>
                                            <span class="stat-value" id="pesoAtual">${this.data.pesoAtual.toFixed(1)}</span>
                                            <span class="stat-separator">/</span>
                                            <span class="stat-label">Peso Máx:</span>
                                            <span class="stat-value" id="pesoMaximo">${this.data.pesoMaximo}</span>
                                            <span class="stat-unit">kg</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Espaço Atual:</span>
                                            <span class="stat-value" id="espacoAtual">${this.data.espacoAtual}</span>
                                            <span class="stat-separator">/</span>
                                            <span class="stat-label">Espaço Total:</span>
                                            <input type="number" id="espacoTotal" class="stat-value-input" 
                                                   value="${this.data.espacoTotal}" min="6" placeholder="6">
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <button type="button" class="btn-add-item">+ Adicionar Item</button>
            </section>
        `;
    }

    attachListeners() {
        // Add item button
        const addBtn = this.container.querySelector('.btn-add-item');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addItem());
        }

        // Remove item buttons
        const removeBtns = this.container.querySelectorAll('.btn-remove-item');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeItem(index);
            });
        });

        // Item inputs
        const nameInputs = this.container.querySelectorAll('.item-name');
        nameInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleNameChange(e));
        });

        const quantityInputs = this.container.querySelectorAll('.item-quantity');
        quantityInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleQuantityChange(e));
        });

        const weightInputs = this.container.querySelectorAll('.item-weight');
        weightInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleWeightChange(e));
        });

        // Espaço Total input (editável)
        const espacoTotalInput = this.container.querySelector('#espacoTotal');
        if (espacoTotalInput) {
            espacoTotalInput.addEventListener('input', (e) => this.handleEspacoTotalChange(e));
            espacoTotalInput.addEventListener('change', (e) => this.handleEspacoTotalChange(e));
        }
    }

    handleEspacoTotalChange(event) {
        const value = parseInt(event.target.value) || 6;
        // Calcular o valor mínimo baseado no bônus do armamento
        const armamentoName = this.identityData?.armamentoName || '';
        const armamentoBonuses = Inventory.getArmamentoBonuses(armamentoName);
        const minValue = 6 + armamentoBonuses.espacoTotalBonus;
        
        // Garantir que o valor mínimo é o base + bônus do armamento
        if (value < minValue) {
            this.data.espacoTotal = minValue;
            event.target.value = minValue;
        } else {
            this.data.espacoTotal = value;
        }
        emit('inventory:updated', this.data);
    }

    addItem() {
        this.data.items.push({
            name: '',
            quantity: 0,
            weight: 0
        });
        this.render();
        this.attachListeners();
        this.updateStats();
        emit('inventory:updated', this.data);
    }

    removeItem(index) {
        this.data.items.splice(index, 1);
        this.render();
        this.attachListeners();
        this.updateStats();
        emit('inventory:updated', this.data);
    }

    handleNameChange(event) {
        const index = parseInt(event.target.dataset.index);
        this.data.items[index].name = event.target.value;
        this.updateStats();
        emit('inventory:updated', this.data);
    }

    handleQuantityChange(event) {
        const index = parseInt(event.target.dataset.index);
        this.data.items[index].quantity = parseInt(event.target.value) || 0;
        this.updateStats();
        emit('inventory:updated', this.data);
    }

    handleWeightChange(event) {
        const index = parseInt(event.target.dataset.index);
        this.data.items[index].weight = parseFloat(event.target.value) || 0;
        this.updateStats();
        emit('inventory:updated', this.data);
    }

    updateStats() {
        // Calculate peso atual: soma dos pesos dos itens (sem considerar quantidade/carga)
        const pesoAtualEl = this.container.querySelector('#pesoAtual');
        if (pesoAtualEl) {
            this.data.pesoAtual = this.data.items.reduce((sum, item) => {
                const weight = parseFloat(item.weight) || 0;
                return sum + weight;
            }, 0);
            pesoAtualEl.textContent = this.data.pesoAtual.toFixed(1);
        }
        
        // Calculate espaço atual: soma das cargas (quantities) dos itens
        const espacoAtualEl = this.container.querySelector('#espacoAtual');
        if (espacoAtualEl) {
            this.data.espacoAtual = this.data.items.reduce((sum, item) => {
                const quantity = parseInt(item.quantity) || 0;
                return sum + quantity;
            }, 0);
            espacoAtualEl.textContent = this.data.espacoAtual;
        }
        
        // Espaço Total não é calculado automaticamente, é editável pelo usuário
        // Mantemos o valor atual que o usuário definiu
    }

    getData() {
        return {
            items: [...this.data.items],
            pesoAtual: this.data.pesoAtual,
            pesoMaximo: this.data.pesoMaximo,
            espacoAtual: this.data.espacoAtual,
            espacoTotal: this.data.espacoTotal
        };
    }

    setData(data) {
        // Calculate base espaço total (will be updated when armamento is known)
        const baseEspacoTotal = data?.espacoTotal || 6;
        
        this.data = {
            items: Array.isArray(data?.items) ? data.items : [],
            pesoAtual: data?.pesoAtual || data?.pesoTotal || 0, // Compatibilidade com dados antigos
            pesoMaximo: data?.pesoMaximo || 0,
            espacoAtual: data?.espacoAtual || 0,
            espacoTotal: baseEspacoTotal // Será atualizado quando o armamento for conhecido
        };
        this.render();
        this.attachListeners();
        this.updateStats();
        
        // Trigger recalculation after setting data
        setTimeout(() => {
            this.recalculatePesoMaximo();
        }, 100);
    }

    // Method to be called from orchestrator to pass other components' data
    setCalculationData(attributesData, identityData) {
        this.attributesData = attributesData;
        this.identityData = identityData;
        this.recalculatePesoMaximo();
    }
}

export default Inventory;

