// main-navigation.js
import { getAppState, updateAppState, themes } from './app-state.js';
import { programData, getTotalDaysInWeek } from './program-data.js';
import { applyTheme } from './ui-theme.js'; // Added
import { startNewCycle } from './script.js'; // Added
import { renderDashboardPage, renderDashboardRankChart, rankChartInstanceDashboard } from './ui-render-dashboard-main.js';
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

    const currentAppState = getAppState(); // For the event listener
    // Delegate clicks to nav container to reduce listeners
    navLinks.forEach(link => link.dataset.bound = true);
    navLinkElements[0].parentElement.addEventListener('click', e => {
        const target = e.target.closest('[data-page]');
        if (!target) return;
        e.preventDefault();
        const newPage = target.dataset.page;
        if (newPage !== getAppState().currentPage) {
            updateAppState({ currentPage: newPage });
            renderPage();
        }
    });
}

export function renderPage() {
    const currentAppState = getAppState();
    if (!mainContentEl) {
        console.error("Main content element not initialized for page rendering.");
        return;
    }


    // Destroy charts before clearing content to prevent Chart.js errors and memory leaks
    if (rankChartInstanceDashboard) {
        rankChartInstanceDashboard.destroy();
        // Do not reassign imported let variable here
    }
    if (rankChartInstanceProgress) {
        rankChartInstanceProgress.destroy();
        // Do not reassign imported let variable here
    }

    mainContentEl.innerHTML = '';

    // Update active nav link
    if (navLinks) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === currentAppState.currentPage) {
                link.classList.add('active');
            }
        });
    }

    switch (currentAppState.currentPage) {
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
        case 'settings': // Added settings page
            renderSettingsPage(mainContentEl);
            break;
        default:
            updateAppState({ currentPage: 'dashboard' }); // Fallback and save
            renderDashboardPage(mainContentEl); // Re-render dashboard
            return; // Exit early to avoid double saveState call
    }
    // saveState(); // saveState is now called by updateAppState or by functions that directly modify appState significantly
}

export function renderSettingsPage(mainContentEl) {
    const currentAppState = getAppState();
    mainContentEl.innerHTML = `
        <div class="settings-page content-card">
            <h2>Settings</h2>

            <section class="settings-section">
                <h3>Theme Selection</h3>
                <div class="theme-options">
                    <label for="themeSelector" style="display: block; margin-bottom: 8px;">Select Theme:</label>
                    <select id="themeSelector" name="theme" class="form-control" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--current-input-border); background-color: var(--current-input-bg); color: var(--current-text-color);"></select>
                </div>
            </section>

            <section class="settings-section">
                <h3>Data Management</h3>
            <p>This will reset your current cycle, rank history for the current cycle, task completions, and clear all daily notes. Program data itself will remain.</p>
                <button class="form-button form-button--danger" id="resetAllDataBtn">Reset Application Data</button>
            </section>
        </div>
    `;

    // Populate and handle the theme selector dropdown
    const themeSelector = mainContentEl.querySelector('#themeSelector');
    const availableThemes = themes; // appState.themes is imported via appState

    availableThemes.forEach(themeName => {
        const option = document.createElement('option');
        option.value = themeName;
        option.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
        themeSelector.appendChild(option);
    });

    themeSelector.value = currentAppState.theme;

    themeSelector.addEventListener('change', (event) => {
        updateAppState({ theme: event.target.value });
        applyTheme();
    });

    // Add event listener for Reset All Data button
    const resetAllDataBtn = document.getElementById('resetAllDataBtn');
    if (resetAllDataBtn) {
        resetAllDataBtn.addEventListener('click', () => {
            if (typeof startNewCycle === 'function') {
                startNewCycle(); 
            } else {
                console.error('Reset data function (startNewCycle) not available.');
                alert('Error: Reset functionality is currently unavailable.');
            }
        });
    }
}


export function navigateToDay(direction) {
    const currentAppState = getAppState();
    const oldWeek = currentAppState.currentWeek;
    // const oldDay = currentAppState.currentDay; // Not strictly needed here but good for debugging

    let targetDay = currentAppState.currentDay;
    let targetWeek = currentAppState.currentWeek;

    function computeTargetDay(week, day, dir) {
        const total = getTotalDaysInWeek(week);
        if (dir === 1) {
            if (day < total) return { week, day: day + 1 };
            return { week: week + 1, day: 1 };
        } else {
            if (day > 1) return { week, day: day - 1 };
            if (week > 1 && programData[week - 1]?.days) {
                const prevWeek = week - 1;
                return { week: prevWeek, day: getTotalDaysInWeek(prevWeek) };
            }
            return { week: 1, day: 1 };
        }
    }
    const { week: newWeek, day: newDay } = computeTargetDay(targetWeek, targetDay, direction);
    targetWeek = newWeek;
    targetDay = newDay;
    
    // Check if the target day/week actually exists in programData
    if (programData[targetWeek] && programData[targetWeek].days && programData[targetWeek].days[targetDay]) {
        updateAppState({ currentWeek: targetWeek, currentDay: targetDay });
        
        // Update warmups that should persist across days
        updateWarmupDays();
        
        // Check for end-of-week rank prompt if moving forward into a new week
        // Only prompt if the oldWeek was part of the 6-week program
        const promptKey = `c${currentAppState.currentCycle}w${oldWeek}_endOfWeekPrompt`;
        if (direction === 1 && targetWeek > oldWeek && oldWeek >= 1 && oldWeek <= 6) {
            if (!currentAppState.hasPromptedRankForWeek[promptKey]) {
                // Use a small timeout to allow the page to render before showing the modal
                setTimeout(() => promptForRank(oldWeek, 'endOfWeek'), 250);
            }
        }
        renderPage(); // This will re-render dashboard with new day
    } else {
        console.warn(`Navigation target W${targetWeek}D${targetDay} not found in programData or boundary reached.`);
        // If navigation fails (e.g., trying to go beyond defined program), ensure buttons are updated for current valid day
        if (getAppState().currentPage === 'dashboard') { // Check current page from fresh state
            updateNavigationButtons();
        }
    }
}

export function updateNavigationButtons() {
    const currentAppState = getAppState();
    // This function assumes it's called when the dashboard is the active page
    // and its specific prev/next day buttons exist.
    const prevBtn = document.getElementById('prevDayBtn');
    const nextBtn = document.getElementById('nextDayBtn');

    if (!prevBtn || !nextBtn) { 
        // Not on dashboard, or buttons not rendered yet.
        return;
    }

    // Disable "Previous Day" if on Week 1, Day 1 of the entire program
    prevBtn.disabled = (currentAppState.currentWeek === 1 && currentAppState.currentDay === 1);

    // Determine if there's a "next" day available in programData
    let nextDayExists = false;
    const currentWeekData = programData[currentAppState.currentWeek];
    if (currentWeekData && currentWeekData.days) {
        const totalDaysInCurrentWeek = getTotalDaysInWeek(currentAppState.currentWeek);
        if (currentAppState.currentDay < totalDaysInCurrentWeek) { 
            // Is there another day in the current week?
            if (currentWeekData.days[currentAppState.currentDay + 1]) {
                nextDayExists = true;
            }
        } else { // Current day is the last in the current week, check next week
            const nextWeekData = programData[currentAppState.currentWeek + 1];
            if (nextWeekData && nextWeekData.days && nextWeekData.days[1]) { // Does next week exist and have a day 1?
                nextDayExists = true;
            }
        }
    }
    nextBtn.disabled = !nextDayExists;
}