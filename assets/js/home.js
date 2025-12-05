// ========================================
// HOME PAGE NAVIGATION - RPG Sheet Hub
// ========================================

/**
 * Navigate to selected RPG sheet
 * @param {string} sheetId - ID of the sheet system (e.g., 'jlu', 'dnd')
 */
function selectSheet(sheetId) {
    const sheetRoutes = {
        'jlu': 'sheets/jlu_rpg/jlu.html',
        'dnd': 'sheets/dnd5e/dnd.html',
        'generic': 'sheets/generic/generic.html'
    };

    const route = sheetRoutes[sheetId];

    if (route) {
        window.location.href = route;
    } else {
        console.error(`Sheet "${sheetId}" not found`);
    }
}

// Optional: Add keyboard navigation
document.addEventListener('keydown', (e) => {
    const cards = document.querySelectorAll('.sheet-card:not(.coming-soon)');

    if (e.key === 'Enter' && document.activeElement.classList.contains('sheet-card')) {
        const sheetId = document.activeElement.dataset.sheet;
        if (sheetId) selectSheet(sheetId);
    }
});

// Make cards focusable for accessibility
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.sheet-card:not(.coming-soon)');
    cards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.style.cursor = 'pointer';

        // Allow clicking the entire card
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-select')) {
                const sheetId = card.dataset.sheet;
                if (sheetId) selectSheet(sheetId);
            }
        });
    });
});
