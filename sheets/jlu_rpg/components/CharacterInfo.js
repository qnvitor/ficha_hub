// ========================================
// CHARACTER INFO COMPONENT
// Manages: Name, Identity, Image, Tier, PAX, Origin, Archetype
// ========================================

import { emit, on } from '../utils/events.js';
import { TIER_DATA } from '../data/tierData.js';

class CharacterInfo {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            heroName: '',
            secretIdentity: '',
            imageUrl: '',
            tier: '',
            paxTotal: 0,
            paxGastos: 0,
            paxDisponiveis: 0,
            origin: '',
            archetype: ''
        };
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
    }

    subscribeToEvents() {
        // Listen for PAX spent on attributes
        on('attributes:pax-updated', (data) => {
            this.attributesPax = data.paxGastos || 0;
            this.calculatePAX();
        });

        // Listen for PAX spent on capabilities
        on('capabilities:pax-updated', (data) => {
            this.capabilitiesPax = data.paxGastos || 0;
            this.calculatePAX();
        });

        // Listen for DET. COMPRADO (each costs 2 PAX)
        on('determination:purchased', (data) => {
            this.determinationPax = (data.detComprado || 0) * 2;
            this.calculatePAX();
        });

        // Listen for Knowledge (each costs 4 PAX)
        on('knowledge:pax-updated', (data) => {
            this.knowledgePax = data.paxGastos || 0;
            this.calculatePAX();
        });

        // Listen for Traits PAX
        on('traits:pax-updated', (data) => {
            this.traitsPax = data.paxGastos || 0;
            this.calculatePAX();
        });

        // Listen for Items PAX
        on('items:pax-updated', (data) => {
            this.itemsPax = data.paxGastos || 0;
            this.calculatePAX();
        });
    }

    calculatePAX() {
        const attributesPax = this.attributesPax || 0;
        const capabilitiesPax = this.capabilitiesPax || 0;
        const determinationPax = this.determinationPax || 0;
        const knowledgePax = this.knowledgePax || 0;
        const traitsPax = this.traitsPax || 0;
        const itemsPax = this.itemsPax || 0;

        this.data.paxGastos = attributesPax + capabilitiesPax + determinationPax + knowledgePax + traitsPax + itemsPax;
        this.data.paxDisponiveis = this.data.paxTotal - this.data.paxGastos;

        // Update display
        const paxGastosInput = document.getElementById('paxGastos');
        const paxDisponiveisInput = document.getElementById('paxDisponiveis');

        if (paxGastosInput) paxGastosInput.value = this.data.paxGastos;
        if (paxDisponiveisInput) paxDisponiveisInput.value = this.data.paxDisponiveis;

        // Emit event
        emit('pax:updated', {
            paxTotal: this.data.paxTotal,
            paxGastos: this.data.paxGastos,
            paxDisponiveis: this.data.paxDisponiveis
        });
    }

    render() {
        this.container.innerHTML = `
            <section class="section identification">
                <h3>IDENTIFICAÇÃO E INFORMAÇÕES</h3>
                <div class="identification-layout">
                    <!-- Coluna Esquerda: Imagem -->
                    <div class="identification-image-column">
                        <div class="form-group character-image-group">
                            <label for="characterImageUrl">Imagem do Personagem</label>
                            
                            <!-- Área de Drag and Drop -->
                            <div class="image-drop-zone" id="imageDropZone" style="display: ${this.data.imageUrl ? 'none' : 'flex'};">
                                <div class="drop-zone-content">
                                    <div class="drop-zone-icon">📷</div>
                                    <p class="drop-zone-text">Arraste uma imagem aqui ou cole uma URL</p>
                                    <p class="drop-zone-hint">Você pode arrastar imagens de outras abas do navegador</p>
                                </div>
                                <input type="url" 
                                       id="characterImageUrl" 
                                       class="image-url-input"
                                       placeholder="https://exemplo.com/imagem.jpg" 
                                       value="${this.data.imageUrl && (this.data.imageUrl.startsWith('http://') || this.data.imageUrl.startsWith('https://') || this.data.imageUrl.startsWith('blob:')) ? this.data.imageUrl : ''}">
                            </div>
                            
                            <!-- Preview da Imagem -->
                            <div class="image-preview-container" id="imagePreviewContainer" style="display: ${this.data.imageUrl ? 'flex' : 'none'};">
                                <img id="characterImagePreview" 
                                     src="${this.data.imageUrl || ''}" 
                                     alt="Personagem"
                                     onerror="this.onerror=null; this.style.display='none'; const container = document.getElementById('imagePreviewContainer'); if(container) container.style.display='none';">
                                <button type="button" class="btn-remove-image" id="btnRemoveImage">🗑️ Remover</button>
                            </div>
                            
                            <!-- Mensagem de erro -->
                            <div class="image-error-message" id="imageErrorMessage" style="display: none;"></div>
                        </div>
                    </div>
                    
                    <!-- Coluna Direita: Campos de Informação -->
                    <div class="identification-fields-column">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="heroName">Nome do Herói</label>
                                <input type="text" id="heroName" placeholder="Ex: Superman" value="${this.data.heroName}">
                            </div>
                            <div class="form-group">
                                <label for="secretIdentity">Identidade Secreta</label>
                                <input type="text" id="secretIdentity" placeholder="Ex: Clark Kent" value="${this.data.secretIdentity}">
                            </div>
                            <div class="form-group">
                                <label for="archetype">Arquétipo</label>
                                <input type="text" id="archetype" placeholder="Ex: Alienígena" value="${this.data.archetype}">
                            </div>
                            <div class="form-group">
                                <label for="origin">Origem</label>
                                <input type="text" id="origin" placeholder="Ex: Krypton" value="${this.data.origin}">
                            </div>
                            <div class="form-group">
                                <label for="tier">Tier</label>
                                <select id="tier">
                                    <option value="">Selecione</option>
                                    <option value="D" ${this.data.tier === 'D' ? 'selected' : ''}>D</option>
                                    <option value="C" ${this.data.tier === 'C' ? 'selected' : ''}>C</option>
                                    <option value="B" disabled ${this.data.tier === 'B' ? 'selected' : ''}>B (Em breve)</option>
                                    <option value="A" disabled ${this.data.tier === 'A' ? 'selected' : ''}>A (Em breve)</option>
                                    <option value="S" disabled ${this.data.tier === 'S' ? 'selected' : ''}>S (Em breve)</option>
                                </select>
                            </div>
                        </div>
                        
                        <h4 style="margin-top: 20px; margin-bottom: 10px;">PONTOS DE ASCENSÃO (PAX)</h4>
                        <div class="pax-grid">
                            <div class="form-group">
                                <label for="paxTotal">PAX TOTAL</label>
                                <input type="number" id="paxTotal" value="${this.data.paxTotal}" min="0">
                            </div>
                            <div class="form-group">
                                <label for="paxGastos">PAX GASTOS</label>
                                <input type="number" id="paxGastos" value="${this.data.paxGastos}" readonly>
                            </div>
                            <div class="form-group highlight">
                                <label for="paxDisponiveis">PAX DISPONÍVEIS</label>
                                <input type="number" id="paxDisponiveis" value="${this.data.paxDisponiveis}" readonly>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    attachListeners() {
        const tierSelect = this.container.querySelector('#tier');
        const paxTotalInput = this.container.querySelector('#paxTotal');
        const heroName = this.container.querySelector('#heroName');
        const secretIdentity = this.container.querySelector('#secretIdentity');
        const archetype = this.container.querySelector('#archetype');
        const origin = this.container.querySelector('#origin');

        if (tierSelect) {
            tierSelect.addEventListener('change', () => {
                this.data.tier = tierSelect.value;
                const tierData = TIER_DATA[tierSelect.value];

                // Auto-fill PAX total when tier is selected
                if (tierData && paxTotalInput) {
                    this.data.paxTotal = tierData.pax;
                    paxTotalInput.value = tierData.pax;
                    this.calculatePAX();
                }

                emit('tier:changed', {
                    tier: tierSelect.value,
                    tierData: tierData
                });
                emit('character:updated', this.data);
            });
        }

        // Allow manual PAX Total editing
        if (paxTotalInput) {
            paxTotalInput.addEventListener('input', () => {
                this.data.paxTotal = parseInt(paxTotalInput.value) || 0;
                this.calculatePAX();
                emit('character:updated', this.data);
            });
        }

        [heroName, secretIdentity, archetype, origin].forEach(input => {
            if (input) {
                input.addEventListener('change', () => {
                    this.data[input.id] = input.value;
                    emit('character:updated', this.data);
                });
            }
        });

        // Setup drag and drop para imagem
        this.setupDragAndDrop();

        // Listener para botão remover imagem
        const btnRemove = document.getElementById('btnRemoveImage');
        if (btnRemove) {
            btnRemove.addEventListener('click', () => this.removeImage());
        }
    }

    // ========================================
    // IMAGE UPLOAD - DRAG AND DROP METHODS
    // ========================================

    setupDragAndDrop() {
        const dropZone = document.getElementById('imageDropZone');
        const urlInput = document.getElementById('characterImageUrl');
        
        if (!dropZone) return;
        
        // Prevenir comportamento padrão do navegador
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        // Visual feedback ao arrastar sobre a zona
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });
        
        // Processar quando soltar
        dropZone.addEventListener('drop', async (e) => {
            const dt = e.dataTransfer;
            
            // Verificar se há arquivos (drag de arquivo local)
            if (dt.files && dt.files.length > 0) {
                const file = dt.files[0];
                if (file.type.startsWith('image/')) {
                    await this.handleFileDrop(file);
                } else {
                    this.showError('Por favor, solte apenas arquivos de imagem.');
                }
                return;
            }
            
            // Verificar se há URL de texto (drag de outra aba)
            const url = dt.getData('text/plain') || dt.getData('text/uri-list') || dt.getData('URL');
            
            if (url) {
                // Verificar se parece uma URL de imagem
                if (this.isImageUrl(url)) {
                    await this.handleUrlInput(url);
                } else {
                    this.showError('Por favor, arraste uma imagem ou cole uma URL de imagem válida.');
                }
            } else {
                // Tentar pegar HTML (pode conter URL de imagem)
                const html = dt.getData('text/html');
                if (html) {
                    const imageUrl = this.extractImageUrlFromHtml(html);
                    if (imageUrl) {
                        await this.handleUrlInput(imageUrl);
                    } else {
                        this.showError('Não foi possível encontrar uma URL de imagem no conteúdo arrastado.');
                    }
                }
            }
        });
        
        // Suporte para colar URL (Ctrl+V)
        if (urlInput) {
            urlInput.addEventListener('paste', async (e) => {
                setTimeout(async () => {
                    const pastedUrl = urlInput.value.trim();
                    if (pastedUrl && this.isImageUrl(pastedUrl)) {
                        await this.handleUrlInput(pastedUrl);
                    }
                }, 10);
            });
            
            // Suporte para input manual de URL
            urlInput.addEventListener('blur', async () => {
                const url = urlInput.value.trim();
                if (url && this.isImageUrl(url)) {
                    await this.handleUrlInput(url);
                }
            });
        }
    }

    // Verificar se é uma URL de imagem
    isImageUrl(url) {
        if (!url) return false;
        
        // Verificar se é uma URL válida
        try {
            const urlObj = new URL(url);
            // Verificar extensão de imagem comum
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
            const pathname = urlObj.pathname.toLowerCase();
            const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
            
            // Ou verificar se o tipo de conteúdo pode ser imagem
            return hasImageExtension || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:');
        } catch {
            // Se não for uma URL válida, ainda pode ser um caminho relativo ou blob
            return url.startsWith('blob:') || url.startsWith('data:');
        }
    }

    // Extrair URL de imagem de HTML
    extractImageUrlFromHtml(html) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const img = doc.querySelector('img');
            return img ? img.src : null;
        } catch (error) {
            console.error('Error parsing HTML:', error);
            return null;
        }
    }

    // Processar arquivo arrastado (convertê-lo para URL temporária)
    async handleFileDrop(file) {
        // Criar URL temporária para o arquivo
        const objectUrl = URL.createObjectURL(file);
        
        // Validar se é realmente uma imagem
        try {
            await this.validateImageUrl(objectUrl);
            this.data.imageUrl = objectUrl;
            this.updateImagePreview(objectUrl);
            
            // Avisar que blob: URLs não são persistentes
            this.showWarning('⚠️ Arquivo local carregado. Use uma URL externa (ex: Imgur) para salvar permanentemente. Esta imagem será perdida ao recarregar a página.');
            
            emit('character:updated', this.data);
        } catch (error) {
            URL.revokeObjectURL(objectUrl);
            this.showError('Erro ao processar imagem: ' + error.message);
        }
    }

    // Processar URL de imagem
    async handleUrlInput(url) {
        url = url.trim();
        
        if (!url) return;
        
        // Validar URL
        try {
            await this.validateImageUrl(url);
            this.data.imageUrl = url;
            this.updateImagePreview(url);
            emit('character:updated', this.data);
            this.hideError();
            
            // Atualizar input se necessário
            const urlInput = document.getElementById('characterImageUrl');
            if (urlInput && urlInput.value !== url) {
                urlInput.value = url;
            }
        } catch (error) {
            this.showError('URL de imagem inválida ou inacessível. Verifique se a URL está correta e se a imagem permite acesso externo (CORS).');
        }
    }

    // Validar URL de imagem
    validateImageUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            let resolved = false;
            
            img.onload = () => {
                if (!resolved) {
                    resolved = true;
                    resolve(true);
                }
            };
            
            img.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    reject(new Error('Não foi possível carregar a imagem. Verifique se a URL está correta e se permite acesso externo (CORS).'));
                }
            };
            
            // Timeout de 10 segundos
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    reject(new Error('Tempo limite excedido ao carregar a imagem.'));
                }
            }, 10000);
            
            // Tentar carregar a imagem
            img.crossOrigin = 'anonymous'; // Tentar evitar problemas de CORS
            img.src = url;
        });
    }

    // Atualizar preview
    updateImagePreview(imageUrl) {
        const preview = document.getElementById('characterImagePreview');
        const container = document.getElementById('imagePreviewContainer');
        const dropZone = document.getElementById('imageDropZone');
        
        if (preview && container) {
            if (imageUrl) {
                preview.src = imageUrl;
                preview.style.display = 'block';
                container.style.display = 'flex';
                // Esconder área de drag and drop quando há imagem
                if (dropZone) {
                    dropZone.style.display = 'none';
                }
            } else {
                preview.src = '';
                preview.style.display = 'none';
                container.style.display = 'none';
                // Mostrar área de drag and drop quando não há imagem
                if (dropZone) {
                    dropZone.style.display = '';
                }
            }
        }
    }

    // Remover imagem
    removeImage() {
        // Revogar URL de objeto se for uma URL temporária
        if (this.data.imageUrl && this.data.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(this.data.imageUrl);
        }
        
        this.data.imageUrl = '';
        this.updateImagePreview('');
        
        const urlInput = document.getElementById('characterImageUrl');
        if (urlInput) {
            urlInput.value = '';
        }
        
        emit('character:updated', this.data);
        this.hideError();
    }

    // Mostrar erro
    showError(message) {
        const errorEl = document.getElementById('imageErrorMessage');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            errorEl.classList.remove('image-warning-message');
            errorEl.classList.add('image-error-message');
        }
    }

    // Mostrar aviso (não é erro, apenas informação)
    showWarning(message) {
        const errorEl = document.getElementById('imageErrorMessage');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            errorEl.classList.remove('image-error-message');
            errorEl.classList.add('image-warning-message');
        }
    }

    // Esconder erro/aviso
    hideError() {
        const errorEl = document.getElementById('imageErrorMessage');
        if (errorEl) {
            errorEl.style.display = 'none';
            errorEl.classList.remove('image-error-message', 'image-warning-message');
        }
    }

    getData() {
        // Criar cópia dos dados para não modificar o original
        const dataCopy = { ...this.data };
        
        // Blob: URLs não podem ser serializadas em JSON e não persistem após recarregar
        // Se houver blob: URL, limpar antes de salvar (usuário precisa usar URL externa)
        if (dataCopy.imageUrl && dataCopy.imageUrl.startsWith('blob:')) {
            // Limpar blob: URL antes de salvar (não pode ser serializada)
            // O usuário já foi avisado quando arrastou o arquivo
            dataCopy.imageUrl = '';
        }
        
        return dataCopy;
    }

    setData(data) {
        this.data = { ...this.data, ...data };
        this.render();
        this.attachListeners();
        this.subscribeToEvents();
        
        // Carregar imagem se existir
        if (this.data.imageUrl) {
            // Usar setTimeout para garantir que DOM está pronto
            setTimeout(() => {
                this.updateImagePreview(this.data.imageUrl);
            }, 0);
        }
    }
}

export default CharacterInfo;
