// app-state.js

export const themes = ['light', 'dark', 'dark-red', 'pink', 'oceanic', 'forest', 'sunset', 'lavender', 'grayscale', 'cyberpunk', 'retro', 'arctic', 'volcano', 'cosmic', 'neon', 'forest-night'];
export const APP_STATE_KEY = 'overwatchTrackerAppState_v9'; // Incremented for module structure

export let appState = {
    currentPage: 'dashboard',
    currentCycle: 1,
    currentWeek: 1,
    currentDay: 1,
    theme: themes[0], 
    taskCompletions: {}, 
    dailyNotes: {}, // Format: { "c1w1d1": "Notes..." }
    rankHistory: [], // Format: [{ cycle, week, type, tier, division, rankString, dateLogged }]
    hasPromptedInitialRankThisCycle: false,
    // hasPromptedRankForWeek removed (end-of-week prompt feature deprecated)
    selectedRoles: [], // To store user's selected roles, e.g., ['Tank', 'Damage']
    hasSelectedRoles: false, // To track if user has made an initial role selection
    customWarmups: [], // Array of { id, name, description, link }
    customTasks: {}, // Format: { "c1w1d1": [ { id, text, done } ] }
    lastSelectedTier: '', // Store the last selected tier from dashboard
};

export function getAppState() {
    return appState;
}

export function saveState() {
    try {
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(appState));
    } catch (e) {
        console.error("Error saving state to localStorage:", e);
    }
}

export function loadState() {
    try {
        const storedState = localStorage.getItem(APP_STATE_KEY);
        if (storedState) {
            const parsedState = JSON.parse(storedState);
            
            // Ensure theme is valid, default if not
            if (!themes.includes(parsedState.theme)) {
                parsedState.theme = themes[0];
            }

            let newState = { ...appState }; // Start with a copy of default appState

            // Iterate over the keys of the default appState structure
            // to ensure that only expected properties are loaded from localStorage.
            for (const key in newState) {
                // Use hasOwnProperty to ensure the key is directly on parsedState and not from its prototype.
                if (parsedState.hasOwnProperty(key)) {
                    const defaultValue = newState[key];
                    const storedValue = parsedState[key];

                    if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
                        // Merge nested objects: combine defaults with stored values.
                        // Ensure storedValue is an object before spreading.
                        newState[key] = { ...defaultValue, ...(typeof storedValue === 'object' && storedValue !== null ? storedValue : {}) };
                    } else if (Array.isArray(defaultValue)) {
                        // Assign arrays: use stored array if valid, otherwise keep default (or empty array).
                        newState[key] = Array.isArray(storedValue) ? storedValue : defaultValue;
                    } else {
                        // Assign primitives: directly use the stored value if it's of a compatible type,
                        // otherwise consider keeping the default (though current logic just assigns).
                        // This part could be enhanced with type checking if stricter loading is needed.
                        newState[key] = storedValue;
                    }
                }
            }
            
            // Theme validation: explicitly check and set the theme.
            // This overrides any theme value that might have been set in the loop if it was invalid.
            if (parsedState.hasOwnProperty('theme') && themes.includes(parsedState.theme)) {
                newState.theme = parsedState.theme;
            } else {
                newState.theme = themes[0]; // Default to the first theme if stored theme is invalid or not present.
            }

            // Clear all keys from the existing appState object
            Object.keys(appState).forEach(key => {
                delete appState[key];
            });
            // Assign properties from the newly loaded and validated state
            Object.assign(appState, newState);
        }
    } catch (e) {
        console.error("Error loading state from localStorage:", e);
        // If loading fails, appState retains its default values
    }
}

// Function to update parts of the appState and save automatically
// Example: updateAppState({ currentWeek: newWeekValue, currentDay: newDayValue });
export function updateAppState(newStateProperties) {
    Object.assign(appState, newStateProperties);
    saveState();
}
/**
 * Export the entire app state as a JSON file for backup.
 */
export function exportAppState() {
    try {
        const dataStr = JSON.stringify(appState, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'overwatch-tracker-state.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Failed to export app state:', e);
        alert('Error exporting data. See console for details.');
    }
}
/**
 * Import and replace app state from a parsed JSON object.
 * @param {object} importedState
 */
export function importAppState(importedState) {
    try {
        // Basic validation: Check if essential properties exist
        if (!importedState || typeof importedState.currentPage !== 'string' || typeof importedState.currentCycle !== 'number') {
            alert('Import failed: File does not appear to be a valid application state backup.');
            return;
        }

        // Version check (optional but recommended for future compatibility)
        // For example, if you introduce APP_STATE_VERSION in your state:
        // if (importedState.APP_STATE_VERSION !== appState.APP_STATE_VERSION) {
        //     if (!confirm(\`The imported data is from a different app version.
        //                   This might cause issues. Continue?\`)) {
        //         return;
        //     }
        // }

        // Overwrite localStorage and in-memory state
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(importedState));
        loadState(); // This will re-parse and apply the new state, including defaults for missing keys
        alert('Data imported successfully. The application will now reload to apply changes.');
        
        // Force a reload to ensure all components re-render with the new state
        // This is a simple way to handle complex state changes that might not be picked up by all components.
        location.reload();

    } catch (e) {
        console.error('Failed to import app state:', e);
        alert('Error importing data. See console for details.');
    }
}