// scripts/ui-theme.js
import { appState, themes, updateAppState } from './app-state.js';
// Import chart rendering functions to call them on theme change
import { renderDashboardRankChart } from './ui-render-dashboard-tasks.js';
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
        // Check if the canvas element actually exists before trying to render
        if (document.getElementById('dashboardRankChart')) {
            renderDashboardRankChart();
        }
    }
    if (appState.currentPage === 'progress') {
        if (document.getElementById('progressPageRankChart')) {
            renderProgressPageRankChart();
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