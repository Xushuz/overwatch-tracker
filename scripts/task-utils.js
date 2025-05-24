// scripts/task-utils.js
// Utility functions for task completion stats
import { programData } from './program-data.js';
import { getAppState } from './app-state.js';

/**
 * Get task completion stats for a week, all weeks, or custom filter.
 * @param {Object} [options]
 *   - weekNum: number (optional)
 *   - all: boolean (optional, if true, stats for all weeks)
 *   - filter: function(task, weekNum, dayNum): boolean (optional)
 * @returns {Object} { total, completed, percent }
 */
export function getTaskCompletionStats(options = {}) {
    const appState = getAppState();
    let total = 0;
    let completed = 0;
    const { weekNum, all, filter } = options;

    const weekKeys = all ? Object.keys(programData) : (weekNum ? [String(weekNum)] : []);
    const weeksToCheck = all ? weekKeys : (weekNum ? weekKeys : []);
    // If neither all nor weekNum, return 0s
    if (!all && !weekNum) return { total: 0, completed: 0, percent: 0 };

    for (const wNum of weeksToCheck) {
        const week = programData[wNum];
        if (!week || !week.days) continue;
        for (const dNum in week.days) {
            const day = week.days[dNum];
            if (!day.tasks) continue;
            for (const task of day.tasks) {
                if (filter && !filter(task, wNum, dNum)) continue;
                total++;
                const taskKey = `c${appState.currentCycle}-${task.id}`;
                if (appState.taskCompletions[taskKey]) completed++;
            }
        }
    }
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
}
