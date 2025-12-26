// ========================================
// HUMANITY SYSTEM COMPONENT
// Visual slider with exact markers: -100%, -90%, -80%, -65%, -50%, -40%, -1%, 0%, 1%, 40%, 50%, 65%, 80%, 90%, 100%
// ========================================

import { emit } from '../utils/events.js';

class HumanitySystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.markers = [-100, -90, -80, -65, -50, -40, -1, 0, 1, 40, 50, 65, 80, 90, 100];
        this.data = {
            humanity: 0
        };
        this.init();
    }

    init() {
        this.render();
        this.attachListeners();
    }

    render() {
        const markers = this.markers.map(marker => {
            const isSelected = this.data.humanity === marker;
            return `
                <div class="humanity-marker ${isSelected ? 'selected' : ''}" 
                     data-value="${marker}" 
                     title="${marker}%">
                    <span class="marker-label">${marker}%</span>
                    <span class="marker-dot"></span>
                </div>
            `;
        }).join('');

        this.container.innerHTML = `
            <section class="section humanity-system">
                <h3>SISTEMA DE HUMANIDADE</h3>
                <div class="humanity-container">
                    <div class="humanity-slider">
                        ${markers}
                    </div>
                    <div class="humanity-value-display">
                        <span class="humanity-label">Valor Atual:</span>
                        <span class="humanity-current">${this.data.humanity}%</span>
                    </div>
                </div>
            </section>
        `;
    }

    attachListeners() {
        const markers = this.container.querySelectorAll('.humanity-marker');
        markers.forEach(marker => {
            marker.addEventListener('click', (e) => {
                const value = parseInt(e.currentTarget.dataset.value);
                this.setHumanity(value);
            });
        });
    }

    setHumanity(value) {
        this.data.humanity = value;
        this.render();
        this.attachListeners();
        emit('humanity:updated', this.data);
    }

    getData() {
        return { ...this.data };
    }

    setData(data) {
        this.data = {
            humanity: data?.humanity !== undefined ? data.humanity : 0
        };
        this.render();
        this.attachListeners();
    }
}

export default HumanitySystem;

