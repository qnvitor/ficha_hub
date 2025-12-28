// ========================================
// CHARACTER IMAGE COMPONENT (Reusable)
// Manages: Image URL with preview, drag and drop, file upload
// Can be used across multiple RPG sheets
// ========================================

/**
 * CharacterImage - Reusable component for character image upload
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Configuration options
 * @param {Function} options.onUpdate - Callback when image is updated (receives data object)
 * @param {Object} options.events - Event system (must have emit function)
 */
export class CharacterImage {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`CharacterImage: Container with id "${containerId}" not found`);
            return;
        }

        this.options = {
            onUpdate: options.onUpdate || (() => {}),
            events: options.events || null,
            eventName: options.eventName || 'image:updated',
            ...options
        };

        this.data = {
            imageUrl: ''
        };
        
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
    }

    render() {
        // Determinar o valor do input URL (não mostrar base64, apenas URLs externas)
        const urlValue = this.data.imageUrl && 
                        (this.data.imageUrl.startsWith('http://') || 
                         this.data.imageUrl.startsWith('https://') || 
                         this.data.imageUrl.startsWith('blob:')) 
                        ? this.data.imageUrl : '';
        
        this.container.innerHTML = `
            <div class="character-image-group">
                <!-- Área de Drag and Drop -->
                <div class="image-drop-zone" id="imageDropZone" style="display: ${this.data.imageUrl ? 'none' : 'flex'};">
                    <div class="drop-zone-content">
                        <div class="drop-zone-icon">📷</div>
                        <p class="drop-zone-text">Arraste uma imagem aqui ou cole uma URL</p>
                        <p class="drop-zone-hint">Você pode arrastar imagens de outras abas do navegador</p>
                    </div>
                    <div class="image-input-options">
                        <input type="url" 
                               id="characterImageUrl" 
                               class="image-url-input"
                               placeholder="https://exemplo.com/imagem.jpg" 
                               value="${urlValue}">
                        <span class="input-divider">ou</span>
                        <input type="file" 
                               id="characterImageFile" 
                               accept="image/*" 
                               style="display: none;">
                        <button type="button" 
                                class="btn-upload-file" 
                                id="btnUploadFile">📁 Escolher arquivo local</button>
                    </div>
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
        `;
    }

    attachListeners() {
        // Setup drag and drop
        this.setupDragAndDrop();

        // Listener para botão remover imagem
        const btnRemove = document.getElementById('btnRemoveImage');
        if (btnRemove) {
            btnRemove.addEventListener('click', () => this.removeImage());
        }

        // Listener para botão de upload de arquivo
        const btnUploadFile = document.getElementById('btnUploadFile');
        const fileInput = document.getElementById('characterImageFile');
        if (btnUploadFile && fileInput) {
            btnUploadFile.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    await this.handleFileUpload(file);
                } else if (file) {
                    this.showError('Por favor, selecione apenas arquivos de imagem.');
                }
                // Limpar o input para permitir selecionar o mesmo arquivo novamente
                fileInput.value = '';
            });
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
        
        // Verificar se é base64 (data:image)
        if (url.startsWith('data:image/')) {
            return true;
        }
        
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

    // Processar arquivo arrastado (convertê-lo para base64)
    async handleFileDrop(file) {
        await this.handleFileUpload(file);
    }

    // Processar upload de arquivo (converter para base64)
    async handleFileUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showError('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        // Verificar tamanho do arquivo (limite de 5MB para base64)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.showError('Arquivo muito grande. Por favor, use uma imagem menor que 5MB.');
            return;
        }

        try {
            // Converter arquivo para base64
            const base64 = await this.fileToBase64(file);
            
            // Validar se é realmente uma imagem
            await this.validateImageUrl(base64);
            
            this.data.imageUrl = base64;
            this.updateImagePreview(base64);
            this.hideError();
            
            this.notifyUpdate();
        } catch (error) {
            this.showError('Erro ao processar imagem: ' + error.message);
        }
    }

    // Converter arquivo para base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
                resolve(reader.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Erro ao ler o arquivo.'));
            };
            
            reader.readAsDataURL(file);
        });
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
            this.notifyUpdate();
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
                    dropZone.style.display = 'flex';
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
        
        const fileInput = document.getElementById('characterImageFile');
        if (fileInput) {
            fileInput.value = '';
        }
        
        this.notifyUpdate();
        this.hideError();
    }

    // Notificar atualização (via callback e/ou eventos)
    notifyUpdate() {
        if (this.options.onUpdate) {
            this.options.onUpdate(this.getData());
        }
        if (this.options.events && this.options.events.emit) {
            this.options.events.emit(this.options.eventName, this.getData());
        }
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

    // Métodos públicos para integração

    getData() {
        // Criar cópia dos dados para não modificar o original
        const dataCopy = { ...this.data };
        
        // Blob: URLs não podem ser serializadas em JSON e não persistem após recarregar
        // Se houver blob: URL, limpar antes de salvar (usuário precisa usar URL externa ou base64)
        if (dataCopy.imageUrl && dataCopy.imageUrl.startsWith('blob:')) {
            // Limpar blob: URL antes de salvar (não pode ser serializada)
            // O usuário já foi avisado quando arrastou o arquivo
            dataCopy.imageUrl = '';
        }
        
        // Base64 (data:image) pode ser serializado e exportado no JSON
        // URLs externas também podem ser serializadas
        
        return dataCopy;
    }

    setData(data) {
        this.data = {
            imageUrl: data?.imageUrl || ''
        };
        this.render();
        this.attachListeners();
        
        // Carregar imagem se existir
        if (this.data.imageUrl) {
            // Usar setTimeout para garantir que DOM está pronto
            setTimeout(() => {
                this.updateImagePreview(this.data.imageUrl);
                
                // Se for URL externa (não base64), atualizar o input URL
                if (this.data.imageUrl && 
                    (this.data.imageUrl.startsWith('http://') || 
                     this.data.imageUrl.startsWith('https://'))) {
                    const urlInput = document.getElementById('characterImageUrl');
                    if (urlInput) {
                        urlInput.value = this.data.imageUrl;
                    }
                }
            }, 0);
        }
    }
}

export default CharacterImage;

