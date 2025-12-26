// ========================================
// NOTIFICATION SYSTEM (Reusable)
// Toast-style notifications for user feedback
// Can be used across multiple RPG sheets
// ========================================

/**
 * Show a notification to the user
 * @param {string} message - Message to display
 * @param {string} type - Type of notification: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications to avoid stacking
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => {
        notif.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notif.remove(), 300);
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Set styles based on type
    const styles = {
        success: {
            background: '#27ae60',
            color: 'white'
        },
        error: {
            background: '#e74c3c',
            color: 'white'
        },
        warning: {
            background: '#f39c12',
            color: 'white'
        },
        info: {
            background: '#3498db',
            color: 'white'
        }
    };

    const style = styles[type] || styles.info;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${style.background};
        color: ${style.color};
        border-radius: 6px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        word-wrap: break-word;
    `;

    // Add to body
    document.body.appendChild(notification);

    // Add CSS animations if not already present
    if (!document.getElementById('notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Remove after duration
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, duration);

    return notification;
}

/**
 * Show success notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showSuccess(message, duration = 3000) {
    return showNotification(message, 'success', duration);
}

/**
 * Show error notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showError(message, duration = 3000) {
    return showNotification(message, 'error', duration);
}

/**
 * Show warning notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showWarning(message, duration = 3000) {
    return showNotification(message, 'warning', duration);
}

/**
 * Show info notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showInfo(message, duration = 3000) {
    return showNotification(message, 'info', duration);
}

export default {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
};

