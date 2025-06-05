// DEBUG: Global submit event listener
window.addEventListener('submit', function(e) {
    console.log('[Global] Submit event fired for:', e.target);
}, true);

// scripts/ui-render-dashboard-main.js
// Main dashboard rendering and navigation logic, split from ui-render-dashboard.js
import { renderCurrentDayTasks, renderCurrentWeekProgress, prepareRankChartData, setupCustomWarmupUI, setupDailyNotesArea } from './ui-render-dashboard-tasks.js';
import { getAppState, updateAppState } from './app-state.js';
import { populateRankSelects, generateDivisionButtons, addRankEntry } from './ui-render-progress.js';
import { getProgramData } from './program-data.js';
import { navigateToDay, updateNavigationButtons } from './main-navigation.js';
import { initDashboardCards } from './ui-dashboard-cards.js'; // Added dashboard cards system

let lastSelectedDashboardTier = '';
export let rankChartInstanceDashboard = null;
let dashboardCardSystem = null; // Added dashboard card system instance

export async function renderDashboardRankChart() {
    // Lazy-load Chart.js only when needed
    if (typeof window.Chart !== 'function') {
        await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            s.onload = resolve;
            s.onerror = () => reject(new Error('Failed to load Chart.js'));
            document.head.appendChild(s);
        });
    }
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
                    <button class="form-button" id="addCustomWarmupBtn" style="margin-top:6px;">Add Warm-up Drill</button>
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
                            <button id="saveCustomWarmupBtn" class="form-button form-button--primary">Save</button>
                            <button id="cancelCustomWarmupBtn" class="form-button form-button--danger">Cancel</button>
                        </div>
                    </div>
                </div>
                <section class="tasks-section">
                    <h4>Today's Tasks</h4>
                    <ul class="task-list" id="taskList"></ul>
                </section>
                <section class="day-navigation-controls">
                    <button class="form-button nav-button prev-day-btn" id="prevDayBtn">« Previous Day</button>
                    <button class="form-button nav-button next-day-btn" id="nextDayBtn">Next Day »</button>
                </section>
            </div>
            <aside class="dashboard-side-panel">
                <section class="daily-notes-section">
                    <h4>Daily Notes for <span id="dailyNotesDateHeader">W${getAppState().currentWeek}D${getAppState().currentDay}</span></h4>
                    <textarea id="dailyNotesTextarea" placeholder="Reflections, VOD notes, goals..."></textarea>
                </section>
                <section class="dashboard-rank-section">
                    <h4>Quick Rank Update</h4>
                    <form id="dashboardRankUpdateForm" class="dashboard-rank-update-form">
                        <div class="form-group">
                            <label>Role:</label>
                            <div id="dashboardRoleToggle" class="role-toggle-group" style="display:flex;gap:8px;margin-bottom:10px;">
                                <button type="button" class="role-toggle-btn selected" data-role="dps">DPS</button>
                                <button type="button" class="role-toggle-btn" data-role="tank">Tank</button>
                                <button type="button" class="role-toggle-btn" data-role="support">Support</button>
                                <input type="hidden" id="dashboardRankRoleValue" name="dashboardRankRoleValue" value="dps">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="dashboardRankTier">Tier:</label>
                            <select id="dashboardRankTier" name="dashboardRankTier" required></select> 
                        </div>
                        <div class="form-group">
                            <label>Division:</label>
                            <div id="dashboardRankDivisionButtons" class="division-buttons"></div>
                            <input type="hidden" id="dashboardRankDivisionValue" name="dashboardRankDivisionValue">
                        </div>
                        <button type="submit" class="form-button form-button--primary form-button--full-width">Update Today's Rank</button>
                    </form>
                    <div id="dashboardRankChartContainer" style="min-height: 220px; position: relative;">
                         <canvas id="dashboardRankChart"></canvas>
                    </div>
                </section>
            </aside>
        </div>
    `;
    // Role toggle logic
    const roleToggleGroup = document.getElementById('dashboardRoleToggle');
    const roleHiddenInput = document.getElementById('dashboardRankRoleValue');
    if (roleToggleGroup && roleHiddenInput) {
        // Only allow one toggle at a time, and prevent unselecting all
        roleToggleGroup.querySelectorAll('.role-toggle-btn').forEach(btn => {
            // Apply theme class for role
            btn.classList.remove('role-dps', 'role-tank', 'role-support');
            if (btn.dataset.role === 'dps') btn.classList.add('role-dps');
            if (btn.dataset.role === 'tank') btn.classList.add('role-tank');
            if (btn.dataset.role === 'support') btn.classList.add('role-support');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                // Only toggle if not already selected
                if (!btn.classList.contains('selected')) {
                    roleToggleGroup.querySelectorAll('.role-toggle-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    roleHiddenInput.value = btn.dataset.role;
                }
            });
        });
    }
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
        'dashboard',
        5 // Preselect division 5 by default
    );
    const localPrevDayBtn = document.getElementById('prevDayBtn');
    const localNextDayBtn = document.getElementById('nextDayBtn');
    if (localPrevDayBtn) {
        localPrevDayBtn.addEventListener('click', () => {
            if (!localPrevDayBtn.disabled) {
                navigateToDay(-1);
            }
        });
    }
    if (localNextDayBtn) {
        localNextDayBtn.addEventListener('click', () => {
            if (!localNextDayBtn.disabled) {
                navigateToDay(1);
            }
        });
    }
    const dashboardRankForm = document.getElementById('dashboardRankUpdateForm');
    if (dashboardRankForm) {
        console.log('[Dashboard] Attaching submit handler to dashboardRankUpdateForm');
        dashboardRankForm.addEventListener('submit', handleDashboardRankUpdate);
        dashboardRankForm.addEventListener('click', function(e) {
            console.log('[Dashboard] Form clicked:', e.target);
            const tier = document.getElementById('dashboardRankTier');
            const division = document.getElementById('dashboardRankDivisionValue');
            console.log('[Dashboard] Tier value:', tier ? tier.value : '(none)', 'Division value:', division ? division.value : '(none)');
        });
        const submitBtn = dashboardRankForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                console.log('[Dashboard] Submit button clicked (after render)');
                // Fallback: manually trigger form submit if not already submitting
                // Only do this if the event is not already a submit event
                if (typeof dashboardRankForm.requestSubmit === 'function') {
                    dashboardRankForm.requestSubmit();
                } else {
                    dashboardRankForm.submit();
                }
            });
        }
    } else {
        console.warn('[Dashboard] dashboardRankUpdateForm not found when trying to attach submit handler');
    }
    renderCurrentDayTasks();
    renderCurrentWeekProgress();
    setupDailyNotesArea(); // Restored call
    // Render chart, catch any load errors
    renderDashboardRankChart().catch(console.error);
    setupCustomWarmupUI();
    // Ensure navigation buttons are correctly enabled/disabled on initial load
    updateNavigationButtons();
    // Ensure prev/next buttons reflect correct disabled state
    updateNavigationButtons();

    // Initialize dashboard cards system
    dashboardCardSystem = initDashboardCards();
}

function handleDashboardRankUpdate(event) {
    console.log('[Dashboard] handleDashboardRankUpdate called');
    event.preventDefault();
    const form = event.target;

    const tier = form.elements['dashboardRankTier'].value; 
    const division = form.elements['dashboardRankDivisionValue'].value; 
    const role = form.elements['dashboardRankRoleValue'] ? form.elements['dashboardRankRoleValue'].value : 'dps';

    console.log('[Dashboard] Tier:', tier, 'Division:', division, 'Role:', role);
    if (!tier || !division || !role) { 
        alert("Please select a Role, Tier, and Division."); 
        return; 
    }

    console.log('[Dashboard] Calling addRankEntry with:', { type: 'daily', week: getAppState().currentWeek, tier, division, role });
    addRankEntry({ 
        type: 'daily', 
        week: getAppState().currentWeek, 
        tier, 
        division, 
        role
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

    console.log('[Dashboard] Triggering dashboard re-render');
    // Re-render the entire dashboard page to reflect the new rank and chart
    setTimeout(() => {
        if (typeof window.RENDER_PAGE_FROM_MAIN_NAV === 'function') {
            window.RENDER_PAGE_FROM_MAIN_NAV();
        } else if (typeof window.renderPage === 'function') {
            window.renderPage();
        } else {
            renderDashboardRankChart(); // fallback: just update chart
        }
    }, 50);
}
