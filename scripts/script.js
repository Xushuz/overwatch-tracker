// script.js (Main Orchestrator)
import { appState, loadState, saveState, updateAppState } from './app-state.js';
import { programData, getTotalDaysInWeek } from './program-data.js';
import { initThemeControls, applyTheme } from './ui-theme.js';
import { initMainNavigation, renderPage } from './main-navigation.js';
import { initRankPromptModal, promptForRank, closeRankPromptModal } from './ui-modals.js';
import { renderCurrentWeekProgress } from './ui-render-dashboard.js'; // For task completion updates
import { renderProgramOverviewPage } from './ui-render-program.js'; // For task completion updates

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection (Global / Persistent Elements) ---
    const body = document.body;
    const currentDateEl = document.getElementById('currentDate');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const newCycleBtn = document.getElementById('newCycleBtn');
    const mainContentEl = document.querySelector('.app-main');
    const navLinks = document.querySelectorAll('.app-nav .nav-link');

    // Rank Prompt Modal Elements (passed to ui-modals.js for initialization)
    const rankPromptModalEl = document.getElementById('rankPromptModal');
    const rankPromptTitleEl = document.getElementById('rankPromptTitle');
    const modalRankLogFormEl = document.getElementById('modalRankLogForm');
    const modalRankLogWeekInputEl = document.getElementById('modalRankLogWeek');
    const modalRankLogTypeInputEl = document.getElementById('modalRankLogType');
    const modalRankTierSelectEl = document.getElementById('modalRankTier');
    const modalRankDivisionButtonsEl = document.getElementById('modalRankDivisionButtons');
    const modalRankDivisionValueInputEl = document.getElementById('modalRankDivisionValue');
    const closeRankPromptModalBtnEl = document.getElementById('closeRankPromptModalBtn');
    const saveModalRankLogBtnEl = document.getElementById('saveModalRankLogBtn');
    const cancelModalRankLogBtnEl = document.getElementById('cancelModalRankLogBtn');

    // Program Week Details Modal Elements (passed to ui-render-program.js via its init function)
    const programWeekDetailsModalEl = document.getElementById('programWeekDetailsModal');
    const closeWeekDetailsModalBtnEl = document.getElementById('closeWeekDetailsModalBtn');
    const okWeekDetailsModalBtnEl = document.getElementById('okWeekDetailsModalBtn');
    // The title and body for this modal are queried within ui-render-program.js when shown.


    // --- Global Helper/Utility Functions (if any, or can be in separate utils.js) ---
    function setCurrentDate() {
        if (!currentDateEl) return;
        const now = new Date();
        currentDateEl.textContent = now.toLocaleDateString(undefined, { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    // --- Core App Logic not fitting into specific UI modules ---

    // This function is exported so other modules (like ui-render-dashboard) can call it
    // It has broad effects, so it lives in the main orchestrator.
    window.toggleTaskCompletion = function(taskId) { // Expose to global scope for inline event handlers if any, or pass properly
        const taskKey = `c${appState.currentCycle}-${taskId}`;
        updateAppState({
            taskCompletions: {
                ...appState.taskCompletions,
                [taskKey]: !appState.taskCompletions[taskKey]
            }
        });
        
        // Update relevant UI parts
        if (appState.currentPage === 'dashboard') {
            renderCurrentWeekProgress(); // In ui-render-dashboard.js
            // The checkbox itself will be visually updated by a full re-render of tasks if needed,
            // or could be updated directly here if renderCurrentDayTasks is called.
            // For now, renderPage() handles updating the dashboard content if needed.
            const checkbox = document.getElementById(taskKey); // The ID of the checkbox matches the taskKey
            const taskDetailsDiv = checkbox?.closest('li')?.querySelector('.task-details');
            if (checkbox && taskDetailsDiv) {
                if (checkbox.checked) taskDetailsDiv.classList.add('completed');
                else taskDetailsDiv.classList.remove('completed');
            }
        }
        if (appState.currentPage === 'program') {
            renderProgramOverviewPage(mainContentEl); // Re-render program overview to update progress %
        }
        
        // Check for end-of-week completion to prompt rank
        const weekData = programData[appState.currentWeek];
        if (weekData && weekData.days[appState.currentDay]) {
            const dayTasks = weekData.days[appState.currentDay].tasks;
            const allDayTasksCompleted = dayTasks.every(task => appState.taskCompletions[`c${appState.currentCycle}-${task.id}`]);
            
            const promptKey = `c${appState.currentCycle}w${appState.currentWeek}_endOfWeekPrompt`;
            if (allDayTasksCompleted && 
                appState.currentDay === getTotalDaysInWeek(appState.currentWeek) && 
                appState.currentWeek >= 1 && appState.currentWeek <= 6 && // Only for program weeks
                !appState.hasPromptedRankForWeek[promptKey]) {
                
                setTimeout(() => promptForRank(appState.currentWeek, 'endOfWeek'), 200);
            }
        }
    }

    function startNewCycle() {
        if (confirm("Are you sure you want to start a new cycle? This will start tracking for a new cycle. Previous data is retained and can be viewed by changing cycle (feature TBD) or in full history views.")) {
            const newCycleNumber = appState.currentCycle + 1;
            updateAppState({
                currentCycle: newCycleNumber,
                currentWeek: 1,
                currentDay: 1,
                hasPromptedInitialRankThisCycle: false,
                // Clear hasPromptedRankForWeek for the *new* cycle
                hasPromptedRankForWeek: Object.entries(appState.hasPromptedRankForWeek)
                                            .filter(([key]) => !key.startsWith(`c${newCycleNumber}w`))
                                            .reduce((obj, [key, val]) => { obj[key] = val; return obj; }, {})
            });
            // If you want to clear task completions for the new cycle view (while keeping old cycle completions):
            // This assumes task IDs are globally unique (w1d1t1, etc.) and we use a cycle-prefixed key for storage.
            // No need to clear appState.taskCompletions if we always use cycle-prefixed keys.
            
            alert(`New Cycle (#${appState.currentCycle}) started! Back to Week 1, Day 1.`);
            renderPage(); // Re-render the current page (likely dashboard)
            checkAndPromptForInitialRank(); // Prompt for initial rank of the new cycle
        }
    }

    function checkAndPromptForInitialRank() {
        const currentCycleInitialRankExists = appState.rankHistory.some(
            r => r.cycle === appState.currentCycle && r.type === 'initial'
        );
        // Only prompt if no initial rank logged for *this* cycle AND we haven't already prompted (and user skipped)
        if (!currentCycleInitialRankExists && !appState.hasPromptedInitialRankThisCycle) {
            setTimeout(() => {
                 promptForRank(0, 'initial'); // Week 0 for initial
            }, 500); // Slight delay
        }
    }

    // --- Initialization Function ---
    function initializeApp() {
        loadState(); // Load any saved state from localStorage first
        setCurrentDate();

        // Initialize UI Modules that need DOM element references
        initThemeControls(themeToggleBtn); // from ui-theme.js
        initMainNavigation(mainContentEl, navLinks); // from main-navigation.js
        initRankPromptModal( // from ui-modals.js
            rankPromptModalEl, rankPromptTitleEl, modalRankLogFormEl,
            modalRankLogWeekInputEl, modalRankLogTypeInputEl, modalRankTierSelectEl,
            modalRankDivisionButtonsEl, modalRankDivisionValueInputEl,
            closeRankPromptModalBtnEl, saveModalRankLogBtnEl, cancelModalRankLogBtnEl
        );
        
        // Initialize event listeners for global controls
        if (newCycleBtn) newCycleBtn.addEventListener('click', startNewCycle);

        // Initial page render based on loaded or default state
        renderPage(); 
        checkAndPromptForInitialRank(); // Check after initial load and page render
    }

    // --- Start the App ---
    initializeApp();
});