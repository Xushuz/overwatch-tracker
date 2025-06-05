// scripts/ui-performance.js - Performance optimization system

/**
 * Performance optimization utilities for better UX
 */
class PerformanceOptimizer {
    constructor() {
        this.observer = null;
        this.scrollThrottled = false;
        this.resizeThrottled = false;
        this.initializeOptimizations();
    }

    /**
     * Initialize all performance optimizations
     */
    initializeOptimizations() {
        this.setupIntersectionObserver();
        this.setupVirtualScrolling();
        this.setupImageLazyLoading();
        this.setupThrottledEvents();
        this.setupPageTransitions();
        this.preloadCriticalResources();
    }

    /**
     * Setup intersection observer for animations and lazy loading
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Trigger specific animations based on element type
                    if (entry.target.classList.contains('task-list')) {
                        this.animateTaskList(entry.target);
                    } else if (entry.target.classList.contains('week-card')) {
                        this.animateWeekCard(entry.target);
                    } else if (entry.target.classList.contains('custom-warmup-item')) {
                        this.animateWarmupItem(entry.target);
                    }
                    
                    // Stop observing after animation
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Observe all animatable elements
        this.observeAnimatableElements();
    }

    /**
     * Observe elements that should be animated on scroll
     */
    observeAnimatableElements() {
        const selectors = [
            '.task-list li',
            '.week-card',
            '.custom-warmup-item',
            '.enhanced-card',
            '.dashboard-rank-section',
            '.daily-notes-section'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (this.observer) {
                    this.observer.observe(el);
                }
            });
        });
    }

    /**
     * Animate task list items with staggered delay
     */
    animateTaskList(taskList) {
        const items = taskList.querySelectorAll('li');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'translateY(0)';
                item.style.opacity = '1';
            }, index * 100);
        });
    }

    /**
     * Animate week cards
     */
    animateWeekCard(card) {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.opacity = '1';
    }

    /**
     * Animate warmup items
     */
    animateWarmupItem(item) {
        item.style.transform = 'translateX(0)';
        item.style.opacity = '1';
    }

    /**
     * Setup virtual scrolling for large lists
     */
    setupVirtualScrolling() {
        const taskLists = document.querySelectorAll('.task-list');
        taskLists.forEach(list => {
            if (list.children.length > 20) {
                this.enableVirtualScrolling(list);
            }
        });
    }

    /**
     * Enable virtual scrolling for a list element
     */
    enableVirtualScrolling(listElement) {
        const itemHeight = 60; // Average task item height
        const containerHeight = 400; // Max visible height
        const visibleItems = Math.ceil(containerHeight / itemHeight);
        const bufferSize = 5;

        let scrollTop = 0;
        let startIndex = 0;

        const container = document.createElement('div');
        container.style.height = `${containerHeight}px`;
        container.style.overflow = 'auto';
        container.className = 'virtual-scroll-container';

        const wrapper = document.createElement('div');
        wrapper.style.height = `${listElement.children.length * itemHeight}px`;
        wrapper.style.position = 'relative';

        container.appendChild(wrapper);
        listElement.parentNode.insertBefore(container, listElement);
        container.appendChild(listElement);

        const updateVisibleItems = () => {
            const newStartIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(
                newStartIndex + visibleItems + bufferSize,
                listElement.children.length
            );

            if (newStartIndex !== startIndex) {
                startIndex = newStartIndex;

                // Hide all items
                Array.from(listElement.children).forEach((item, index) => {
                    if (index < startIndex || index > endIndex) {
                        item.style.display = 'none';
                    } else {
                        item.style.display = '';
                        item.style.transform = `translateY(${index * itemHeight}px)`;
                        item.style.position = 'absolute';
                        item.style.width = '100%';
                    }
                });
            }
        };

        container.addEventListener('scroll', this.throttle(() => {
            scrollTop = container.scrollTop;
            updateVisibleItems();
        }, 16));

        updateVisibleItems();
    }

    /**
     * Setup lazy loading for images
     */
    setupImageLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading support
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
                img.loading = 'lazy';
            });
        } else {
            // Fallback for older browsers
            this.setupIntersectionBasedImageLoading();
        }
    }

    /**
     * Setup image loading with intersection observer
     */
    setupIntersectionBasedImageLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }

    /**
     * Setup throttled events for better performance
     */
    setupThrottledEvents() {
        // Throttled scroll events
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16));

        // Throttled resize events
        window.addEventListener('resize', this.throttle(() => {
            this.handleResize();
        }, 100));

        // Debounced input events
        document.addEventListener('input', this.debounce((event) => {
            if (event.target.tagName === 'TEXTAREA') {
                this.handleTextareaInput(event.target);
            }
        }, 300));
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollTop = window.pageYOffset;
        
        // Add/remove header shadow based on scroll
        const header = document.querySelector('.app-header');
        if (header) {
            if (scrollTop > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Parallax effect for hero elements
        const heroElements = document.querySelectorAll('.hero-element');
        heroElements.forEach(element => {
            const speed = element.dataset.parallaxSpeed || 0.5;
            element.style.transform = `translateY(${scrollTop * speed}px)`;
        });
    }

    /**
     * Handle resize events
     */
    handleResize() {
        // Recalculate chart sizes
        const charts = document.querySelectorAll('canvas');
        charts.forEach(canvas => {
            if (canvas.chart) {
                canvas.chart.resize();
            }
        });

        // Update virtual scroll containers
        const virtualContainers = document.querySelectorAll('.virtual-scroll-container');
        virtualContainers.forEach(container => {
            // Recalculate visible items
            this.updateVirtualScrolling(container);
        });
    }

    /**
     * Handle textarea input for auto-save
     */
    handleTextareaInput(textarea) {
        // Auto-save implementation
        if (textarea.id === 'dailyNotesTextarea') {
            this.autoSaveNotes(textarea.value);
        }
    }

    /**
     * Auto-save notes functionality
     */
    autoSaveNotes(content) {
        // Implementation would depend on your state management
        console.log('Auto-saving notes:', content.length, 'characters');
        
        // Show save indicator
        this.showSaveIndicator();
    }

    /**
     * Show save indicator
     */
    showSaveIndicator() {
        let indicator = document.querySelector('.save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'save-indicator';
            indicator.textContent = 'Saved';
            document.body.appendChild(indicator);
        }

        indicator.classList.add('show');
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    /**
     * Setup smooth page transitions
     */
    setupPageTransitions() {
        const mainContent = document.querySelector('.app-main');
        if (!mainContent) return;

        // Add transition container
        const transitionContainer = document.createElement('div');
        transitionContainer.className = 'page-transition-container';
        mainContent.appendChild(transitionContainer);

        // Observe navigation changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    this.animatePageTransition(mainContent);
                }
            });
        });

        observer.observe(mainContent, { childList: true });
    }

    /**
     * Animate page transitions
     */
    animatePageTransition(container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        });
    }

    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        // Preload Chart.js if likely to be needed
        const currentPage = document.body.dataset.currentPage;
        if (currentPage === 'dashboard' || currentPage === 'progress') {
            this.preloadScript('https://cdn.jsdelivr.net/npm/chart.js');
        }

        // Preload next page's resources
        this.preloadNextPageResources();
    }

    /**
     * Preload script resource
     */
    preloadScript(src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = src;
        document.head.appendChild(link);
    }

    /**
     * Preload next page resources based on user behavior
     */
    preloadNextPageResources() {
        // Simple heuristic: preload resources for likely next pages
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const page = link.dataset.page;
                this.preloadPageResources(page);
            });
        });
    }

    /**
     * Preload resources for a specific page
     */
    preloadPageResources(page) {
        if (page === 'progress' && !window.Chart) {
            this.preloadScript('https://cdn.jsdelivr.net/npm/chart.js');
        }
    }

    /**
     * Throttle function execution
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Debounce function execution
     */
    debounce(func, delay) {
        let timeoutId;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(context, args), delay);
        };
    }

    /**
     * Clean up observers and listeners
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }

        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }
}

// Initialize performance optimizations
export function initPerformanceOptimizations() {
    return new PerformanceOptimizer();
}

// Export for use in other modules
export { PerformanceOptimizer };
