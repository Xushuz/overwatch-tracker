// main-navigation.js
import { appState, updateAppState } from './app-state.js';
import { programData, getTotalDaysInWeek } from './program-data.js';
import { renderDashboardPage, renderDashboardRankChart } from './ui-render-dashboard-main.js';
import { renderProgramOverviewPage } from './ui-render-program.js';
import { renderDailyNotesSummaryPage } from './ui-render-notes.js';
import { renderRankHistoryPage, rankChartInstanceProgress } from './ui-render-progress.js';
import { renderResourcesPage } from './ui-render-resources.js';
import { promptForRank } from './ui-modals.js';
import { renderCurrentWeekProgress, updateWarmupDays } from './ui-render-dashboard-tasks.js';

let mainContentEl = null;
let navLinks = null;

export function initMainNavigation(mainContentElement, navLinkElements) {
    mainContentEl = mainContentElement;
    navLinks = navLinkElements;

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newPage = e.target.dataset.page;
            if (newPage !== appState.currentPage) {
                updateAppState({ currentPage: newPage });
                renderPage();
            }
        });
    });
}

export function renderPage() {
    if (!mainContentEl) {
        console.error("Main content element not initialized for page rendering.");
        return;
    }

    // Destroy charts before clearing content to prevent Chart.js errors and memory leaks
    if (rankChartInstanceDashboard) { 
        rankChartInstanceDashboard.destroy(); 
        // Important: ui-render-dashboard.js should re-assign its exported rankChartInstanceDashboard to null after destroy
        // For now, we assume it handles this or we manage it here if it's passed around.
        // Let's assume the render functions handle their own chart instances, but good to be aware.
    }
    if (rankChartInstanceProgress) { 
        rankChartInstanceProgress.destroy(); 
    }
    // The actual chart instances are managed within their respective ui-render-*.js modules.
    // This renderPage only clears mainContentEl. The individual render functions will create new charts.

    mainContentEl.innerHTML = ''; // Clear current main content

    // Update active nav link
    if (navLinks) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === appState.currentPage) {
                link.classList.add('active');
            }
        });
    }

    switch (appState.currentPage) {
        case 'dashboard':
            renderDashboardPage(mainContentEl);
            break;
        case 'program':
            renderProgramOverviewPage(mainContentEl);
            break;
        case 'dailyNotes':
            renderDailyNotesSummaryPage(mainContentEl);
            break;
        case 'progress':
            renderRankHistoryPage(mainContentEl);
            break;
        case 'resources':
            renderResourcesPage(mainContentEl);
            break;
        default:
            updateAppState({ currentPage: 'dashboard' }); // Fallback and save
            renderDashboardPage(mainContentEl); // Re-render dashboard
            return; // Exit early to avoid double saveState call
    }
    // saveState(); // saveState is now called by updateAppState or by functions that directly modify appState significantly
}


export function navigateToDay(direction) {
    const oldWeek = appState.currentWeek;
    // const oldDay = appState.currentDay; // Not strictly needed here but good for debugging

    let targetDay = appState.currentDay;
    let targetWeek = appState.currentWeek;

    if (direction === 1) { // Moving to Next Day
        const totalDaysInCurrentWeek = getTotalDaysInWeek(targetWeek);
        if (targetDay < totalDaysInCurrentWeek) {
            targetDay++;
        } else { // End of current week, try to move to next week
            targetWeek++;
            targetDay = 1; // Start at day 1 of the new week
        }
    } else if (direction === -1) { // Moving to Previous Day
        if (targetDay > 1) {
            targetDay--;
        } else { // Start of current week, try to move to previous week
            targetWeek--;
            if (programData[targetWeek] && programData[targetWeek].days && Object.keys(programData[targetWeek].days).length > 0) { 
                // Ensure previous week actually has days
                targetDay = getTotalDaysInWeek(targetWeek); // Go to last day of previous week
            } else {
                // At the very beginning, clamp to W1D1
                targetWeek = 1;
                targetDay = 1;
            }
        }
    }
    
    // Check if the target day/week actually exists in programData
    if (programData[targetWeek] && programData[targetWeek].days && programData[targetWeek].days[targetDay]) {
        updateAppState({ currentWeek: targetWeek, currentDay: targetDay });
        
        // Update warmups that should persist across days
        updateWarmupDays();
        
        // Check for end-of-week rank prompt if moving forward into a new week
        // Only prompt if the oldWeek was part of the 6-week program
        const promptKey = `c${appState.currentCycle}w${oldWeek}_endOfWeekPrompt`;
        if (direction === 1 && targetWeek > oldWeek && oldWeek >= 1 && oldWeek <= 6) {
            if (!appState.hasPromptedRankForWeek[promptKey]) {
                // Use a small timeout to allow the page to render before showing the modal
                setTimeout(() => promptForRank(oldWeek, 'endOfWeek'), 250);
            }
        }
        renderPage(); // This will re-render dashboard with new day
    } else {
        console.warn(`Navigation target W${targetWeek}D${targetDay} not found in programData or boundary reached.`);
        // If navigation fails (e.g., trying to go beyond defined program), ensure buttons are updated for current valid day
        if (appState.currentPage === 'dashboard') {
            updateNavigationButtons();
        }
    }
}

export function updateNavigationButtons() {
    // This function assumes it's called when the dashboard is the active page
    // and its specific prev/next day buttons exist.
    const prevBtn = document.getElementById('prevDayBtn');
    const nextBtn = document.getElementById('nextDayBtn');

    if (!prevBtn || !nextBtn) { 
        // Not on dashboard, or buttons not rendered yet.
        return;
    }

    // Disable "Previous Day" if on Week 1, Day 1 of the entire program
    prevBtn.disabled = (appState.currentWeek === 1 && appState.currentDay === 1);

    // Determine if there's a "next" day available in programData
    let nextDayExists = false;
    const currentWeekData = programData[appState.currentWeek];
    if (currentWeekData && currentWeekData.days) {
        const totalDaysInCurrentWeek = getTotalDaysInWeek(appState.currentWeek);
        if (appState.currentDay < totalDaysInCurrentWeek) { 
            // Is there another day in the current week?
            if (currentWeekData.days[appState.currentDay + 1]) {
                nextDayExists = true;
            }
        } else { // Current day is the last in the current week, check next week
            const nextWeekData = programData[appState.currentWeek + 1];
            if (nextWeekData && nextWeekData.days && nextWeekData.days[1]) { // Does next week exist and have a day 1?
                nextDayExists = true;
            }
        }
    }
    nextBtn.disabled = !nextDayExists;
}