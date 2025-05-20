// scripts/ui-render-dashboard.js
import { appState, updateAppState } from './app-state.js';
import { programData, getTotalDaysInWeek } from './program-data.js';
import { navigateToDay, updateNavigationButtons } from './main-navigation.js';
// toggleTaskCompletion is now on window object, called from event listener directly
import { populateRankSelects, generateDivisionButtons, addRankEntry, createRankChartConfig } from './ui-render-progress.js'; 

let dailyNoteSaveTimeout = null;
export let rankChartInstanceDashboard = null; 

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
                        <button type="submit" class="form-button">Update Today's Rank</button> <!-- Ensured .form-button class -->
                    </form>
                    <div id="dashboardRankChartContainer" style="min-height: 220px; position: relative;">
                         <canvas id="dashboardRankChart"></canvas>
                    </div>
                </section>
            </aside>
        </div>
    `;
    
    // Populate rank dropdowns and generate division buttons for the dashboard form
    populateRankSelects(document.getElementById('dashboardRankTier'));
    generateDivisionButtons(
        document.getElementById('dashboardRankDivisionButtons'),
        document.getElementById('dashboardRankDivisionValue'),
        'dashboard' // Prefix for button IDs
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
}

export function renderCurrentWeekProgress() {
    const progressTextEl = document.getElementById('currentWeekProgressText');
    const progressBarEl = document.getElementById('currentWeekProgressBar');
    if (!progressTextEl || !progressBarEl) return;

    const weekData = programData[appState.currentWeek];
    if (!weekData || !weekData.days) {
        progressTextEl.textContent = "Week data not available.";
        progressBarEl.style.width = '0%';
        progressBarEl.textContent = ''; 
        return;
    }

    let tasksInWeek = 0;
    let completedInWeek = 0;
    for (const dayNum in weekData.days) {
        const day = weekData.days[dayNum];
        if (day.tasks) {
            tasksInWeek += day.tasks.length;
            day.tasks.forEach(task => {
                const taskKey = `c${appState.currentCycle}-${task.id}`;
                if (appState.taskCompletions[taskKey]) {
                    completedInWeek++;
                }
            });
        }
    }
    const percent = tasksInWeek > 0 ? Math.round((completedInWeek / tasksInWeek) * 100) : 0;
    progressTextEl.textContent = `Current Week Progress: ${completedInWeek} / ${tasksInWeek} tasks`;
    progressBarEl.style.width = `${percent}%`;
    progressBarEl.textContent = percent > 10 ? `${percent}%` : '';
}

export function renderCurrentDayTasks() {
    const localWeekTitleEl = document.getElementById('weekTitle');
    const localWeekFocusEl = document.getElementById('weekFocus');
    const localDayTitleEl = document.getElementById('dayTitle');
    const localTaskListEl = document.getElementById('taskList');

    if (!localWeekTitleEl || !localTaskListEl) return; 

    const weekData = programData[appState.currentWeek];
    if (!weekData) {
        localWeekTitleEl.textContent = "Error"; 
        if(localWeekFocusEl) localWeekFocusEl.textContent = "";
        if(localDayTitleEl) localDayTitleEl.textContent = "";
        localTaskListEl.innerHTML = `<li>Week data missing for Week ${appState.currentWeek}.</li>`;
        updateNavigationButtons(); return;
    }
    const dayData = weekData.days[appState.currentDay];
    if (!dayData) {
        localWeekTitleEl.textContent = `W${appState.currentWeek}: ${weekData.title}`;
        if(localWeekFocusEl) localWeekFocusEl.textContent = `Focus: ${weekData.focus}`;
        if(localDayTitleEl) localDayTitleEl.textContent = "Error: Day data missing";
        localTaskListEl.innerHTML = `<li>Day data missing for W${appState.currentWeek}D${appState.currentDay}.</li>`;
        updateNavigationButtons(); return;
    }

    localWeekTitleEl.textContent = `Week ${appState.currentWeek}: ${weekData.title}`;
    if(localWeekFocusEl) localWeekFocusEl.textContent = `Focus: ${weekData.focus}`;
    if(localDayTitleEl) localDayTitleEl.textContent = dayData.title;

    localTaskListEl.innerHTML = ''; 
    if (dayData.tasks && dayData.tasks.length > 0) {
        dayData.tasks.forEach(task => {
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            const taskKey = `c${appState.currentCycle}-${task.id}`; 
            checkbox.type = 'checkbox';
            checkbox.id = taskKey; 
            checkbox.checked = appState.taskCompletions[taskKey] || false;
            checkbox.addEventListener('change', () => window.toggleTaskCompletion(task.id)); 

            const taskDetailsDiv = document.createElement('div');
            taskDetailsDiv.classList.add('task-details');
            if (checkbox.checked) taskDetailsDiv.classList.add('completed');
            
            const taskTextSpan = document.createElement('span');
            taskTextSpan.textContent = task.text;
            taskDetailsDiv.appendChild(taskTextSpan);

            if (task.focus) { 
                const focusSpan = document.createElement('span');
                focusSpan.classList.add('task-focus');
                focusSpan.textContent = `(Focus: ${task.focus})`;
                taskDetailsDiv.appendChild(focusSpan);
            }
            
            li.appendChild(checkbox);
            li.appendChild(taskDetailsDiv);
            localTaskListEl.appendChild(li);
        });
    } else {
        localTaskListEl.innerHTML = '<li>No tasks for today.</li>';
    }
    updateNavigationButtons(); 
}

function setupDailyNotesArea() {
    const dailyNotesTextarea = document.getElementById('dailyNotesTextarea');
    const dailyNotesDateHeader = document.getElementById('dailyNotesDateHeader');
    if (!dailyNotesTextarea || !dailyNotesDateHeader) return;

    const noteKey = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
    dailyNotesDateHeader.textContent = `W${appState.currentWeek}D${appState.currentDay}`;
    dailyNotesTextarea.value = appState.dailyNotes[noteKey] || '';

    dailyNotesTextarea.addEventListener('input', () => {
        saveDailyNoteWithDebounce(noteKey, dailyNotesTextarea.value);
    });
}
    
function saveDailyNoteWithDebounce(noteKey, text) {
    clearTimeout(dailyNoteSaveTimeout);
    dailyNoteSaveTimeout = setTimeout(() => {
        updateAppState({ dailyNotes: { ...appState.dailyNotes, [noteKey]: text } });
    }, 750); 
}

function handleDashboardRankUpdate(event) {
    event.preventDefault();
    const form = event.target;
    const tier = form.elements['dashboardRankTier'].value; 
    const division = form.elements['dashboardRankDivisionValue'].value; 

    if (!tier || !division) { alert("Please select a Tier and Division."); return; }
    
    addRankEntry({ 
        type: 'daily', 
        tier, 
        division 
    }); 

    form.reset(); 
    const dashboardDivButtons = document.getElementById('dashboardRankDivisionButtons');
    if(dashboardDivButtons) dashboardDivButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
    const dashboardDivValueInput = document.getElementById('dashboardRankDivisionValue');
    if(dashboardDivValueInput) dashboardDivValueInput.value = '';

    renderDashboardRankChart(); 
}

export function renderDashboardRankChart() {
    const chartContainer = document.getElementById('dashboardRankChartContainer');
    const canvasEl = document.getElementById('dashboardRankChart'); 
    if (!canvasEl || !chartContainer) return;

    if (rankChartInstanceDashboard) rankChartInstanceDashboard.destroy();
    
    const currentCycleRankData = appState.rankHistory
        .filter(r => r.cycle === appState.currentCycle)
        .sort((a,b) => new Date(a.dateLogged) - new Date(b.dateLogged)); 

    if (currentCycleRankData.length === 0) {
        chartContainer.innerHTML = '<p style="text-align:center; padding-top:20px; font-size:0.9em;">Log your rank to see progression here.</p>'; 
        return;
    }
    if (!document.getElementById('dashboardRankChart')) { 
        chartContainer.innerHTML = '<canvas id="dashboardRankChart"></canvas>'; 
    }

    const chartConfig = createRankChartConfig(currentCycleRankData, "Daily Rank Trend");
    const newCanvasEl = document.getElementById('dashboardRankChart'); // Re-fetch canvas after potential innerHTML change
    if (newCanvasEl) {
      rankChartInstanceDashboard = new Chart(newCanvasEl, chartConfig);
    } else {
        console.error("Dashboard chart canvas not found after attempting to re-add it.");
    }
}