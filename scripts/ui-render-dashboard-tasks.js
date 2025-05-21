// scripts/ui-render-dashboard-tasks.js
// Task, warmup, and daily notes logic split from ui-render-dashboard.js
import { appState, updateAppState } from './app-state.js';
import { programData } from './program-data.js';
import { updateNavigationButtons } from './main-navigation.js';
import { createRankChartConfig } from './ui-render-progress.js';
// Chart rendering is managed by ui-render-dashboard-main.js

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
    if(localWeekFocusEl) {
        let focusText = `Focus: ${weekData.focus}`;
        localWeekFocusEl.innerHTML = focusText;
    }
    if(localDayTitleEl) localDayTitleEl.textContent = dayData.title;
    localTaskListEl.innerHTML = ''; 
    // Render custom warm-ups for today (only those selected for today)
    const key = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
    if (Array.isArray(appState.customWarmups) && appState.customWarmups.length > 0) {
        appState.customWarmups.forEach((w) => {
            if (w.days && w.days.includes(key)) {
                const li = document.createElement('li');
                li.classList.add('custom-warmup-task');
                li.innerHTML = `<span><strong>Warm-up:</strong> ${w.name}${w.description ? `: ${w.description}` : ''}</span>`;
                localTaskListEl.appendChild(li);
            }
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
            const taskDetailsDiv = document.createElement('div');
            taskDetailsDiv.classList.add('task-details');
            if (checkbox.checked) {
                taskDetailsDiv.classList.add('completed');
                li.classList.add('task-completed');
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
            li.addEventListener('click', (event) => {
                if (event.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
                window.toggleTaskCompletion(task.id);
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
    if (!dayData.tasks?.length && !(Array.isArray(appState.customWarmups) && appState.customWarmups.some(w => w.days && w.days.includes(key)))) {
        localTaskListEl.innerHTML = '<li>No tasks for today.</li>';
    }
    updateNavigationButtons(); 
}

export function setupCustomWarmupUI() {
    const listEl = document.getElementById('customWarmupList');
    const addBtn = document.getElementById('addCustomWarmupBtn');
    const modal = document.getElementById('customWarmupModal');
    const nameInput = document.getElementById('customWarmupName');
    const descInput = document.getElementById('customWarmupDesc');
    const saveBtn = document.getElementById('saveCustomWarmupBtn');
    const cancelBtn = document.getElementById('cancelCustomWarmupBtn');
    if (!listEl || !addBtn || !modal || !nameInput || !descInput || !saveBtn || !cancelBtn) {
        console.error("Custom warmup UI elements not all found");
        return;
    }

    function renderList() {
        listEl.innerHTML = '';
        (appState.customWarmups || []).forEach((w, idx) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.gap = '8px';
            
            // Title and description
            const textSpan = document.createElement('span');
            textSpan.textContent = w.name + (w.description ? `: ${w.description}` : '');
            textSpan.style.flexGrow = '1';
            li.appendChild(textSpan);
            
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => {
                nameInput.value = w.name;
                descInput.value = w.description || '';
                modal.style.display = 'flex';
                saveBtn.onclick = () => {
                    const name = nameInput.value.trim();
                    const description = descInput.value.trim();
                    if (!name) return;
                    const updated = [...appState.customWarmups];
                    updated[idx] = { ...updated[idx], name, description };
                    updateAppState({ customWarmups: updated });
                    nameInput.value = '';
                    descInput.value = '';
                    modal.style.display = 'none';
                    renderList();
                    renderCurrentDayTasks();
                };
            };
            li.appendChild(editBtn);

            // Reorder buttons
            if (idx > 0) {
                const upBtn = document.createElement('button');
                upBtn.textContent = '↑';
                upBtn.onclick = () => {
                    const updated = [...appState.customWarmups];
                    [updated[idx-1], updated[idx]] = [updated[idx], updated[idx-1]];
                    updateAppState({ customWarmups: updated });
                    renderList();
                    renderCurrentDayTasks();
                };
                li.appendChild(upBtn);
            }
            if (idx < appState.customWarmups.length - 1) {
                const downBtn = document.createElement('button');
                downBtn.textContent = '↓';
                downBtn.onclick = () => {
                    const updated = [...appState.customWarmups];
                    [updated[idx], updated[idx+1]] = [updated[idx+1], updated[idx]];
                    updateAppState({ customWarmups: updated });
                    renderList();
                    renderCurrentDayTasks();
                };
                li.appendChild(downBtn);
            }

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.onclick = () => {
                const updated = [...appState.customWarmups];
                updated.splice(idx, 1);
                updateAppState({ customWarmups: updated });
                renderList();
                renderCurrentDayTasks();
            };
            li.appendChild(delBtn);

            // Style based on persistence
            if (w.persistAcrossDays) {
                li.style.borderLeft = '3px solid var(--current-accent-color)';
                li.style.paddingLeft = '8px';
                li.title = 'Active in daily routine';
            } else {
                li.style.opacity = '0.7';
                li.title = 'Not in daily routine - click to activate';
            }

            // Make the whole li clickable to toggle persistence
            li.style.cursor = 'pointer';
            li.onclick = (e) => {
                // Don't toggle if clicking a button
                if (e.target.tagName === 'BUTTON') return;
                
                const updated = [...appState.customWarmups];                const warmup = { ...updated[idx] };
                warmup.persistAcrossDays = !warmup.persistAcrossDays;
                
                const key = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
                if (warmup.persistAcrossDays) {
                    // If becoming persistent, add to current day if not already included
                    if (!warmup.days?.includes(key)) {
                        warmup.days = [...(warmup.days || []), key];
                    }
                } else {
                    // If becoming non-persistent, remove from current day
                    warmup.days = warmup.days?.filter(d => d !== key) || [];
                }
                
                updated[idx] = warmup;
                updateAppState({ customWarmups: updated });
                renderList();
                renderCurrentDayTasks();
            };

            listEl.appendChild(li);
        });
    }

    renderList();
    
    addBtn.onclick = () => {
        modal.style.display = 'flex';
        nameInput.value = '';
        descInput.value = '';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        nameInput.value = '';
        descInput.value = '';
    };

    saveBtn.onclick = () => {
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        if (!name) return;

        const key = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
        updateAppState({
            customWarmups: [...(appState.customWarmups || []),
                { name, description, days: [key], persistAcrossDays: true }
            ]
        });
        closeModal();
        renderList();
        renderCurrentDayTasks();
    };
    
    cancelBtn.onclick = closeModal;
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

export function updateWarmupDays() {
    if (!Array.isArray(appState.customWarmups)) return;
    
    const key = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
    const updated = appState.customWarmups.map(warmup => {
        if (warmup.persistAcrossDays) {
            // If the warmup should persist and isn't already in the current day, add it
            if (!warmup.days?.includes(key)) {
                return { 
                    ...warmup, 
                    days: [...(warmup.days || []), key] 
                };
            }
        }
        return warmup;
    });
    
    if (JSON.stringify(updated) !== JSON.stringify(appState.customWarmups)) {
        updateAppState({ customWarmups: updated });
    }
}

export function setupDailyNotesArea() {
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

let dailyNoteSaveTimeout = null;
function saveDailyNoteWithDebounce(noteKey, text) {
    clearTimeout(dailyNoteSaveTimeout);
    dailyNoteSaveTimeout = setTimeout(() => {
        updateAppState({ dailyNotes: { ...appState.dailyNotes, [noteKey]: text } });
    }, 750); 
}

export function prepareRankChartData() {
    const currentCycleRankData = [...appState.rankHistory]
        .filter(r => r.cycle === appState.currentCycle)
        .sort((a,b) => new Date(a.dateLogged) - new Date(b.dateLogged));

    return {
        data: currentCycleRankData,
        config: createRankChartConfig(currentCycleRankData, "Current Cycle Rank Progression")
    };
}
