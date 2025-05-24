// scripts/script.js (Main Orchestrator)
import { getAppState, loadState, saveState, updateAppState } from './app-state.js';
import { programData, getTotalDaysInWeek } from './program-data.js';
// import { initThemeControls, applyTheme } from './ui-theme.js'; // initThemeControls removed, applyTheme used in main-navigation
import { applyTheme } from './ui-theme.js'; // applyTheme will be used directly
import { initMainNavigation, renderPage as RENDER_PAGE_FROM_MAIN_NAV } from './main-navigation.js';
import { initRankPromptModal, promptForRank } from './ui-modals.js';
import { renderCurrentWeekProgress } from './ui-render-dashboard-tasks.js';
import { renderDashboardRankChart } from './ui-render-dashboard-main.js';
import { renderProgramOverviewPage, initProgramModals as initProgramWeekDetailsModalListeners } from './ui-render-program.js';

// Moved to top level
function checkAndPromptForInitialRank() {
    const currentAppState = getAppState();
    // Don't prompt on the very first application run (before any state is saved)
    if (!currentAppState.hasRunOnce) {
        return; 
    }

    const currentCycleInitialRankExists = currentAppState.rankHistory.some(
        rankEntry => rankEntry.cycle === currentAppState.currentCycle && rankEntry.type === 'initial'
    );

    // Prompt if initial rank for the current cycle doesn't exist and hasn't been prompted yet
    if (!currentCycleInitialRankExists && !currentAppState.hasPromptedInitialRankThisCycle) {
        // Delay slightly to allow page rendering to settle
        setTimeout(() => promptForRank(0, 'initial'), 600); 
    }
}

// Moved to top level and exported
export function startNewCycle() { 
    const currentAppState = getAppState(); // Get current state at the beginning
    if (confirm("Are you sure you want to start a new cycle? Previous data is retained but current views will reset to the new cycle.")) {
        const newCycleNumber = currentAppState.currentCycle + 1;
        
        // Clear rank prompts for the new cycle
        const newHasPromptedRankForWeek = Object.fromEntries(
            Object.entries(currentAppState.hasPromptedRankForWeek)
                  .filter(([key]) => !key.startsWith(`c${newCycleNumber}w`))
        );

        updateAppState({
            currentCycle: newCycleNumber,
            currentWeek: 1,
            currentDay: 1,
            hasPromptedInitialRankThisCycle: false,
            hasPromptedRankForWeek: newHasPromptedRankForWeek
        });

        alert(`New Cycle (#${getAppState().currentCycle}) started!`); // Use getAppState() for the latest value after update
        RENDER_PAGE_FROM_MAIN_NAV(); // Refresh the current page view
        checkAndPromptForInitialRank(); // Check if initial rank for the new cycle is needed
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Prevent all native dragging of elements to improve UX
    document.body.addEventListener('dragstart', event => event.preventDefault());
    // --- DOM Element Selection & Caching ---
    const currentDateEl = document.getElementById('currentDate');
    const mainContentEl = document.querySelector('.app-main');
    const navLinks = document.querySelectorAll('.app-nav .nav-link');
    const hamburgerMenuBtn = document.getElementById('hamburgerMenuBtn');
    const googleNav = document.querySelector('.google-nav');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // New event handler for task completion
    function handleTaskClick(event) {
        const clickedElement = event.target;
        // Find the task list item (li) that was clicked, ensuring it's a direct child of #taskList
        const taskListItem = clickedElement.closest('#taskList > li');

        if (!taskListItem) {
            return; // Click was not on a task item in the main task list
        }

        const checkbox = taskListItem.querySelector('input[type="checkbox"].task-item-checkbox');
        if (!checkbox) {
            return; // This task item doesn't have the expected checkbox
        }

        // If an interactive element *inside* the task item was clicked (e.g. a hypothetical future link/button),
        // and it's not the checkbox itself, you might want to prevent toggling.
        // For now, any click on the LI that isn't the checkbox will toggle the checkbox.
        // This means if you have other interactive elements, their events might also bubble up here.

        // If the click was not directly on the checkbox, programmatically change its state.
        // The default checkbox click action will have already changed checkbox.checked by this point if it was a direct click.
        if (clickedElement !== checkbox) {
            checkbox.checked = !checkbox.checked;
        }
        // Now, checkbox.checked reflects the new state of the task.

        // --- Rest of the logic is the same as original, using the 'checkbox' variable ---
        const taskKey = checkbox.id;
        const currentAppState = getAppState();

        const newCompletions = { ...currentAppState.taskCompletions, [taskKey]: checkbox.checked };
        updateAppState({ taskCompletions: newCompletions });

        if (currentAppState.currentPage === 'dashboard') {
            renderCurrentWeekProgress();
        }
        if (currentAppState.currentPage === 'program') {
            const mainContentEl = document.querySelector('.app-main'); // Re-select or ensure it's available in this scope
            renderProgramOverviewPage(mainContentEl);
        }

        const taskDetailsDiv = taskListItem.querySelector('.task-details');
        if (taskDetailsDiv) {
            taskDetailsDiv.classList.toggle('completed', checkbox.checked);
        }
        taskListItem.classList.toggle('task-completed', checkbox.checked); // Ensure LI class is also toggled

        promptForRankAtEndOfWeekIfNeeded();
    }
    mainContentEl.addEventListener('click', handleTaskClick);

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

    const programWeekDetailsModalEl = document.getElementById('programWeekDetailsModal');
    const closeWeekDetailsModalBtnEl = document.getElementById('closeWeekDetailsModalBtn');
    const okWeekDetailsModalBtnEl = document.getElementById('okWeekDetailsModalBtn');

    // --- Global Helper ---
    function setCurrentDate() {
        if (!currentDateEl) return;
        const now = new Date();
        currentDateEl.textContent = now.toLocaleDateString(undefined, { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    // --- Core App Logic ---
    function promptForRankAtEndOfWeekIfNeeded() {
        const currentAppState = getAppState();
        const currentWeekData = programData[currentAppState.currentWeek];
        // Ensure current week and day data exists
        if (currentWeekData?.days?.[currentAppState.currentDay]) {
            const dayTasks = currentWeekData.days[currentAppState.currentDay].tasks;
            const allDayTasksCompleted = dayTasks.every(task => 
                currentAppState.taskCompletions[`c${currentAppState.currentCycle}-${task.id}`]
            );
            
            const promptKey = `c${currentAppState.currentCycle}w${currentAppState.currentWeek}_endOfWeekPrompt`;

            // Check if all tasks for the current day are completed,
            // if it's the last day of the week, for relevant weeks,
            // and if the rank prompt hasn't been shown for this week yet.
            if (allDayTasksCompleted &&
                currentAppState.currentDay === getTotalDaysInWeek(currentAppState.currentWeek) &&
                currentAppState.currentWeek >= 1 && currentAppState.currentWeek <= 6 && // Assuming ranks are prompted for weeks 1-6
                !currentAppState.hasPromptedRankForWeek[promptKey]) {
                // Use a short delay to ensure UI updates before showing the prompt
                setTimeout(() => promptForRank(currentAppState.currentWeek, 'endOfWeek'), 200);
            }
        }
    }

    // Export this function to be used in settings page - MOVED TO TOP LEVEL
    // export function startNewCycle() { ... }

    // function checkAndPromptForInitialRank() { ... } // MOVED TO TOP LEVEL

    // --- Application Initialization ---
    function initializeApp() {
        loadState(); 
        setCurrentDate(); 
        
        // initThemeControls(themeToggleBtn); // Removed
        initMainNavigation(mainContentEl, navLinks); 
        
        // Initialize modals
        initRankPromptModal( 
            rankPromptModalEl, rankPromptTitleEl, modalRankLogFormEl,
            modalRankLogWeekInputEl, modalRankLogTypeInputEl, modalRankTierSelectEl,
            modalRankDivisionButtonsEl, modalRankDivisionValueInputEl,
            closeRankPromptModalBtnEl, saveModalRankLogBtnEl, cancelModalRankLogBtnEl
        );

        if (typeof initProgramWeekDetailsModalListeners === 'function' && programWeekDetailsModalEl && closeWeekDetailsModalBtnEl && okWeekDetailsModalBtnEl) {
            initProgramWeekDetailsModalListeners(closeWeekDetailsModalBtnEl, okWeekDetailsModalBtnEl, programWeekDetailsModalEl);
        } else { 
            console.error("Failed to initialize Program Week Details Modal: Listeners or elements missing."); 
        }
        
        // Attach event listeners
        // if (newCycleBtn) { // Removed
        //     newCycleBtn.addEventListener('click', startNewCycle);
        // }
        
        RENDER_PAGE_FROM_MAIN_NAV(); // Render the initial page based on appState (renderPage itself will use getAppState)
        applyTheme(); // Apply the loaded or default theme
        
        // Handle first run and initial rank prompt
        // loadState() has already run and populated appState. We now use getAppState() to read it.
        if (!getAppState().hasRunOnce) {
            updateAppState({ hasRunOnce: true }); 
        } else {
            checkAndPromptForInitialRank(); 
        }
    }

    // Start the application
    initializeApp();

    // --- Hamburger Menu & Sidebar Toggle ---
    // Reuse previously cached elements: hamburgerMenuBtn, googleNav, sidebarOverlay

    if (hamburgerMenuBtn && googleNav) {
        hamburgerMenuBtn.addEventListener('click', () => {
            hamburgerMenuBtn.classList.toggle('active');

            if (window.matchMedia("(max-width: 768px)").matches) {
                // Mobile behavior: Overlay
                googleNav.classList.toggle('sidebar-visible');
                document.body.classList.toggle('body-sidebar-open');

                if (googleNav.classList.contains('sidebar-visible')) {
                    // If sidebar is open, listen for clicks on overlay or nav links to close it
                    if (sidebarOverlay) {
                        sidebarOverlay.addEventListener('click', closeMobileSidebar, { once: true });
                    }
                    const navLinksInSidebar = googleNav.querySelectorAll('.nav-link');
                    navLinksInSidebar.forEach(link => {
                        // link.addEventListener('click', closeMobileSidebar, { once: true });
                        // Defer closing the sidebar to allow navigation event to process first
                        link.addEventListener('click', () => {
                            setTimeout(closeMobileSidebar, 0); 
                        }, { once: true });
                    });
                } else {
                    // If sidebar is closed by hamburger, ensure overlay listener is also removed
                    if (sidebarOverlay) {
                        sidebarOverlay.removeEventListener('click', closeMobileSidebar);
                    }
                }
            } else {
                // Desktop behavior: Push content
                document.body.classList.toggle('body-sidebar-desktop-closed');
            }
        });
    }

    function closeMobileSidebar() {
        if (googleNav) googleNav.classList.remove('sidebar-visible');
        if (hamburgerMenuBtn) hamburgerMenuBtn.classList.remove('active');
        document.body.classList.remove('body-sidebar-open');
        if (sidebarOverlay) {
            sidebarOverlay.removeEventListener('click', closeMobileSidebar);
        }
    }
    
    // Optional: Add a resize listener to handle edge cases if window is resized
    // while mobile sidebar is open, to switch to desktop layout cleanly.
    // Debounced resize handler to switch mobile/desktop sidebar state
    function debounce(func, ms) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), ms);
        };
    }
    window.addEventListener('resize', debounce(() => {
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        if (!isMobile) {
            if (document.body.classList.contains('body-sidebar-open')) {
                closeMobileSidebar();
                document.body.classList.remove('body-sidebar-desktop-closed');
            }
        } else {
            if (document.body.classList.contains('body-sidebar-desktop-closed')) {
                closeMobileSidebar();
            }
        }
    }, 100));
});