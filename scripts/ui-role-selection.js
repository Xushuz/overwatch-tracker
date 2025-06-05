// scripts/ui-role-selection.js
import { getAppState, updateAppState } from './app-state.js';
import { IconSystem } from './ui-icons.js';

// Role to icon mapping for display
const roleToIconMap = {
    'Tank': 'shield',
    'Damage': 'target', 
    'Support': 'heart'
};

// Fallback icon creation function
function createFallbackIcon(iconName, size = '16px') {
    const span = document.createElement('span');
    span.className = 'fallback-icon';
    span.style.display = 'inline-block';
    span.style.width = size;
    span.style.height = size;
    span.style.fontSize = size;
    span.style.lineHeight = '1';
    span.style.textAlign = 'center';
    
    // Fallback emojis for roles
    const fallbackIcons = {
        'shield': '🛡️',
        'target': '🎯',
        'heart': '❤️',
        'tank': '🛡️',
        'damage': '⚔️',
        'support': '❤️'
    };
    
    span.textContent = fallbackIcons[iconName] || '●';
    return span;
}

// Get icon system instance safely
function getIconSystem() {
    // Try global instance first
    if (window.IconSystem) {
        return window.IconSystem;
    }
    
    // Try creating new instance
    try {
        return new IconSystem();
    } catch (error) {
        console.warn('IconSystem not available, using fallback icons');
        return null;
    }
}

// DOM Elements
let roleSelectionModalEl = null;
let closeRoleSelectionModalBtnEl = null;
let roleSelectionFormEl = null;
let saveRoleSelectionBtnEl = null;
let selectedRolesDisplayEl = null;

/**
 * Determines the role class based on selected roles for theming.
 * @param {string[]} selectedRoles - Array of selected role names
 * @returns {string} Role class for CSS theming
 */
function getRoleClassFromRoles(selectedRoles) {
    if (!selectedRoles || selectedRoles.length === 0) return '';
    if (selectedRoles.length === 1) return `role-${selectedRoles[0].toLowerCase()}`;
    return 'role-multi'; // Multiple roles selected
}

/**
 * Wait for IconSystem to be available
 * @returns {Promise} Promise that resolves when IconSystem is ready
 */
function waitForIconSystem() {
    return new Promise((resolve) => {
        if (window.IconSystem && window.IconSystem.createIcon) {
            resolve();
            return;
        }
        
        // Poll for IconSystem availability
        const checkIconSystem = () => {
            if (window.IconSystem && window.IconSystem.createIcon) {
                resolve();
            } else {
                setTimeout(checkIconSystem, 50);
            }
        };
        
        checkIconSystem();
    });
}

/**
 * Create an icon with fallback for when IconSystem isn't ready
 * @param {string} iconName - Name of the icon
 * @param {Object} options - Icon options
 * @returns {HTMLElement} Icon element or fallback
 */
function createIconWithFallback(iconName, options = {}) {
    if (window.IconSystem && window.IconSystem.createIcon) {
        return window.IconSystem.createIcon(iconName, options);
    }
    
    // Fallback: create simple text element
    const fallback = document.createElement('span');
    fallback.className = `icon-fallback ${options.className || ''}`;
    fallback.textContent = getIconFallbackText(iconName);
    fallback.style.fontSize = options.size || '16px';
    return fallback;
}

/**
 * Get fallback text for icons
 * @param {string} iconName - Name of the icon
 * @returns {string} Fallback text
 */
function getIconFallbackText(iconName) {
    const fallbackMap = {
        'tank': '🛡️',
        'damage': '⚔️', 
        'support': '❤️',
        'shield': '🛡️',
        'target': '🎯',
        'heart': '❤️'
    };
    return fallbackMap[iconName] || '●';
}

/**
 * Initializes the role selection modal and its event listeners.
 */
export function initRoleSelection() {
    roleSelectionModalEl = document.getElementById('roleSelectionModal');
    closeRoleSelectionModalBtnEl = document.getElementById('closeRoleSelectionModalBtn');
    roleSelectionFormEl = document.getElementById('roleSelectionForm');
    saveRoleSelectionBtnEl = document.getElementById('saveRoleSelectionBtn');
    selectedRolesDisplayEl = document.getElementById('selectedRolesDisplay');

    if (!roleSelectionModalEl || !closeRoleSelectionModalBtnEl || !roleSelectionFormEl || !saveRoleSelectionBtnEl || !selectedRolesDisplayEl) {
        console.error('Role selection modal elements not found. Feature may not work correctly.');
        return;
    }

    closeRoleSelectionModalBtnEl.addEventListener('click', closeRoleSelectionModal);
    saveRoleSelectionBtnEl.addEventListener('click', handleSaveRoleSelection);
    roleSelectionModalEl.addEventListener('click', (event) => {
        if (event.target === roleSelectionModalEl) {
            closeRoleSelectionModal();
        }
    });

    // Wait for IconSystem to be ready before rendering
    waitForIconSystem().then(() => {
        renderSelectedRolesDisplay(); // Initial render of icons in header
    });
    enhanceRoleSelectionModal(); // Apply enhanced theming to modal
}

/**
 * Opens the role selection modal with enhanced animation.
 * Populates role selections based on current appState.
 */
export function openRoleSelectionModal() {
    if (!roleSelectionModalEl || !roleSelectionFormEl) return;

    const currentAppState = getAppState();
    
    // Update role selections to match current state
    const roleSelectors = roleSelectionFormEl.querySelectorAll('.role-selector-item');
    roleSelectors.forEach(selector => {
        const checkbox = selector.querySelector('input[name="role"]');
        const role = checkbox.value;
        const isSelected = currentAppState.selectedRoles.includes(role);
        
        checkbox.checked = isSelected;
        if (isSelected) {
            selector.classList.add('selected');
        } else {
            selector.classList.remove('selected');
        }
    });

    // Add enhanced modal class for better animation
    roleSelectionModalEl.classList.add('enhanced');
    roleSelectionModalEl.style.display = 'flex';
    
    // Trigger entrance animation
    setTimeout(() => {
        roleSelectionModalEl.classList.add('animate-in');
    }, 50);
}

/**
 * Closes the role selection modal with enhanced animation.
 */
function closeRoleSelectionModal() {
    if (roleSelectionModalEl) {
        roleSelectionModalEl.classList.remove('animate-in');
        setTimeout(() => {
            roleSelectionModalEl.style.display = 'none';
            roleSelectionModalEl.classList.remove('enhanced');
        }, 300);
    }
}

/**
 * Handles saving the selected roles.
 * Updates appState and re-renders the display.
 */
function handleSaveRoleSelection() {
    if (!roleSelectionFormEl) return;

    const selectedRoles = [];
    const checkboxes = roleSelectionFormEl.querySelectorAll('input[name="role"]:checked');
    checkboxes.forEach(checkbox => {
        selectedRoles.push(checkbox.value);
    });

    updateAppState({
        selectedRoles: selectedRoles,
        hasSelectedRoles: true
    });

    renderSelectedRolesDisplay();
    closeRoleSelectionModal();
    // Potentially trigger a re-render of tasks if they depend on roles
    // Example: if (typeof renderCurrentDayTasks === 'function') renderCurrentDayTasks();
}

/**
 * Renders the selected role icons in the header using the new icon system.
 */
export function renderSelectedRolesDisplay() {
    if (!selectedRolesDisplayEl) return;

    const currentAppState = getAppState();
    selectedRolesDisplayEl.innerHTML = ''; // Clear existing icons

    if (currentAppState.selectedRoles && currentAppState.selectedRoles.length > 0) {
        // Add role class for theming
        selectedRolesDisplayEl.className = `selected-roles-display ${getRoleClassFromRoles(currentAppState.selectedRoles)}`;
        
        currentAppState.selectedRoles.forEach((role, index) => {
            const roleContainer = document.createElement('div');
            roleContainer.classList.add('role-badge', `role-${role.toLowerCase()}`, 'performance-layer');            // Create icon using the icon system
            const iconName = roleToIconMap[role];
            if (iconName) {
                const icon = createIconWithFallback(iconName, {
                    size: '16px',
                    className: 'role-badge-icon'
                });
                roleContainer.appendChild(icon);
            }
            
            // Add role text
            const roleText = document.createElement('span');
            roleText.textContent = role;
            roleText.classList.add('role-badge-text');
            roleContainer.appendChild(roleText);
            
            roleContainer.title = role; // Tooltip
            
            // Add staggered entrance animation
            roleContainer.style.animationDelay = `${index * 0.1}s`;
            roleContainer.classList.add('card-entrance');
            
            selectedRolesDisplayEl.appendChild(roleContainer);
        });    } else {
        // Reset classes when no roles selected
        selectedRolesDisplayEl.className = 'selected-roles-display';
    }
}

/**
 * Enhances the role selection modal with icons and improved theming.
 */
function enhanceRoleSelectionModal() {
    if (!roleSelectionFormEl) return;

    const checkboxGroup = roleSelectionFormEl.querySelector('.role-checkbox-group');
    if (!checkboxGroup) return;

    // Clear existing content and rebuild with enhanced styling
    checkboxGroup.innerHTML = '';
    checkboxGroup.classList.add('role-selector-grid', 'performance-layer');

    const roles = ['Tank', 'Damage', 'Support'];
    
    roles.forEach((role, index) => {
        const roleOption = document.createElement('div');
        roleOption.classList.add('role-selector-item', `role-${role.toLowerCase()}`, 'touch-target');
        roleOption.setAttribute('data-role', role);        // Create icon
        const iconName = roleToIconMap[role];
        if (iconName) {
            const icon = createIconWithFallback(iconName, {
                size: '24px',
                className: 'role-selector-icon'
            });
            roleOption.appendChild(icon);
        }
        
        // Create label
        const roleLabel = document.createElement('span');
        roleLabel.textContent = role;
        roleLabel.classList.add('role-selector-label');
        roleOption.appendChild(roleLabel);
        
        // Create hidden checkbox for form compatibility
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'role';
        checkbox.value = role;
        checkbox.id = `role-${role.toLowerCase()}`;
        checkbox.style.display = 'none'; // Hide the actual checkbox
        roleOption.appendChild(checkbox);
        
        // Add click handler for role selection
        roleOption.addEventListener('click', (e) => {
            e.preventDefault();
            toggleRoleSelection(roleOption, checkbox);
        });
        
        // Add staggered entrance animation
        roleOption.style.animationDelay = `${index * 0.1}s`;
        roleOption.classList.add('card-entrance');
        
        checkboxGroup.appendChild(roleOption);
    });
}

/**
 * Toggles role selection with visual feedback.
 * @param {HTMLElement} roleElement - The role selector element
 * @param {HTMLInputElement} checkbox - The associated checkbox
 */
function toggleRoleSelection(roleElement, checkbox) {
    checkbox.checked = !checkbox.checked;
    
    if (checkbox.checked) {
        roleElement.classList.add('selected');
        // Add micro-bounce animation
        roleElement.classList.add('micro-bounce');
        setTimeout(() => roleElement.classList.remove('micro-bounce'), 300);
    } else {
        roleElement.classList.remove('selected');
    }
}

/**
 * Checks if roles have been selected and prompts if not.
 * This should be called after app initialization.
 */
export function checkAndPromptForRoleSelection() {
    const currentAppState = getAppState();
    
    // Only prompt for role selection if the app has run at least once
    // and the user hasn't selected roles yet
    if (currentAppState.hasRunOnce && !currentAppState.hasSelectedRoles) {
        // Delay slightly to ensure the rest of the UI is ready
        setTimeout(() => {
            openRoleSelectionModal();
        }, 500); // Adjust delay as needed
    }
}
