// app-state.js

export const themes = ['light', 'dark', 'pink'];
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
    hasPromptedRankForWeek: {}, // Format: { "c1w1": true (meaning end of w1 for cycle 1 prompted) }
    customWarmups: [], // Array of { id, name, description, link }
    customTasks: {}, // Format: { "c1w1d1": [ { id, text, done } ] }
    personalFocus: {} // Format: { "c1w1d1": "Focus text" }
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

            // Merge carefully, ensuring nested objects are properly handled
            appState = { 
                ...appState, // Start with current defaults
                ...parsedState, // Override with stored values
                // Explicitly merge/assign nested objects to avoid them being overwritten by an empty {} from default
                taskCompletions: { ...(parsedState.taskCompletions || {}) },
                dailyNotes: { ...(parsedState.dailyNotes || {}) },
                rankHistory: [ ...(parsedState.rankHistory || []) ],
                hasPromptedInitialRankThisCycle: parsedState.hasPromptedInitialRankThisCycle || false,
                hasPromptedRankForWeek: { ...(parsedState.hasPromptedRankForWeek || {}) },
                customWarmups: [ ...(parsedState.customWarmups || []) ],
                customTasks: { ...(parsedState.customTasks || {}) },
                personalFocus: { ...(parsedState.personalFocus || {}) }
            };
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