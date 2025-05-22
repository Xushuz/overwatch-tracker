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

    if (!localWeekTitleEl || !localTaskListEl) {
        console.error("Required dashboard elements for task rendering are missing.");
        return; 
    }

    const currentWeekData = programData[appState.currentWeek];
    if (!currentWeekData) {
        localWeekTitleEl.textContent = "Error"; 
        if (localWeekFocusEl) { localWeekFocusEl.textContent = ""; }
        if (localDayTitleEl) { localDayTitleEl.textContent = ""; }
        localTaskListEl.innerHTML = `<li>Week data missing for Week ${appState.currentWeek}.</li>`;
        updateNavigationButtons(); 
        return;
    }

    const currentDayData = currentWeekData.days[appState.currentDay];
    if (!currentDayData) {
        localWeekTitleEl.textContent = `W${appState.currentWeek}: ${currentWeekData.title}`;
        if (localWeekFocusEl) { localWeekFocusEl.textContent = `Focus: ${currentWeekData.focus}`; }
        if (localDayTitleEl) { localDayTitleEl.textContent = "Error: Day data missing"; }
        localTaskListEl.innerHTML = `<li>Day data missing for W${appState.currentWeek}D${appState.currentDay}.</li>`;
        updateNavigationButtons(); 
        return;
    }

    localWeekTitleEl.textContent = `Week ${appState.currentWeek}: ${currentWeekData.title}`;
    if (localWeekFocusEl) {
        localWeekFocusEl.innerHTML = `Focus: ${currentWeekData.focus}`; // innerHTML for potential HTML entities or simple formatting
    }
    if (localDayTitleEl) { 
        localDayTitleEl.textContent = currentDayData.title; 
    }
    
    localTaskListEl.innerHTML = ''; // Clear existing tasks before re-rendering

    // Setup event delegation for task completion clicks on the task list
    // This listener is added once and handles clicks on all child task items.
    // It's safe to call addEventListener multiple times if the function reference is the same,
    // but clearing innerHTML effectively removes old listeners on children anyway.
    // However, to be absolutely sure and prevent potential memory leaks if this function
    // was ever called without clearing innerHTML first, a removeEventListener could be used.
    // For now, assuming innerHTML clearing is sufficient.
    localTaskListEl.addEventListener('click', handleTaskClick);

    // Render custom warm-ups for today
    const currentDayWarmupKey = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
    let tasksRendered = false;
    if (Array.isArray(appState.customWarmups) && appState.customWarmups.length > 0) {
        appState.customWarmups.forEach((warmup) => {
            if (warmup.days && warmup.days.includes(currentDayWarmupKey)) {
                const li = document.createElement('li');
                li.classList.add('custom-warmup-task'); // General class for styling warmups in task list
                // Using textContent for security, though this specific string is controlled.
                // Using template literal for easier construction.
                li.innerHTML = `<span><strong>Warm-up:</strong> ${warmup.name}${warmup.description ? `: ${warmup.description}` : ''}</span>`;
                localTaskListEl.appendChild(li);
                tasksRendered = true;
            }
        });
    }

    // Render program tasks for the current day
    if (currentDayData.tasks && currentDayData.tasks.length > 0) {
        currentDayData.tasks.forEach(task => {
            const taskListItem = createTaskListItemElement(task);
            localTaskListEl.appendChild(taskListItem);
            tasksRendered = true;
        });
    }

    // If no tasks or warmups were rendered, display "No tasks for today."
    if (!tasksRendered) {
        localTaskListEl.innerHTML = '<li>No tasks for today.</li>';
    }

    updateNavigationButtons(); 
}

/**
 * Creates a list item element for a given task.
 * @param {object} task - The task object from programData.
 * @returns {HTMLLIElement} The created list item element.
 */
function createTaskListItemElement(task) {
    const li = document.createElement('li');
    li.dataset.taskId = task.id; // Used for event delegation to identify the task
    
    const taskKey = `c${appState.currentCycle}-${task.id}`;
    const isCompleted = appState.taskCompletions[taskKey] || false;

    // Apply 'task-completed' class to the LI if the task is completed for visual styling
    if (isCompleted) {
        li.classList.add('task-completed');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = taskKey; // ID for label association (if any) and direct manipulation
    checkbox.checked = isCompleted;
    // Note: The actual change event is handled by the delegated listener on localTaskListEl.

    const taskDetailsDiv = document.createElement('div');
    taskDetailsDiv.classList.add('task-details');
    if (isCompleted) {
        taskDetailsDiv.classList.add('completed'); // Class for styling the text (e.g., line-through)
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
    return li;
}

/**
 * Handles clicks on the task list for toggling task completion.
 * Uses event delegation.
 * @param {Event} event - The click event.
 */
function handleTaskClick(event) {
    const target = event.target;
    // Find the closest 'li' with a 'data-task-id' attribute
    const taskLi = target.closest('li[data-task-id]');

    if (!taskLi) {
        return; // Click was not on a task item or its children
    }

    const taskId = taskLi.dataset.taskId;
    const checkbox = taskLi.querySelector('input[type="checkbox"]');

    if (!checkbox) {
        console.error(`Checkbox not found for task ID: ${taskId}`);
        return;
    }

    // If the click was on the <li> itself or other elements within, not the checkbox,
    // then manually toggle the checkbox's checked state to reflect the intended action.
    if (target !== checkbox) {
        checkbox.checked = !checkbox.checked;
    }

    // Call the global toggleTaskCompletion function (defined in script.js)
    // This function will update appState and the 'completed' class on the taskDetailsDiv.
    window.toggleTaskCompletion(taskId); 

    // Update the LI's 'task-completed' class directly for immediate visual feedback.
    // The class on taskDetailsDiv is handled by toggleTaskCompletion in script.js.
    taskLi.classList.toggle('task-completed', checkbox.checked);
}


export function setupCustomWarmupUI() {
    // DOM element selections for the custom warmup UI
    const listEl = document.getElementById('customWarmupList');
    const addBtn = document.getElementById('addCustomWarmupBtn');
    const modal = document.getElementById('customWarmupModal');
    const warmupNameInputEl = document.getElementById('customWarmupName');
    const warmupDescInputEl = document.getElementById('customWarmupDesc');
    const saveWarmupBtnEl = document.getElementById('saveCustomWarmupBtn');
    const cancelWarmupBtnEl = document.getElementById('cancelCustomWarmupBtn');
    
    if (!listEl || !addBtn || !modal || !warmupNameInputEl || !warmupDescInputEl || !saveWarmupBtnEl || !cancelWarmupBtnEl) {
        console.error("Custom warmup UI elements not all found. Aborting setup.");
        return;
    }

    let editingWarmupIndex = null; // null for adding, index for editing

    /**
     * Renders the list of custom warmups.
     */
    function renderCustomWarmupList() {
        listEl.innerHTML = ''; // Clear existing list items
        (appState.customWarmups || []).forEach((warmup, index) => {
            const li = document.createElement('li');
            li.classList.add('custom-warmup-item');
            li.dataset.index = index;
            // The primary action for clicking the LI itself is to toggle persistence
            li.dataset.action = 'toggle-persist'; 

            if (warmup.persistAcrossDays) {
                li.classList.add('persistent');
                li.title = 'Active in daily routine. Click to deactivate for today.';
            } else {
                li.classList.add('not-persistent');
                li.title = 'Not in daily routine. Click to activate for today.';
            }

            const textSpan = document.createElement('span');
            textSpan.classList.add('custom-warmup-item-text');
            textSpan.textContent = warmup.name + (warmup.description ? `: ${warmup.description}` : '');
            li.appendChild(textSpan);

            // Container for action buttons
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('actions');

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.dataset.action = 'edit-warmup';
            editBtn.dataset.index = index;
            actionsDiv.appendChild(editBtn);

            // Reorder buttons (Up and Down)
            if (index > 0) {
                const upBtn = document.createElement('button');
                upBtn.textContent = '↑';
                upBtn.title = "Move up";
                upBtn.dataset.action = 'move-warmup-up';
                upBtn.dataset.index = index;
                actionsDiv.appendChild(upBtn);
            }
            if (index < appState.customWarmups.length - 1) {
                const downBtn = document.createElement('button');
                downBtn.textContent = '↓';
                downBtn.title = "Move down";
                downBtn.dataset.action = 'move-warmup-down';
                downBtn.dataset.index = index;
                actionsDiv.appendChild(downBtn);
            }

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.title = "Delete";
            delBtn.dataset.action = 'delete-warmup';
            delBtn.dataset.index = index;
            actionsDiv.appendChild(delBtn);
            
            li.appendChild(actionsDiv);
            listEl.appendChild(li);
        });
    }

    // Event Delegation for actions on custom warmup list items
    listEl.addEventListener('click', (event) => {
        const targetElement = event.target.closest('[data-action]');
        if (!targetElement) {
            return; // Click was not on an actionable element
        }

        const action = targetElement.dataset.action;
        // Ensure index is parsed as an integer
        const index = parseInt(targetElement.dataset.index, 10); 
        
        // It's good practice to ensure index is a valid number before proceeding,
        // especially if it might come from unexpected sources or malformed HTML.
        if (isNaN(index) && action !== 'add-warmup') { // add-warmup doesn't need an index from the element
            console.error("Invalid index for warmup action:", targetElement.dataset.index);
            return;
        }
        
        let currentWarmups = [...appState.customWarmups];

        switch (action) {
            case 'edit-warmup':
                editingWarmupIndex = index;
                const warmupToEdit = currentWarmups[index];
                warmupNameInputEl.value = warmupToEdit.name;
                warmupDescInputEl.value = warmupToEdit.description || '';
                modal.style.display = 'flex';
                warmupNameInputEl.focus();
                break;

            case 'delete-warmup':
                if (confirm(`Are you sure you want to delete "${currentWarmups[index].name}"?`)) {
                    currentWarmups.splice(index, 1);
                    updateAppState({ customWarmups: currentWarmups });
                    renderCustomWarmupList();
                    renderCurrentDayTasks(); // Warmups might affect today's task list display
                }
                break;

            case 'move-warmup-up':
                if (index > 0) {
                    [currentWarmups[index - 1], currentWarmups[index]] = [currentWarmups[index], currentWarmups[index - 1]];
                    updateAppState({ customWarmups: currentWarmups });
                    renderCustomWarmupList();
                    // No need to renderCurrentDayTasks if order in settings doesn't affect today's display
                }
                break;

            case 'move-warmup-down':
                if (index < currentWarmups.length - 1) {
                    [currentWarmups[index], currentWarmups[index + 1]] = [currentWarmups[index + 1], currentWarmups[index]];
                    updateAppState({ customWarmups: currentWarmups });
                    renderCustomWarmupList();
                     // No need to renderCurrentDayTasks if order in settings doesn't affect today's display
                }
                break;

            case 'toggle-persist':
                const warmupToToggle = { ...currentWarmups[index] };
                warmupToToggle.persistAcrossDays = !warmupToToggle.persistAcrossDays;
                const currentDayKey = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
                
                if (warmupToToggle.persistAcrossDays) {
                    // If becoming persistent, add to current day if not already included
                    if (!warmupToToggle.days?.includes(currentDayKey)) {
                        warmupToToggle.days = [...(warmupToToggle.days || []), currentDayKey];
                    }
                } else {
                    // If becoming non-persistent, remove from current day's active list
                    warmupToToggle.days = warmupToToggle.days?.filter(d => d !== currentDayKey) || [];
                }
                currentWarmups[index] = warmupToToggle;
                updateAppState({ customWarmups: currentWarmups });
                renderCustomWarmupList();
                renderCurrentDayTasks(); // Persistence directly affects today's task list display
                break;
            
            default:
                console.warn("Unknown action:", action);
        }
    });

    renderCustomWarmupList(); // Initial render of the warmup list

    // Show modal for adding a new warmup
    addBtn.onclick = () => {
        editingWarmupIndex = null; // Clear any previous editing state
        warmupNameInputEl.value = '';
        warmupDescInputEl.value = '';
        modal.style.display = 'flex';
        warmupNameInputEl.focus();
    };

    // Close the modal
    const closeModal = () => {
        modal.style.display = 'none';
        warmupNameInputEl.value = ''; // Clear inputs
        warmupDescInputEl.value = '';
        editingWarmupIndex = null; // Reset editing state
    };

    // Save new or edited warmup
    saveWarmupBtnEl.onclick = () => {
        const name = warmupNameInputEl.value.trim();
        const description = warmupDescInputEl.value.trim();

        if (!name) {
            alert("Warmup name cannot be empty.");
            return;
        }

        let currentWarmups = [...(appState.customWarmups || [])];
        // Key for associating warmup with the current day if it's a new, persistent one
        const currentDayKey = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;

        if (editingWarmupIndex !== null && editingWarmupIndex >= 0 && editingWarmupIndex < currentWarmups.length) {
            // Update existing warmup
            const warmupToUpdate = { ...currentWarmups[editingWarmupIndex] };
            warmupToUpdate.name = name;
            warmupToUpdate.description = description;
            // Note: Persistence and specific day assignments are handled by 'toggle-persist' action.
            // Editing here primarily changes name/description.
            currentWarmups[editingWarmupIndex] = warmupToUpdate;
        } else {
            // Add new warmup, by default it's persistent and added to the current day
            currentWarmups.push({ 
                name, 
                description, 
                days: [currentDayKey], // Active for today
                persistAcrossDays: true // Persistent by default
            });
        }
        
        updateAppState({ customWarmups: currentWarmups });
        closeModal();
        renderCustomWarmupList();
        renderCurrentDayTasks(); // New/edited warmups might affect today's display
    };
    
    cancelWarmupBtnEl.onclick = closeModal;
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
