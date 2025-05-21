// scripts/ui-render-dashboard-main.js
// Main dashboard rendering and navigation logic, split from ui-render-dashboard.js
import { renderCurrentDayTasks, renderCurrentWeekProgress, prepareRankChartData, setupCustomWarmupUI, setupDailyNotesArea } from './ui-render-dashboard-tasks.js';
import { appState } from './app-state.js';
import { populateRankSelects, generateDivisionButtons, addRankEntry } from './ui-render-progress.js';
import { programData } from './program-data.js';
import { navigateToDay, updateNavigationButtons } from './main-navigation.js';

let lastSelectedDashboardTier = '';
let rankChartInstanceDashboard = null;

export function renderDashboardRankChart() {
    const chartContainer = document.getElementById('dashboardRankChartContainer');
    if (!chartContainer) return;
    
    // Get the chart data and configuration
    const { data: currentCycleRankData, config: chartConfig } = prepareRankChartData();

    // Handle empty data case
    if (currentCycleRankData.length === 0) {
        chartContainer.innerHTML = '<p style="text-align:center; padding-top:20px;">No rank data logged for current cycle.</p>';
        return;
    }

    // Clean up existing chart instance
    if (rankChartInstanceDashboard) {
        rankChartInstanceDashboard.destroy();
        rankChartInstanceDashboard = null;
    }

    // Ensure canvas exists
    if (!document.getElementById('dashboardRankChart')) {
        chartContainer.innerHTML = '<canvas id="dashboardRankChart"></canvas>';
    }

    // Create new chart instance
    const newCanvasEl = document.getElementById('dashboardRankChart');
    if (newCanvasEl) {
        rankChartInstanceDashboard = new Chart(newCanvasEl, chartConfig);
    } else {
        console.error("Dashboard chart canvas not found after attempting to re-add it.");
    }
}

export function renderDashboardPage(mainContentEl) {
    mainContentEl.innerHTML = `
        <div class="dashboard-layout">
            <div class="dashboard-main-content">
                <section class="week-info">
                    <h2 id="weekTitle"></h2>
                    <p id="weekFocus"></p>
                    <div class="current-week-progress">
                        <p id="currentWeekProgressText"></p>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" id="currentWeekProgressBar"></div>
                        </div>
                    </div>
                    <h3 id="dayTitle"></h3>
                </section>
                <section class="custom-warmup-section">
                    <h4>Custom Warm-up/Aim Routine</h4>
                    <ul id="customWarmupList"></ul>
                    <button id="addCustomWarmupBtn" style="margin-top:6px;">Add Warm-up Drill</button>
                </section>
                <div id="customWarmupModal" class="modal">
                    <div class="modal-content">
                        <h3>Add Warm-up Drill</h3>
                        <div class="form-group" style="margin-bottom:18px;">
                            <label for="customWarmupName">Drill Name</label>
                            <input id="customWarmupName" type="text" maxlength="40" placeholder="e.g. Tile Frenzy, Aim Lab Grid Shot" />
                        </div>
                        <div class="form-group" style="margin-bottom:18px;">
                            <label for="customWarmupDesc">Description or Code <span style="color:var(--current-accent-color); font-weight:normal;">(optional)</span></label>
                            <input id="customWarmupDesc" type="text" maxlength="80" placeholder="Description, workshop code, or link" />
                        </div>
                        <div style="display:flex; gap:12px; justify-content:flex-end;">
                            <button id="saveCustomWarmupBtn" class="form-button">Save</button>
                            <button id="cancelCustomWarmupBtn" class="form-button" style="background:var(--danger-color); color:#fff;">Cancel</button>
                        </div>
                    </div>
                </div>
                <section class="tasks-section">
                    <h4>Today's Tasks</h4>
                    <ul class="task-list" id="taskList"></ul>
                </section>
                <section class="day-navigation-controls">
                    <button class="nav-button prev-day-btn" id="prevDayBtn">« Previous Day</button>
                    <button class="nav-button next-day-btn" id="nextDayBtn">Next Day »</button>
                </section>
            </div>
            <aside class="dashboard-side-panel">
                <section class="daily-notes-section">
                    <h4>Daily Notes for <span id="dailyNotesDateHeader">W${appState.currentWeek}D${appState.currentDay}</span></h4>
                    <textarea id="dailyNotesTextarea" placeholder="Reflections, VOD notes, goals..."></textarea>
                </section>
                <section class="dashboard-rank-section">
                    <h4>Quick Rank Update</h4>
                    <form id="dashboardRankUpdateForm" class="dashboard-rank-update-form">
                        <div class="form-group">
                            <label for="dashboardRankTier">Tier:</label>
                            <select id="dashboardRankTier" name="dashboardRankTier" required></select> 
                        </div>
                        <div class="form-group">
                            <label>Division:</label>
                            <div id="dashboardRankDivisionButtons" class="division-buttons"></div>
                            <input type="hidden" id="dashboardRankDivisionValue" name="dashboardRankDivisionValue">
                        </div>
                        <button type="submit" class="form-button">Update Today's Rank</button>
                    </form>
                    <div id="dashboardRankChartContainer" style="min-height: 220px; position: relative;">
                         <canvas id="dashboardRankChart"></canvas>
                    </div>
                </section>
            </aside>
        </div>
    `;
    const dashboardRankTierSelect = document.getElementById('dashboardRankTier');
    populateRankSelects(dashboardRankTierSelect);
    if (lastSelectedDashboardTier && dashboardRankTierSelect) {
        dashboardRankTierSelect.value = lastSelectedDashboardTier;
    }
    if (dashboardRankTierSelect) {
        dashboardRankTierSelect.addEventListener('change', (e) => {
            lastSelectedDashboardTier = e.target.value;
        });
    }
    generateDivisionButtons(
        document.getElementById('dashboardRankDivisionButtons'),
        document.getElementById('dashboardRankDivisionValue'),
        'dashboard' 
    );
    const localPrevDayBtn = document.getElementById('prevDayBtn');
    const localNextDayBtn = document.getElementById('nextDayBtn');
    if (localPrevDayBtn) localPrevDayBtn.addEventListener('click', () => navigateToDay(-1));
    if (localNextDayBtn) localNextDayBtn.addEventListener('click', () => navigateToDay(1));
    const dashboardRankForm = document.getElementById('dashboardRankUpdateForm');
    if (dashboardRankForm) dashboardRankForm.addEventListener('submit', handleDashboardRankUpdate);
    renderCurrentDayTasks(); 
    renderCurrentWeekProgress();
    setupDailyNotesArea();
    renderDashboardRankChart();
    setupCustomWarmupUI();
}

function handleDashboardRankUpdate(event) {
    event.preventDefault();
    const form = event.target;
    const tier = form.elements['dashboardRankTier'].value; 
    const division = form.elements['dashboardRankDivisionValue'].value; 

    if (!tier || !division) { 
        alert("Please select a Tier and Division."); 
        return; 
    }
    
    addRankEntry({ 
        type: 'daily', 
        tier, 
        division 
    }); 

    // Save the tier selection in appState
    updateAppState({ lastSelectedTier: tier });
    
    // Clear division selection but keep tier
    const dashboardDivButtons = document.getElementById('dashboardRankDivisionButtons');
    if(dashboardDivButtons) dashboardDivButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
    const dashboardDivValueInput = document.getElementById('dashboardRankDivisionValue');
    if(dashboardDivValueInput) dashboardDivValueInput.value = '';
    
    // Re-apply the selected tier to the dropdown
    const dashboardRankTierSelect = document.getElementById('dashboardRankTier');
    if(dashboardRankTierSelect) dashboardRankTierSelect.value = tier;

    // Re-render the chart with updated data
    renderDashboardRankChart();
}
