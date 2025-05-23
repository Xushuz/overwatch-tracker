// app-state.js

export const themes = ['light', 'dark', 'pink', 'oceanic', 'forest', 'sunset', 'lavender', 'grayscale'];
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
    hasPromptedRankForWeek: {}, // Format: { "c1w1": true (meaning end of w1 for cycle 1 prompted)
    customWarmups: [], // Array of { id, name, description, link }
    customTasks: {}, // Format: { "c1w1d1": [ { id, text, done } ] }
    lastSelectedTier: '', // Store the last selected tier from dashboard
};

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

            appState = newState;
        }
    } catch (e) {
        console.error("Error loading state from localStorage:", e);
        // If loading fails, appState retains its default values
    }
}

// Function to update parts of the appState and save automatically
// Example: updateAppState({ currentWeek: newWeekValue, currentDay: newDayValue });
export function updateAppState(newStateProperties) {
    appState = { ...appState, ...newStateProperties };
    saveState();
}