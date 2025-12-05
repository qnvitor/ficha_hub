// ========================================
// CALCULATIONS UTILITIES
// Shared calculation functions
// ========================================

/**
 * Calculate total of attribute (Base + Comprado + Mod)
 * @param {number} base - Base value
 * @param {number} comprado - Purchased value
 * @param {number} mod - Modifier value
 * @returns {number} Total
 */
export function calculateTotal(base, comprado, mod) {
    return (base || 0) + (comprado || 0) + (mod || 0);
}

/**
 * Calculate grade from PAX (PAX / 4)
 * @param {number} pax - PAX points
 * @returns {number} Grade
 */
export function calculateGrade(pax) {
    return Math.floor((pax || 0) / 4);
}

/**
 * Validate a number is within range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Validated value
 */
export function validateNumber(value, min = -Infinity, max = Infinity) {
    const num = parseInt(value) || 0;
    return Math.max(min, Math.min(max, num));
}

/**
 * Calculate total penalty from conditions
 * @param {Object} conditions - Conditions object with boolean values
 * @param {Array} conditionsArray - Array of condition definitions
 * @returns {number} Total penalty
 */
export function calculatePenalty(conditions, conditionsArray) {
    let totalPenalty = 0;

    conditionsArray.forEach(condition => {
        if (conditions[condition.id]) {
            totalPenalty = Math.min(totalPenalty, condition.value);
        }
    });

    return totalPenalty;
}

/**
 * Format number with sign (+ or -)
 * @param {number} value - Number to format
 * @returns {string} Formatted string
 */
export function formatWithSign(value) {
    const num = parseInt(value) || 0;
    return num >= 0 ? `+${num}` : `${num}`;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export default {
    calculateTotal,
    calculateGrade,
    validateNumber,
    calculatePenalty,
    formatWithSign,
    clamp
};
