// scripts/ui-icons.js - Memory-efficient SVG icon system

/**
 * Icon utility class for performance-optimized SVG icons
 * Uses sprite system to minimize memory usage and HTTP requests
 */
class IconSystem {
    constructor() {
        this.iconsLoaded = false;
        this.loadIcons();
    }

    /**
     * Load SVG sprite into the DOM for use
     */
    async loadIcons() {
        if (this.iconsLoaded) return;

        try {
            const response = await fetch('./assets/icons.svg');
            const svgText = await response.text();
            
            // Create a hidden container for the SVG sprite
            const container = document.createElement('div');
            container.style.display = 'none';
            container.innerHTML = svgText;
            
            // Insert at the beginning of body
            document.body.insertBefore(container, document.body.firstChild);
            
            this.iconsLoaded = true;
        } catch (error) {
            console.warn('Failed to load icon sprite:', error);
        }
    }

    /**
     * Create an SVG icon element
     * @param {string} iconName - Name of the icon (without 'icon-' prefix)
     * @param {Object} options - Icon options
     * @param {string} options.size - Size of icon ('sm', 'md', 'lg', or custom CSS value)
     * @param {string} options.className - Additional CSS classes
     * @param {string} options.ariaLabel - Accessibility label
     * @returns {HTMLElement} SVG icon element
     */
    createIcon(iconName, options = {}) {
        const {
            size = 'md',
            className = '',
            ariaLabel = iconName
        } = options;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        
        // Set up the use element to reference the sprite
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#icon-${iconName}`);
        
        // Set up the SVG element
        svg.appendChild(use);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', ariaLabel);
        
        // Apply size classes
        const sizeClasses = {
            'xs': 'icon-xs',
            'sm': 'icon-sm', 
            'md': 'icon-md',
            'lg': 'icon-lg',
            'xl': 'icon-xl'
        };
          const sizeClass = sizeClasses[size] || 'icon-md';
        // Use setAttribute for SVG elements instead of className
        svg.setAttribute('class', `icon ${sizeClass} ${className}`.trim());
        
        // For custom sizes, set style directly
        if (!sizeClasses[size] && size) {
            svg.style.width = size;
            svg.style.height = size;
        }
        
        return svg;
    }

    /**
     * Create role-specific icon with theming
     * @param {string} role - Role name ('tank', 'damage', 'support')
     * @param {Object} options - Icon options
     * @returns {HTMLElement} Themed role icon
     */
    createRoleIcon(role, options = {}) {
        const roleIcons = {
            'tank': 'shield',
            'damage': 'target',
            'support': 'heart'
        };
        
        const iconName = roleIcons[role.toLowerCase()] || 'star';
        const icon = this.createIcon(iconName, {
            ...options,
            className: `role-icon role-${role.toLowerCase()} ${options.className || ''}`.trim()
        });
        
        return icon;
    }

    /**
     * Create status icon with appropriate styling
     * @param {string} status - Status ('completed', 'in-progress', 'pending')
     * @param {Object} options - Icon options
     * @returns {HTMLElement} Status icon
     */
    createStatusIcon(status, options = {}) {
        const statusIcons = {
            'completed': 'check',
            'in-progress': 'clock',
            'pending': 'minus'
        };
        
        const iconName = statusIcons[status] || 'clock';
        const icon = this.createIcon(iconName, {
            ...options,
            className: `status-icon status-${status} ${options.className || ''}`.trim()
        });
        
        return icon;
    }

    /**
     * Replace text-based icons with SVG icons in an element
     * @param {HTMLElement} container - Container to search within
     */
    replaceTextIcons(container = document) {
        // Find elements with data-icon attribute
        const iconElements = container.querySelectorAll('[data-icon]');
        
        iconElements.forEach(element => {
            const iconName = element.getAttribute('data-icon');
            const size = element.getAttribute('data-icon-size') || 'md';
            const className = element.getAttribute('data-icon-class') || '';
            
            const icon = this.createIcon(iconName, { size, className });
            
            // Replace the element's content with the icon
            element.innerHTML = '';
            element.appendChild(icon);
        });
    }

    /**
     * Create animated loading icon
     * @param {Object} options - Icon options
     * @returns {HTMLElement} Animated loading icon
     */
    createLoadingIcon(options = {}) {
        const icon = this.createIcon('clock', {
            ...options,
            className: `loading-icon ${options.className || ''}`.trim()
        });
        
        // Add rotation animation
        icon.style.animation = 'iconSpin 1s linear infinite';
        
        return icon;
    }
}

// CSS for icon system
const iconCSS = `
    .icon {
        display: inline-block;
        vertical-align: middle;
        fill: currentColor;
        flex-shrink: 0;
    }
    
    .icon-xs { width: 12px; height: 12px; }
    .icon-sm { width: 16px; height: 16px; }
    .icon-md { width: 20px; height: 20px; }
    .icon-lg { width: 24px; height: 24px; }
    .icon-xl { width: 32px; height: 32px; }
    
    .role-icon.role-tank { color: var(--tank-primary, #1565C0); }
    .role-icon.role-damage { color: var(--damage-primary, #D32F2F); }
    .role-icon.role-support { color: var(--support-primary, #388E3C); }
    
    .status-icon.status-completed { color: var(--support-primary, #4CAF50); }
    .status-icon.status-in-progress { color: var(--damage-primary, #FF9800); }
    .status-icon.status-pending { color: var(--current-text-color); opacity: 0.5; }
    
    .loading-icon {
        animation: iconSpin 1s linear infinite;
    }
    
    @keyframes iconSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .icon {
            filter: contrast(1.5);
        }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        .loading-icon {
            animation: none;
        }
    }
`;

// Inject CSS
if (!document.querySelector('#icon-system-styles')) {
    const style = document.createElement('style');
    style.id = 'icon-system-styles';
    style.textContent = iconCSS;
    document.head.appendChild(style);
}

// Create global instance
window.IconSystem = new IconSystem();

// Export for module use
export { IconSystem };

// Auto-replace icons when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.IconSystem.replaceTextIcons();
});

// Also replace icons when content is dynamically added
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    window.IconSystem.replaceTextIcons(node);
                }
            });
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
