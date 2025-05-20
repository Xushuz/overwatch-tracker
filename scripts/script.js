// scripts/script.js (Main Orchestrator)
import { appState, loadState, saveState, updateAppState } from './app-state.js';
import { programData, getTotalDaysInWeek } from './program-data.js';
import { initThemeControls, applyTheme } from './ui-theme.js';
import { initMainNavigation, renderPage as RENDER_PAGE_FROM_MAIN_NAV } from './main-navigation.js'; // Renamed to avoid conflict
import { initRankPromptModal, promptForRank } from './ui-modals.js';
import { renderCurrentWeekProgress, renderDashboardRankChart } from './ui-render-dashboard.js';
import { renderProgramOverviewPage, initProgramModals as initProgramWeekDetailsModalListeners } from './ui-render-program.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection (Global / Persistent Elements) ---
    const body = document.body;
    const currentDateEl = document.getElementById('currentDate');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const newCycleBtn = document.getElementById('newCycleBtn');
    const mainContentEl = document.querySelector('.app-main');
    const navLinks = document.querySelectorAll('.app-nav .nav-link');

    // Rank Prompt Modal Elements
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

    // Program Week Details Modal Elements
    const programWeekDetailsModalEl = document.getElementById('programWeekDetailsModal');
    const closeWeekDetailsModalBtnEl = document.getElementById('closeWeekDetailsModalBtn');
    const okWeekDetailsModalBtnEl = document.getElementById('okWeekDetailsModalBtn');

    // --- Global Helper/Utility Functions ---
    function setCurrentDate() {
        if (!currentDateEl) return;
        const now = new Date();
        currentDateEl.textContent = now.toLocaleDateString(undefined, { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    // --- Core App Logic ---
    // Make toggleTaskCompletion global for event listeners in dynamically generated content
    // This function is now defined in the global scope of this main script.
    window.toggleTaskCompletion = function(taskId) { 
        const taskKey = `c${appState.currentCycle}-${taskId}`;
        const newCompletions = {
            ...appState.taskCompletions,
            [taskKey]: !appState.taskCompletions[taskKey]
        };
        updateAppState({ taskCompletions: newCompletions });
        
        if (appState.currentPage === 'dashboard') {
            // These functions are imported and available in this scope
            renderCurrentWeekProgress(); 
            // Visually update checkbox directly for immediate feedback
            const checkbox = document.getElementById(taskKey); 
            const taskDetailsDiv = checkbox?.closest('li')?.querySelector('.task-details');
            if (checkbox && taskDetailsDiv) {
                if (appState.taskCompletions[taskKey]) taskDetailsDiv.classList.add('completed');
                else taskDetailsDiv.classList.remove('completed');
            }
        }
        if (appState.currentPage === 'program') {
            // This function is imported and available
            renderProgramOverviewPage(mainContentEl); 
        }
        
        const weekData = programData[appState.currentWeek];
        if(weekData && weekData.days[appState.currentDay]){
            const dayTasks = weekData.days[appState.currentDay].tasks;
            const allDayTasksCompleted = dayTasks.every(task => appState.taskCompletions[`c${appState.currentCycle}-${task.id}`]);
            const promptKey = `c${appState.currentCycle}w${appState.currentWeek}_endOfWeekPrompt`;
            if(allDayTasksCompleted && 
                appState.currentDay === getTotalDaysInWeek(appState.currentWeek) && 
                appState.currentWeek >= 1 && appState.currentWeek <= 6 && 
                !appState.hasPromptedRankForWeek[promptKey]) {
                setTimeout(() => promptForRank(appState.currentWeek, 'endOfWeek'), 200);
            }
        }
    }

    function startNewCycle() {
        if (confirm("Are you sure you want to start a new cycle? This will start tracking for a new cycle. Previous data is retained.")) {
            const newCycleNumber = appState.currentCycle + 1;
            let newHasPromptedRankForWeek = { ...appState.hasPromptedRankForWeek };
            Object.keys(newHasPromptedRankForWeek).forEach(key => {
                if (key.startsWith(`c${newCycleNumber}w`)) {
                    delete newHasPromptedRankForWeek[key];
                }
            });

            updateAppState({
                currentCycle: newCycleNumber,
                currentWeek: 1,
                currentDay: 1,
                hasPromptedInitialRankThisCycle: false,
                hasPromptedRankForWeek: newHasPromptedRankForWeek
            });
            
            alert(`New Cycle (#${appState.currentCycle}) started! Back to Week 1, Day 1.`);
            RENDER_PAGE_FROM_MAIN_NAV(); // Call the imported renderPage
            checkAndPromptForInitialRank(); 
        }
    }

    function checkAndPromptForInitialRank() {
        const currentCycleInitialRankExists = appState.rankHistory.some(
            r => r.cycle === appState.currentCycle && r.type === 'initial'
        );
        if (!currentCycleInitialRankExists && !appState.hasPromptedInitialRankThisCycle) {
            setTimeout(() => {
                 promptForRank(0, 'initial'); 
            }, 600); 
        }
    }

    // --- Initialization Function ---
    function initializeApp() {
        loadState(); 
        setCurrentDate(); 

        initThemeControls(themeToggleBtn); 
        initMainNavigation(mainContentEl, navLinks); 
        initRankPromptModal( 
            rankPromptModalEl, rankPromptTitleEl, modalRankLogFormEl,
            modalRankLogWeekInputEl, modalRankLogTypeInputEl, modalRankTierSelectEl,
            modalRankDivisionButtonsEl, modalRankDivisionValueInputEl,
            closeRankPromptModalBtnEl, saveModalRankLogBtnEl, cancelModalRankLogBtnEl
        );
        
        // Initialize Program Week Details Modal Listeners
        if (typeof initProgramWeekDetailsModalListeners === 'function') {
            initProgramWeekDetailsModalListeners(closeWeekDetailsModalBtnEl, okWeekDetailsModalBtnEl, programWeekDetailsModalEl);
        } else {
            console.error("initProgramModals function (aliased as initProgramWeekDetailsModalListeners) not found or not imported correctly from ui-render-program.js");
        }
        
        if (newCycleBtn) newCycleBtn.addEventListener('click', startNewCycle);
        
        RENDER_PAGE_FROM_MAIN_NAV(); // Call the imported renderPage for initial rendering
        applyTheme(); 
        checkAndPromptForInitialRank(); 
    }

    // --- Start the App ---
    initializeApp();
});