// ========================================
// CHARACTER IMAGE COMPONENT (Wrapper for FDD RPG)
// Wraps the shared CharacterImage component
// ========================================

import { CharacterImage } from '../../../assets/js/components/CharacterImage.js';
import { emit } from '../utils/events.js';

class CharacterImageWrapper {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            imageUrl: ''
        };
        
        // Create inner container for the shared component
        this.innerContainerId = 'character-image-inner-container';
        this.imageComponent = null;
        this.init();
    }

    init() {
        this.render();
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            this.initSharedComponent();
        }, 0);
    }

    render() {
        this.container.innerHTML = `
            <section class="section character-image">
                <h3>IMAGEM DO PERSONAGEM</h3>
                <div id="${this.innerContainerId}"></div>
            </section>
        `;
    }

    initSharedComponent() {
        const innerContainer = document.getElementById(this.innerContainerId);
        if (!innerContainer) {
            // Retry if container not ready
            setTimeout(() => this.initSharedComponent(), 50);
            return;
        }

        // Initialize the shared component
        this.imageComponent = new CharacterImage(this.innerContainerId, {
            onUpdate: (data) => {
                this.data.imageUrl = data.imageUrl;
                emit('image:updated', this.data);
            },
            events: { emit },
            eventName: 'image:updated'
        });

        // Load existing data if available
        if (this.data.imageUrl) {
            this.imageComponent.setData({ imageUrl: this.data.imageUrl });
        }
    }

    getData() {
        if (this.imageComponent) {
            const imageData = this.imageComponent.getData();
            this.data.imageUrl = imageData.imageUrl;
        }
        return { ...this.data };
    }

    setData(data) {
        this.data = {
            imageUrl: data?.imageUrl || ''
        };
        
        if (this.imageComponent) {
            this.imageComponent.setData({ imageUrl: this.data.imageUrl });
        } else {
            // If component not initialized yet, wait and try again
            setTimeout(() => {
                if (this.imageComponent) {
                    this.imageComponent.setData({ imageUrl: this.data.imageUrl });
                } else {
                    // Reinit if still not ready
                    this.render();
                }
            }, 100);
        }
    }
}

export default CharacterImageWrapper;
