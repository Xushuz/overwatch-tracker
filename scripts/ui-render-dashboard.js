// scripts/ui-render-dashboard.js
import { appState, updateAppState, saveState } from './app-state.js'; // Added saveState
import { programData, getTotalDaysInWeek } from './program-data.js';
import { navigateToDay, updateNavigationButtons } from './main-navigation.js';
import { populateRankSelects, generateDivisionButtons, addRankEntry, createRankChartConfig } from './ui-render-progress.js'; 

let dailyNoteSaveTimeout = null;
export let rankChartInstanceDashboard = null; 
let lastSelectedDashboardTier = ''; // Variable to store the last selected tier

export function renderDashboardPage(mainContentEl) {
    mainContentEl.innerHTML = `
        <div class="dashboard-layout">
            <div class="dashboard-main-content">
                <section class="week-info">
                    <h2 id="weekTitle"></h2>
                    <div id="personalFocusContainer"></div>
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
                    <div id="customWarmupFormContainer" style="display:none; margin-top:8px;">
                        <input id="customWarmupName" type="text" maxlength="40" placeholder="Drill name (e.g. KovaaK's Tile Frenzy)" style="width:40%;" />
                        <input id="customWarmupDesc" type="text" maxlength="80" placeholder="Description or code (optional)" style="width:40%;" />
                        <button id="saveCustomWarmupBtn">Save</button>
                        <button id="cancelCustomWarmupBtn">Cancel</button>
                    </div>
                </section>
                <section class="tasks-section">
                    <h4>Today's Tasks</h4>
                    <ul class="task-list" id="taskList"></ul>
                    <button id="addCustomTaskBtn" style="margin-top:8px;">Add Custom Task</button>
                    <div id="customTaskFormContainer" style="display:none; margin-top:8px;">
                        <input id="customTaskText" type="text" maxlength="80" placeholder="Describe your custom task..." style="width:60%;" />
                        <button id="saveCustomTaskBtn">Save</button>
                        <button id="cancelCustomTaskBtn">Cancel</button>
                    </div>
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
    // Pre-select last used tier if available
    if (lastSelectedDashboardTier && dashboardRankTierSelect) {
        dashboardRankTierSelect.value = lastSelectedDashboardTier;
    }
    // Add event listener to remember the selected tier
    if (dashboardRankTierSelect) {
        dashboardRankTierSelect.addEventListener('change', (e) => {
            lastSelectedDashboardTier = e.target.value;
            // Optionally, save this preference to localStorage if you want it to persist across sessions
            // localStorage.setItem('lastDashboardTier', lastSelectedDashboardTier);
            // If saving to localStorage, you'd load it in init() or at the top of this module.
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
    setupPersonalFocusUI();
    setupCustomWarmupUI();
    setupCustomTaskUI();
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
    const personalFocusContainer = document.getElementById('personalFocusContainer');

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
    if(localWeekFocusEl) {
        let focusText = `Focus: ${weekData.focus}`;
        const key = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
        if (appState.personalFocus && appState.personalFocus[key]) {
            focusText = `<span style='color:var(--current-accent-color);font-weight:bold;'>Personal Focus: ${appState.personalFocus[key]}</span><br>` + focusText;
        }
        localWeekFocusEl.innerHTML = focusText;
    }
    if(localDayTitleEl) localDayTitleEl.textContent = dayData.title;

    localTaskListEl.innerHTML = ''; 
    // Render custom warm-ups for today (if any)
    if (Array.isArray(appState.customWarmups) && appState.customWarmups.length > 0) {
        appState.customWarmups.forEach((w, idx) => {
            const li = document.createElement('li');
            li.classList.add('custom-warmup-task');
            li.innerHTML = `<span><strong>Warm-up:</strong> ${w.name}${w.description ? `: ${w.description}` : ''}</span>`;
            localTaskListEl.appendChild(li);
        });
    }
    // Render program tasks
    if (dayData.tasks && dayData.tasks.length > 0) {
        dayData.tasks.forEach(task => {
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            const taskKey = `c${appState.currentCycle}-${task.id}`; 
            
            checkbox.type = 'checkbox';
            checkbox.id = taskKey; 
            checkbox.checked = appState.taskCompletions[taskKey] || false;
            // The checkbox itself will still toggle if clicked directly due to default browser behavior.
            // We add a listener to the LI, and the LI listener will also toggle the checkbox.
            
            const taskDetailsDiv = document.createElement('div');
            taskDetailsDiv.classList.add('task-details');
            if (checkbox.checked) {
                taskDetailsDiv.classList.add('completed');
                li.classList.add('task-completed'); // Add class to LI for styling
            }
            
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

            // Add click listener to the entire list item (li)
            li.addEventListener('click', (event) => {
                // Prevent toggling if the click was directly on the checkbox itself,
                // as that would cause it to toggle twice.
                if (event.target !== checkbox) {
                    checkbox.checked = !checkbox.checked; // Manually toggle checkbox state
                }
                window.toggleTaskCompletion(task.id); // Call the global toggle function
                
                // Update visual style of LI immediately
                if (checkbox.checked) {
                    li.classList.add('task-completed');
                    taskDetailsDiv.classList.add('completed');
                } else {
                    li.classList.remove('task-completed');
                    taskDetailsDiv.classList.remove('completed');
                }
            });

            localTaskListEl.appendChild(li);
        });
    }
    // Render custom tasks for today
    const key = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
    if (appState.customTasks && appState.customTasks[key] && appState.customTasks[key].length > 0) {
        appState.customTasks[key].forEach((customTask, idx) => {
            const li = document.createElement('li');
            li.classList.add('custom-task');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = !!customTask.done;
            checkbox.addEventListener('change', () => {
                const updated = [...appState.customTasks[key]];
                updated[idx] = { ...updated[idx], done: !updated[idx].done };
                updateAppState({ customTasks: { ...appState.customTasks, [key]: updated } });
                renderCurrentDayTasks();
            });
            const taskDetailsDiv = document.createElement('div');
            taskDetailsDiv.classList.add('task-details');
            if (customTask.done) taskDetailsDiv.classList.add('completed');
            const taskTextSpan = document.createElement('span');
            taskTextSpan.textContent = customTask.text;
            taskDetailsDiv.appendChild(taskTextSpan);
            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.style.marginLeft = '8px';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                const updated = [...appState.customTasks[key]];
                updated.splice(idx, 1);
                updateAppState({ customTasks: { ...appState.customTasks, [key]: updated } });
                renderCurrentDayTasks();
            };
            taskDetailsDiv.appendChild(delBtn);
            li.appendChild(checkbox);
            li.appendChild(taskDetailsDiv);
            localTaskListEl.appendChild(li);
        });
    }
    if (!dayData.tasks?.length && !(appState.customTasks && appState.customTasks[key] && appState.customTasks[key].length > 0) && !(Array.isArray(appState.customWarmups) && appState.customWarmups.length > 0)) {
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

    lastSelectedDashboardTier = tier; // Remember the tier
    // form.reset(); // Resetting will clear the tier, so we might not want to do this if we want sticky tier
    // Instead of full reset, just clear division
    const dashboardDivButtons = document.getElementById('dashboardRankDivisionButtons');
    if(dashboardDivButtons) dashboardDivButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
    const dashboardDivValueInput = document.getElementById('dashboardRankDivisionValue');
    if(dashboardDivValueInput) dashboardDivValueInput.value = '';
    
    // Re-apply the selected tier to the dropdown
    const dashboardRankTierSelect = document.getElementById('dashboardRankTier');
    if(dashboardRankTierSelect) dashboardRankTierSelect.value = lastSelectedDashboardTier;


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
    const newCanvasEl = document.getElementById('dashboardRankChart'); 
    if (newCanvasEl) {
      rankChartInstanceDashboard = new Chart(newCanvasEl, chartConfig);
    } else {
        console.error("Dashboard chart canvas not found after attempting to re-add it.");
    }
}

function setupPersonalFocusUI() {
    const container = document.getElementById('personalFocusContainer');
    if (!container) return;
    const key = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
    const currentFocus = appState.personalFocus[key] || '';
    container.innerHTML = `
        <div style="margin-bottom: 6px;">
            <strong>Personal Focus of the Day:</strong>
            <span id="personalFocusDisplay">${currentFocus ? currentFocus : '<em>None set</em>'}</span>
            <button id="editPersonalFocusBtn" style="margin-left:8px; font-size:0.9em;">${currentFocus ? 'Edit' : 'Add'}</button>
        </div>
        <div id="personalFocusEditArea" style="display:none; margin-bottom:6px;">
            <input id="personalFocusInput" type="text" maxlength="80" style="width:60%; font-size:1em;" placeholder="e.g. Don\'t die first, Track ults proactively" />
            <button id="savePersonalFocusBtn" style="font-size:0.9em;">Save</button>
            <button id="cancelPersonalFocusBtn" style="font-size:0.9em;">Cancel</button>
        </div>
    `;
    const editBtn = document.getElementById('editPersonalFocusBtn');
    const editArea = document.getElementById('personalFocusEditArea');
    const input = document.getElementById('personalFocusInput');
    const saveBtn = document.getElementById('savePersonalFocusBtn');
    const cancelBtn = document.getElementById('cancelPersonalFocusBtn');
    if (editBtn && editArea && input && saveBtn && cancelBtn) {
        editBtn.addEventListener('click', () => {
            editArea.style.display = '';
            input.value = currentFocus;
            input.focus();
        });
        saveBtn.addEventListener('click', () => {
            const newFocus = input.value.trim();
            updateAppState({ personalFocus: { ...appState.personalFocus, [key]: newFocus } });
            setupPersonalFocusUI();
        });
        cancelBtn.addEventListener('click', () => {
            editArea.style.display = 'none';
        });
    }
}

function setupCustomWarmupUI() {
    const listEl = document.getElementById('customWarmupList');
    const addBtn = document.getElementById('addCustomWarmupBtn');
    const formContainer = document.getElementById('customWarmupFormContainer');
    const nameInput = document.getElementById('customWarmupName');
    const descInput = document.getElementById('customWarmupDesc');
    const saveBtn = document.getElementById('saveCustomWarmupBtn');
    const cancelBtn = document.getElementById('cancelCustomWarmupBtn');
    if (!listEl || !addBtn || !formContainer || !nameInput || !descInput || !saveBtn || !cancelBtn) return;
    function renderList() {
        listEl.innerHTML = '';
        (appState.customWarmups || []).forEach((w, idx) => {
            const li = document.createElement('li');
            li.textContent = w.name + (w.description ? `: ${w.description}` : '');
            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.style.marginLeft = '8px';
            delBtn.onclick = () => {
                const newWarmups = [...appState.customWarmups];
                newWarmups.splice(idx, 1);
                updateAppState({ customWarmups: newWarmups });
                renderList();
            };
            li.appendChild(delBtn);
            listEl.appendChild(li);
        });
    }
    renderList();
    addBtn.onclick = () => { formContainer.style.display = ''; };
    saveBtn.onclick = () => {
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        if (!name) return;
        updateAppState({ customWarmups: [...(appState.customWarmups || []), { name, description }] });
        nameInput.value = '';
        descInput.value = '';
        formContainer.style.display = 'none';
        renderList();
    };
    cancelBtn.onclick = () => { formContainer.style.display = 'none'; };
}

function setupCustomTaskUI() {
    const addBtn = document.getElementById('addCustomTaskBtn');
    const formContainer = document.getElementById('customTaskFormContainer');
    const textInput = document.getElementById('customTaskText');
    const saveBtn = document.getElementById('saveCustomTaskBtn');
    const cancelBtn = document.getElementById('cancelCustomTaskBtn');
    const key = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
    if (!addBtn || !formContainer || !textInput || !saveBtn || !cancelBtn) return;
    addBtn.onclick = () => { formContainer.style.display = ''; };
    saveBtn.onclick = () => {
        const text = textInput.value.trim();
        if (!text) return;
        const prev = appState.customTasks && appState.customTasks[key] ? appState.customTasks[key] : [];
        updateAppState({ customTasks: { ...appState.customTasks, [key]: [...prev, { text, done: false }] } });
        textInput.value = '';
        formContainer.style.display = 'none';
        renderCurrentDayTasks();
    };
    cancelBtn.onclick = () => { formContainer.style.display = 'none'; };
}

// Load last selected tier for dashboard form when module loads (if saved in localStorage)
// Or initialize from appState if we decide to store it there.
// For now, using a simple module-scoped variable.
// If you saved 'lastDashboardTier' to localStorage:
// lastSelectedDashboardTier = localStorage.getItem('lastDashboardTier') || '';