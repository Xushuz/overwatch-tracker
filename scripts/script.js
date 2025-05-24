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
    // --- DOM Element Selection ---
    const currentDateEl = document.getElementById('currentDate');
    // const themeToggleBtn = document.getElementById('themeToggleBtn'); // Removed
    // const newCycleBtn = document.getElementById('newCycleBtn'); // Removed
    const mainContentEl = document.querySelector('.app-main');
    const navLinks = document.querySelectorAll('.app-nav .nav-link');

    // New event handler for task completion
    function handleTaskClick(event) {
        const checkbox = event.target;
        // Check if the clicked element is a task checkbox and is an INPUT element
        if (checkbox.tagName === 'INPUT' && checkbox.type === 'checkbox' && checkbox.classList.contains('task-item-checkbox')) {
            const currentAppState = getAppState(); // Get current state for this handler
            const taskKey = checkbox.id; // Assumes checkbox ID is the unique taskKey (e.g., c1-w1d1t1)

            // Update application state
            const newCompletions = { ...currentAppState.taskCompletions, [taskKey]: checkbox.checked };
            updateAppState({ taskCompletions: newCompletions });

            // Re-render relevant parts of the UI
            // Use getAppState() here to get the absolute latest state after the update, if needed for rendering logic.
            // Or, if the rendering logic doesn't immediately depend on the just-updated state, currentAppState might be fine.
            // For currentPage, it's unlikely to change within this specific handler, so currentAppState is okay.
            if (currentAppState.currentPage === 'dashboard') {
                renderCurrentWeekProgress(); // Make sure this function is accessible
            }
            if (currentAppState.currentPage === 'program') {
                // mainContentEl is accessible in this scope from DOMContentLoaded
                renderProgramOverviewPage(mainContentEl); // Make sure this function is accessible
            }

            // Update visual style of the task item
            const taskDetailsDiv = checkbox.closest('li')?.querySelector('.task-details'); // Assumes tasks are in <li> elements
            if (taskDetailsDiv) {
                taskDetailsDiv.classList.toggle('completed', checkbox.checked);
            }
            
            // Check if end-of-week rank prompt is needed
            promptForRankAtEndOfWeekIfNeeded(); // Make sure this function is accessible
        }
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

    // --- Adjust nav padding based on header height & Hamburger Menu ---
    const appHeader = document.querySelector('.app-header');
    const googleNav = document.querySelector('.google-nav'); // Unified declaration for both features

    function adjustNavPadding() {
        if (appHeader && googleNav) { // Use unified googleNav
            const headerHeight = appHeader.offsetHeight;
            googleNav.style.paddingTop = headerHeight + 'px'; // Use unified googleNav
        }
    }

    adjustNavPadding(); // Initial adjustment
    window.addEventListener('resize', adjustNavPadding); // Adjust on resize

    // --- Hamburger Menu & Sidebar Toggle ---
    const hamburgerMenuBtn = document.getElementById('hamburgerMenuBtn');
    // googleNav is already declared above and used by hamburger logic below
    const appMain = document.querySelector('.app-main'); // Main content area
    // Conceptual: Ensure an overlay div exists in index.html: <div class="sidebar-overlay" id="sidebarOverlay"></div>
    const sidebarOverlay = document.getElementById('sidebarOverlay'); 

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
    window.addEventListener('resize', () => {
        if (!window.matchMedia("(max-width: 768px)").matches) {
            // If we are now on desktop view
            if (document.body.classList.contains('body-sidebar-open')) {
                // If mobile overlay was open, close it and ensure desktop state is default (open)
                closeMobileSidebar();
                document.body.classList.remove('body-sidebar-desktop-closed'); // Ensure desktop sidebar is open
            }
        } else {
            // If we are now on mobile view
            if (!document.body.classList.contains('body-sidebar-desktop-closed')) {
                // If desktop sidebar was open, it should be closed by default on mobile (hidden off-screen)
                // unless explicitly opened by hamburger.
                // No direct action needed here as mobile CSS handles the default hidden state.
            }
             if (document.body.classList.contains('body-sidebar-desktop-closed')) {
                // If desktop sidebar was closed, ensure mobile overlay is not active
                closeMobileSidebar();
            }
        }
    });
});