// scripts/ui-render-program.js
import { appState, updateAppState } from './app-state.js';
import { getProgramData } from './program-data.js';
import { getTaskCompletionStats } from './task-utils.js';
import { renderPage as RENDER_PAGE_FROM_MAIN_NAV } from './main-navigation.js';

// DOM element references for this modal, initialized by initProgramModals
let programWeekDetailsModalEl = null; // Changed name
let weekDetailsModalTitleEl = null;
let weekDetailsModalBodyEl = null;
// Close and OK buttons are handled via event listeners set up in initProgramModals

export function renderProgramOverviewPage(mainContentEl) {
    // Get selected roles to apply role theming
    const selectedRoles = appState.selectedRoles || [];
    const roleClass = selectedRoles.length === 1 ? `role-${selectedRoles[0].toLowerCase()}` : 
                     selectedRoles.length > 1 ? 'role-multi' : '';
    
    let programHtml = `
        <section class="program-overview-page ${roleClass}">
            <div class="program-header-container">
                <h2>Program Overview (Cycle #${appState.currentCycle})</h2>
                <div class="overall-program-progress">
                    <div id="overallProgramProgressContainer"></div>
                </div>
            </div>
            <div class="weeks-container">
    `;

    const programData = getProgramData();
    for (const weekNum in programData) {
        if (programData.hasOwnProperty(weekNum)) {
            const week = programData[weekNum];
            const { total, completed, percent } = getTaskCompletionStats({ weekNum });
            
            // Card styling depends on selected roles
            const cardRoleClass = roleClass || 'role-themed-card';
            
            programHtml += `
                <div class="week-card ${cardRoleClass}" data-week="${weekNum}">
                    <div class="week-card-header">
                        <h3 class="week-card-title">Week ${weekNum}: ${week.title}</h3>
                        <div class="progress-indicator">
                            <span class="week-progress">${percent}%</span>
                            <div class="week-progress-bar-container">
                                <div class="week-progress-bar" style="width: ${percent}%"></div>
                            </div>
                        </div>
                    </div>
                    <p class="week-card-focus">
                        <span class="focus-label">Focus:</span> ${week.focus}
                    </p>
                    <button class="form-button form-button--secondary view-week-btn">
                        View Week Details
                    </button>
                </div>`;
        }
    }
    programHtml += `</div></section>`;
    
    // Render the overview page
    mainContentEl.innerHTML = programHtml;
    
    // Update overall progress
    renderOverallProgramProgress();
    
    // Add click handlers for the week cards
    const weekCards = mainContentEl.querySelectorAll('.week-card');
    weekCards.forEach(card => {
        const viewBtn = card.querySelector('.view-week-btn');
        
        // Make the button handle the click
        if (viewBtn) {
            viewBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent the card click from triggering
                const weekNum = card.dataset.week;
                showProgramWeekDetailsModal(weekNum);
            });
        }
        
        // Optional: Make the entire card clickable
        card.addEventListener('click', () => {
            const weekNum = card.dataset.week;
            showProgramWeekDetailsModal(weekNum);
        });
    });
}

export function showProgramWeekDetailsModal(weekNum) {
    // Query title and body here as they are part of the modal's structure in index.html
    if (!programWeekDetailsModalEl) {
        console.error("Program Week Details Modal main element not initialized.");
        return;
    }
    
    weekDetailsModalTitleEl = document.getElementById('weekDetailsModalTitle');
    weekDetailsModalBodyEl = document.getElementById('weekDetailsModalBody');

    const programData = getProgramData();
    const week = programData[weekNum];
    if (!week || !weekDetailsModalTitleEl || !weekDetailsModalBodyEl) {
        console.error("Modal inner elements or week data not found for week details modal.");
        return;
    }

    // Get selected roles for styling
    const selectedRoles = appState.selectedRoles || [];
    const roleClass = selectedRoles.length === 1 ? `role-${selectedRoles[0].toLowerCase()}` : 
                     selectedRoles.length > 1 ? 'role-multi' : '';
    
    // Set modal title
    weekDetailsModalTitleEl.textContent = `Week ${weekNum}: ${week.title}`;
    
    // Gather week statistics
    const { total, completed, percent } = getTaskCompletionStats({ weekNum });
    
    // Generate modal content
    let dailyHtml = `
        <div class="week-details-summary ${roleClass}">
            <p class="week-focus">${week.focus}</p>
            <div class="week-completion">
                <span class="completion-text">Week Completion: ${completed}/${total} tasks (${percent}%)</span>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${percent}%;">${percent > 10 ? `${percent}%` : ''}</div>
                </div>
            </div>
        </div>
        <h4 class="daily-breakdown-title">Daily Tasks:</h4>
        <div class="daily-tasks-list">
    `;
    
    // Generate daily task list
    for (const dayNum in week.days) {
        if (week.days.hasOwnProperty(dayNum)) {
            const day = week.days[dayNum];
            
            dailyHtml += `
                <div class="day-container ${roleClass}">
                    <div class="day-header">
                        <h5 class="day-title">${day.title}</h5>
                        <button class="form-button form-button--secondary go-to-day-btn" 
                            data-week="${weekNum}" data-day="${dayNum}">
                            Go to Day
                        </button>
                    </div>
            `;
            
            // Task list for this day
            if (day.tasks && day.tasks.length > 0) {
                dailyHtml += `<ul class="task-list-modal">`;
                
                day.tasks.forEach(task => {
                    const taskKey = `c${appState.currentCycle}-${task.id}`;
                    const isCompleted = appState.taskCompletions[taskKey] || false;
                    // Display a modern checkmark box for completion
                    dailyHtml += `
                        <li class="task-item-modal${isCompleted ? ' task-completed' : ''}">
                            <span class="task-status-indicator${isCompleted ? ' completed' : ''}">
                                <span class="checkmark">${isCompleted ? '✓' : ''}</span>
                            </span>
                            <span class="task-text">${task.text}</span>
                        </li>`;
                });
                
                dailyHtml += `</ul>`;
            } else {
                dailyHtml += `<p class="no-tasks-message">No specific tasks for this day.</p>`;
            }
            
            dailyHtml += `</div>`;
        }
    }
    
    dailyHtml += `</div>`;
    weekDetailsModalBodyEl.innerHTML = dailyHtml;

    // Set event listeners for "Go to Day" buttons
    weekDetailsModalBodyEl.querySelectorAll('.go-to-day-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeProgramWeekDetailsModal(); 
            updateAppState({
                currentWeek: parseInt(e.target.dataset.week),
                currentDay: parseInt(e.target.dataset.day),
                currentPage: 'dashboard'
            });
            RENDER_PAGE_FROM_MAIN_NAV();
        });
    });

    programWeekDetailsModalEl.style.display = 'flex'; // MODIFIED to use flex
}

export function closeProgramWeekDetailsModal() {
    if (programWeekDetailsModalEl) { // Use the stored reference
        programWeekDetailsModalEl.style.display = 'none';
    }
}

export function initProgramModals(closeBtnElement, okBtnElement, modalElementItself) {
    programWeekDetailsModalEl = modalElementItself; // Store the reference to the modal div

    if(closeBtnElement) closeBtnElement.addEventListener('click', closeProgramWeekDetailsModal);
    if(okBtnElement) okBtnElement.addEventListener('click', closeProgramWeekDetailsModal);
    if(programWeekDetailsModalEl) { 
        programWeekDetailsModalEl.addEventListener('click', (event) => { 
            if (event.target === programWeekDetailsModalEl) closeProgramWeekDetailsModal(); 
        });
    } else {
        console.error("Program Week Details Modal element not provided to initProgramModals.");
    }
}

export function renderOverallProgramProgress() {
    const progressContainer = document.getElementById('overallProgramProgressContainer');
    if (!progressContainer) return;
    
    const { total, completed, percent } = getTaskCompletionStats({ all: true });
    
    // Get selected roles to style progress bar
    const selectedRoles = appState.selectedRoles || [];
    const roleClass = selectedRoles.length === 1 ? `role-${selectedRoles[0].toLowerCase()}` : 
                     selectedRoles.length > 1 ? 'role-multi' : '';
    
    progressContainer.innerHTML = `
        <p class="progress-summary">Overall Completion: <strong>${completed}</strong> of <strong>${total}</strong> tasks completed</p>
        <div class="progress-bar-container ${roleClass}">
            <div class="progress-bar-fill" style="width: ${percent}%;">
                ${percent > 10 ? `${percent}%` : ''}
            </div>
        </div>
    `;
}