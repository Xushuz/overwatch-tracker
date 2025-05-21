// scripts/ui-theme.js
import { appState, themes, updateAppState } from './app-state.js';
// Import chart rendering functions to call them on theme change
import { renderDashboardRankChart } from './ui-render-dashboard-main.js';
import { renderProgressPageRankChart } from './ui-render-progress.js';

const body = document.body;
let themeToggleBtnEl = null; 

export function applyTheme() {
    if (!body || !themeToggleBtnEl) {
        return;
    }

    themes.forEach(themeName => {
        body.classList.remove(themeName + '-mode');
    });
    body.classList.add(appState.theme + '-mode'); 
    
    const currentThemeIndex = themes.indexOf(appState.theme);
    const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
    themeToggleBtnEl.textContent = `To ${themes[nextThemeIndex].charAt(0).toUpperCase() + themes[nextThemeIndex].slice(1)}`;
    
    // Re-render charts if they are currently displayed to update their colors
    if (appState.currentPage === 'dashboard') {
        const dashboardCanvas = document.getElementById('dashboardRankChart');
        if (dashboardCanvas) {
            // Use a slightly longer delay and requestAnimationFrame to ensure CSS variables are updated
            setTimeout(() => {
                // Force clear the canvas
                const ctx = dashboardCanvas.getContext('2d');
                ctx.clearRect(0, 0, dashboardCanvas.width, dashboardCanvas.height);
                requestAnimationFrame(() => renderDashboardRankChart());
            }, 50);
        }
    }
    if (appState.currentPage === 'progress') {
        const progressCanvas = document.getElementById('progressPageRankChart');
        if (progressCanvas) {
            // Use a slightly longer delay and requestAnimationFrame to ensure CSS variables are updated
            setTimeout(() => {
                // Force clear the canvas
                const ctx = progressCanvas.getContext('2d');
                ctx.clearRect(0, 0, progressCanvas.width, progressCanvas.height);
                requestAnimationFrame(() => renderProgressPageRankChart());
            }, 50);
        }
    }
}

export function toggleTheme() {
    const currentThemeIndex = themes.indexOf(appState.theme);
    const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
    updateAppState({ theme: themes[nextThemeIndex] }); 
    applyTheme(); 
}

export function initThemeControls(buttonElement) {
    if (!buttonElement) {
        console.error("Theme toggle button element not provided to initThemeControls.");
        return;
    }
    themeToggleBtnEl = buttonElement;
    themeToggleBtnEl.addEventListener('click', toggleTheme);
    applyTheme(); 
}