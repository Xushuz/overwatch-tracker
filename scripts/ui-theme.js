// scripts/ui-theme.js
import { appState, themes, saveState, updateAppState } from './app-state.js';
// We need to import the chart rendering functions if they exist and are exported
// from their respective UI modules to re-render them on theme change.
// Assuming renderDashboardRankChart is in ui-render-dashboard.js
// and renderProgressPageRankChart is in ui-render-progress.js
// We will import them in main script.js and pass them or call them from there
// For now, this module will just focus on body class and button text.
// The actual chart re-rendering will be triggered from applyTheme in script.js orchestrator.

const body = document.body;
let themeToggleBtnEl = null; // Element will be passed during initialization

export function applyTheme() {
    if (!body || !themeToggleBtnEl) {
        // console.warn("Body or theme toggle button not available for applying theme.");
        return;
    }

    // Remove all possible theme classes first
    themes.forEach(themeName => {
        body.classList.remove(themeName + '-mode');
    });
    // Add the current theme class
    body.classList.add(appState.theme + '-mode');
    
    // Update button text to suggest the *next* theme
    const currentThemeIndex = themes.indexOf(appState.theme);
    const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
    themeToggleBtnEl.textContent = `To ${themes[nextThemeIndex].charAt(0).toUpperCase() + themes[nextThemeIndex].slice(1)}`;

    // Trigger chart re-render (this will be handled in main script.js's applyTheme)
    // This module itself won't directly call chart rendering functions from other modules
    // to keep dependencies cleaner. The main script will coordinate.
}

export function toggleTheme() {
    const currentThemeIndex = themes.indexOf(appState.theme);
    const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
    // Update appState directly and save
    updateAppState({ theme: themes[nextThemeIndex] }); 
    applyTheme(); // Apply the new theme to the UI
}

export function initThemeControls(buttonElement) {
    if (!buttonElement) {
        console.error("Theme toggle button element not provided to initThemeControls.");
        return;
    }
    themeToggleBtnEl = buttonElement;
    themeToggleBtnEl.addEventListener('click', toggleTheme);
    
    // Apply initial theme based on loaded or default appState
    // This ensures the button text is also set correctly on load.
    applyTheme(); 
}