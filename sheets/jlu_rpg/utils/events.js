// ========================================
// EVENT SYSTEM (Pub/Sub)
// Simple event emitter for component communication
// ========================================

const events = {};

/**
 * Emit an event with data
 * @param {string} eventName - Name of the event
 * @param {*} data - Data to pass to listeners
 */
export function emit(eventName, data) {
    if (events[eventName]) {
        events[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for "${eventName}":`, error);
            }
        });
    }
}

/**
 * Subscribe to an event
 * @param {string} eventName - Name of the event
 * @param {Function} callback - Callback function
 */
export function on(eventName, callback) {
    if (!events[eventName]) {
        events[eventName] = [];
    }
    events[eventName].push(callback);
}

/**
 * Unsubscribe from an event
 * @param {string} eventName - Name of the event
 * @param {Function} callback - Callback function to remove
 */
export function off(eventName, callback) {
    if (events[eventName]) {
        events[eventName] = events[eventName].filter(cb => cb !== callback);
    }
}

/**
 * Clear all listeners for an event
 * @param {string} eventName - Name of the event
 */
export function clearEvent(eventName) {
    if (events[eventName]) {
        delete events[eventName];
    }
}

/**
 * Clear all events
 */
export function clearAllEvents() {
    Object.keys(events).forEach(key => delete events[key]);
}

export default { emit, on, off, clearEvent, clearAllEvents };
