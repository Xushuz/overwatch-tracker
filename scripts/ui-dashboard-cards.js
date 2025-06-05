// scripts/ui-dashboard-cards.js - Enhanced dashboard card system with icons and animations

import { IconSystem } from './ui-icons.js';

/**
 * Enhanced dashboard card system with improved visual hierarchy and interactions
 */
class DashboardCardSystem {
    constructor() {
        this.iconSystem = new IconSystem();
        this.initializeCards();
    }

    /**
     * Initialize enhanced card system
     */
    initializeCards() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.enhanceExistingCards());
        } else {
            this.enhanceExistingCards();
        }
    }    /**
     * Enhance existing dashboard cards with icons and improved structure
     */
    enhanceExistingCards() {
        this.enhanceCustomWarmupSection();
        this.enhanceWarmupListItems();
        this.enhanceDailyNotesSection();
        this.enhanceRankSection();
        this.enhanceTasksSection();
    }

    /**
     * Enhance the custom warmup section with icons and better UX
     */
    enhanceCustomWarmupSection() {
        const warmupSection = document.querySelector('.custom-warmup-section');
        if (!warmupSection) return;

        // Add section icon to header
        const header = warmupSection.querySelector('h4');
        if (header && !header.querySelector('.section-icon')) {
            const icon = this.iconSystem.createIcon('target', {
                size: 'sm',
                className: 'section-icon'
            });
            header.insertBefore(icon, header.firstChild);
        }

        // Enhance add button with icon
        const addButton = warmupSection.querySelector('#addCustomWarmupBtn');
        if (addButton && !addButton.querySelector('.icon')) {
            const icon = this.iconSystem.createIcon('plus', {
                size: 'sm',
                className: 'button-icon'
            });
            addButton.insertBefore(icon, addButton.firstChild);
            addButton.classList.add('enhanced-button');
        }

        // Add loading state functionality
        this.addLoadingStateToButton(addButton);
    }

    /**
     * Enhance the daily notes section
     */
    enhanceDailyNotesSection() {
        const notesSection = document.querySelector('.daily-notes-section');
        if (!notesSection) return;

        // Add section icon to header
        const header = notesSection.querySelector('h4');
        if (header && !header.querySelector('.section-icon')) {
            const icon = this.iconSystem.createIcon('edit', {
                size: 'sm',
                className: 'section-icon'
            });
            header.insertBefore(icon, header.firstChild);
        }

        // Enhance textarea with better focus states
        const textarea = notesSection.querySelector('#dailyNotesTextarea');
        if (textarea) {
            this.enhanceTextarea(textarea);
        }
    }

    /**
     * Enhance the rank section
     */
    enhanceRankSection() {
        const rankSection = document.querySelector('.dashboard-rank-section');
        if (!rankSection) return;

        // Add section icon to header
        const header = rankSection.querySelector('h4');
        if (header && !header.querySelector('.section-icon')) {
            const icon = this.iconSystem.createIcon('trending-up', {
                size: 'sm',
                className: 'section-icon'
            });
            header.insertBefore(icon, header.firstChild);
        }

        // Enhance rank update button
        const updateButton = rankSection.querySelector('button[type="submit"]');
        if (updateButton && !updateButton.querySelector('.icon')) {
            const icon = this.iconSystem.createIcon('save', {
                size: 'sm',
                className: 'button-icon'
            });
            updateButton.insertBefore(icon, updateButton.firstChild);
            updateButton.classList.add('enhanced-button');
        }

        this.addLoadingStateToButton(updateButton);
    }

    /**
     * Enhance the tasks section
     */
    enhanceTasksSection() {
        const tasksSection = document.querySelector('.tasks-section');
        if (!tasksSection) return;

        // Add section icon to header
        const header = tasksSection.querySelector('h4');
        if (header && !header.querySelector('.section-icon')) {
            const icon = this.iconSystem.createIcon('check-square', {
                size: 'sm',
                className: 'section-icon'
            });
            header.insertBefore(icon, header.firstChild);
        }

        // Enhance navigation buttons
        this.enhanceNavigationButtons();
    }

    /**
     * Enhance navigation buttons with icons
     */
    enhanceNavigationButtons() {
        const prevButton = document.querySelector('#prevDayBtn');
        const nextButton = document.querySelector('#nextDayBtn');

        if (prevButton && !prevButton.querySelector('.icon')) {
            const icon = this.iconSystem.createIcon('chevron-left', {
                size: 'sm',
                className: 'button-icon'
            });
            prevButton.insertBefore(icon, prevButton.firstChild);
            prevButton.classList.add('enhanced-button', 'nav-enhanced');
        }

        if (nextButton && !nextButton.querySelector('.icon')) {
            const icon = this.iconSystem.createIcon('chevron-right', {
                size: 'sm',
                className: 'button-icon'
            });
            nextButton.appendChild(icon);
            nextButton.classList.add('enhanced-button', 'nav-enhanced');
        }
    }

    /**
     * Enhance warmup list items with better icons and interactions
     */
    enhanceWarmupListItems() {
        const warmupList = document.querySelector('#customWarmupList');
        if (!warmupList) return;

        // Use MutationObserver to enhance items as they're added
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('custom-warmup-item')) {
                        this.enhanceWarmupItem(node);
                    }
                });
            });
        });

        observer.observe(warmupList, { childList: true });

        // Enhance existing items
        warmupList.querySelectorAll('.custom-warmup-item').forEach(item => {
            this.enhanceWarmupItem(item);
        });
    }

    /**
     * Enhance individual warmup item
     */
    enhanceWarmupItem(item) {
        if (item.querySelector('.warmup-icon')) return; // Already enhanced

        // Add warmup type icon
        const icon = this.iconSystem.createIcon('target', {
            size: 'sm',
            className: 'warmup-icon'
        });

        const textSpan = item.querySelector('.custom-warmup-item-text');
        if (textSpan) {
            item.insertBefore(icon, textSpan);
        }

        // Enhance action buttons
        const actionButtons = item.querySelectorAll('.actions button');
        actionButtons.forEach(button => {
            this.enhanceActionButton(button);
        });
    }

    /**
     * Enhance action buttons with appropriate icons
     */
    enhanceActionButton(button) {
        if (button.querySelector('.icon')) return; // Already enhanced

        const buttonText = button.textContent.trim();
        let iconName = 'more-horizontal';

        // Determine icon based on button text
        if (buttonText === 'Edit') {
            iconName = 'edit';
        } else if (buttonText === '↑') {
            iconName = 'chevron-up';
            button.textContent = '';
        } else if (buttonText === '↓') {
            iconName = 'chevron-down';
            button.textContent = '';
        } else if (buttonText === '✕') {
            iconName = 'x';
            button.textContent = '';
        }

        const icon = this.iconSystem.createIcon(iconName, {
            size: 'xs',
            className: 'button-icon'
        });

        if (buttonText === 'Edit') {
            button.insertBefore(icon, button.firstChild);
        } else {
            button.appendChild(icon);
        }

        button.classList.add('enhanced-action-button');
    }

    /**
     * Enhance textarea with improved focus and typing indicators
     */
    enhanceTextarea(textarea) {
        if (textarea.enhanced) return;
        textarea.enhanced = true;

        // Add typing indicator functionality
        let typingTimer;
        const typingIndicator = this.createTypingIndicator();
        textarea.parentNode.appendChild(typingIndicator);

        textarea.addEventListener('input', () => {
            typingIndicator.style.display = 'block';
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                typingIndicator.style.display = 'none';
            }, 1000);
        });

        // Add character count
        const charCount = this.createCharacterCount(textarea);
        textarea.parentNode.appendChild(charCount);
    }

    /**
     * Create typing indicator element
     */
    createTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.style.display = 'none';
        
        const icon = this.iconSystem.createIcon('edit', {
            size: 'xs',
            className: 'typing-icon'
        });
        
        indicator.appendChild(icon);
        indicator.appendChild(document.createTextNode(' Typing...'));
        
        return indicator;
    }

    /**
     * Create character count element
     */
    createCharacterCount(textarea) {
        const charCount = document.createElement('div');
        charCount.className = 'character-count';
        
        const updateCount = () => {
            const length = textarea.value.length;
            charCount.textContent = `${length} characters`;
            
            if (length > 500) {
                charCount.classList.add('warning');
            } else {
                charCount.classList.remove('warning');
            }
        };

        textarea.addEventListener('input', updateCount);
        updateCount();

        return charCount;
    }

    /**
     * Add loading state functionality to buttons
     */
    addLoadingStateToButton(button) {
        if (!button || button.hasLoadingState) return;
        button.hasLoadingState = true;

        const originalClickHandler = button.onclick;
        
        button.onclick = async (event) => {
            if (button.disabled) return;
            
            // Add loading state
            this.setButtonLoading(button, true);
            
            try {
                if (originalClickHandler) {
                    await originalClickHandler.call(button, event);
                }
            } finally {
                // Remove loading state after a short delay
                setTimeout(() => {
                    this.setButtonLoading(button, false);
                }, 500);
            }
        };
    }

    /**
     * Set button loading state
     */
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            
            // Replace icon with spinner if it exists
            const icon = button.querySelector('.button-icon');
            if (icon) {
                icon.style.display = 'none';
                const spinner = this.createSpinner();
                spinner.className = 'button-icon spinner';
                button.insertBefore(spinner, button.firstChild);
            }
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            
            // Restore original icon
            const spinner = button.querySelector('.spinner');
            if (spinner) {
                spinner.remove();
                const icon = button.querySelector('.button-icon');
                if (icon) {
                    icon.style.display = '';
                }
            }
        }
    }

    /**
     * Create spinner element
     */
    createSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-ring">
                <div></div><div></div><div></div><div></div>
            </div>
        `;
        return spinner;
    }

    /**
     * Create enhanced card container
     */
    createCard(options = {}) {
        const {
            title,
            icon,
            content,
            actions = [],
            className = ''
        } = options;

        const card = document.createElement('div');
        card.className = `enhanced-card ${className}`.trim();

        // Card header
        const header = document.createElement('div');
        header.className = 'card-header';

        if (title) {
            const titleElement = document.createElement('h4');
            titleElement.className = 'card-title';
            
            if (icon) {
                const iconElement = this.iconSystem.createIcon(icon, {
                    size: 'sm',
                    className: 'section-icon'
                });
                titleElement.appendChild(iconElement);
            }
            
            titleElement.appendChild(document.createTextNode(title));
            header.appendChild(titleElement);
        }

        // Card actions
        if (actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'card-actions';
            
            actions.forEach(action => {
                const button = document.createElement('button');
                button.className = `form-button form-button--secondary card-action-button`;
                button.textContent = action.label;
                
                if (action.icon) {
                    const icon = this.iconSystem.createIcon(action.icon, {
                        size: 'xs',
                        className: 'button-icon'
                    });
                    button.insertBefore(icon, button.firstChild);
                }
                
                if (action.onClick) {
                    button.addEventListener('click', action.onClick);
                }
                
                actionsContainer.appendChild(button);
            });
            
            header.appendChild(actionsContainer);
        }

        card.appendChild(header);

        // Card content
        if (content) {
            const contentElement = document.createElement('div');
            contentElement.className = 'card-content';
            
            if (typeof content === 'string') {
                contentElement.innerHTML = content;
            } else {
                contentElement.appendChild(content);
            }
            
            card.appendChild(contentElement);
        }

        return card;
    }
}

// Initialize the dashboard card system
export function initDashboardCards() {
    return new DashboardCardSystem();
}

// Export for use in other modules
export { DashboardCardSystem };
