// scripts/ui-render-program.js
import { appState, updateAppState } from './app-state.js';
import { programData } from './program-data.js';
import { getTaskCompletionStats } from './task-utils.js';
import { renderPage as RENDER_PAGE_FROM_MAIN_NAV } from './main-navigation.js';

// DOM element references for this modal, initialized by initProgramModals
let programWeekDetailsModalEl = null; // Changed name
let weekDetailsModalTitleEl = null;
let weekDetailsModalBodyEl = null;
// Close and OK buttons are handled via event listeners set up in initProgramModals

export function renderProgramOverviewPage(mainContentEl) {
    let programHtml = `<section class="program-overview-page"><h2>Program Overview (Cycle #${appState.currentCycle})</h2>`;
    programHtml += `<div class="weeks-container">`;

    for (const weekNum in programData) {
        if (programData.hasOwnProperty(weekNum)) {
            const week = programData[weekNum];
            const { total, completed, percent } = getTaskCompletionStats({ weekNum });
            programHtml += `
                <button class="week-card" data-week="${weekNum}">
                    <div class="week-card-header">
                        <h3 class="week-card-title">Week ${weekNum}: ${week.title}</h3>
                        <span class="week-progress">${percent}%</span>
                    </div>
                    <p class="week-card-focus">Focus: ${week.focus}</p>
                    <div class="week-card-action">View Daily Tasks</div>
                </button>`;
        }
    }
    programHtml += `</div></section>`;
    mainContentEl.innerHTML = programHtml;
    
    // Add click handlers for the week cards
    const weekCards = mainContentEl.querySelectorAll('.week-card');
    weekCards.forEach(card => {
        card.addEventListener('click', () => {
            const weekNum = card.dataset.week;
            showProgramWeekDetailsModal(weekNum);
        });
    });
}

export function showProgramWeekDetailsModal(weekNum) {
    // Query title and body here as they are part of the modal's structure in index.html
    // The main modal element (programWeekDetailsModalEl) is passed during init.
    if (!programWeekDetailsModalEl) { // Check if the main modal element is initialized
        console.error("Program Week Details Modal main element not initialized.");
        return;
    }
    weekDetailsModalTitleEl = document.getElementById('weekDetailsModalTitle'); // Query specific parts
    weekDetailsModalBodyEl = document.getElementById('weekDetailsModalBody');


    const week = programData[weekNum];
    if (!week || !weekDetailsModalTitleEl || !weekDetailsModalBodyEl) {
        console.error("Modal inner elements or week data not found for week details modal.");
        return;
    }

    weekDetailsModalTitleEl.textContent = `Week ${weekNum}: ${week.title}`;
    let dailyHtml = "<h4>Daily Breakdown:</h4><ul>";
    for (const dayNum in week.days) {
        if (week.days.hasOwnProperty(dayNum)) {
            const day = week.days[dayNum];
            dailyHtml += `<li><strong>${day.title}:</strong> (Cycle ${appState.currentCycle}) 
                            <a href="#" class="jump-to-day-link-modal" data-week="${weekNum}" data-day="${dayNum}">(Go to this day)</a>
                         `;
            if (day.tasks && day.tasks.length > 0) {
                day.tasks.forEach(task => {
                    const taskKey = `c${appState.currentCycle}-${task.id}`;
                    const isCompleted = appState.taskCompletions[taskKey] || false;
                    // Using a more standard checkbox representation that can be targeted by the event delegate
                    dailyHtml += `
                        <div class="task-item-program-modal">
                            <input type="checkbox" class="task-item-checkbox" id="${taskKey}" ${isCompleted ? 'checked' : ''}>
                            <label for="${taskKey}" class="task-text ${isCompleted ? 'completed' : ''}">${task.text}</label>
                        </div>`;
                });
            } else {
                dailyHtml += `<span class="task-text">- No specific tasks listed.</span>`;
            }
            dailyHtml += `</li>`;
        }
    }
    dailyHtml += "</ul>";
    weekDetailsModalBodyEl.innerHTML = dailyHtml;

    weekDetailsModalBodyEl.querySelectorAll('.jump-to-day-link-modal').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            closeProgramWeekDetailsModal(); 
            updateAppState({
                currentWeek: parseInt(e.target.dataset.week),
                currentDay: parseInt(e.target.dataset.day),
                currentPage: 'dashboard'
            });
            RENDER_PAGE_FROM_MAIN_NAV(); // Use the imported and aliased renderPage
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