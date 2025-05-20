// ui-render-program.js
import { appState, updateAppState } from './app-state.js';
import { programData } from './program-data.js';
import { renderPage } from './main-navigation.js'; // To switch to dashboard when a day is clicked

// DOM elements for the Week Details Modal (will be queried when this page/modal is active)
let programWeekDetailsModal = null;
let weekDetailsModalTitleEl = null;
let weekDetailsModalBodyEl = null;
let closeWeekDetailsModalBtn = null;
let okWeekDetailsModalBtn = null;

export function renderProgramOverviewPage(mainContentEl) {
    let programHtml = `<section class="program-overview-page"><h2>Program Overview (Cycle #${appState.currentCycle})</h2>`;
    programHtml += `<div class="weeks-container">`;

    for (const weekNum in programData) {
        if (programData.hasOwnProperty(weekNum)) {
            const week = programData[weekNum];
            let completedTasksInWeek = 0;
            let totalTasksInWeek = 0;

            for (const dayNum in week.days) {
                if (week.days.hasOwnProperty(dayNum)) {
                    const day = week.days[dayNum];
                    if (day.tasks) {
                        totalTasksInWeek += day.tasks.length;
                        day.tasks.forEach(task => {
                            const taskKey = `c${appState.currentCycle}-${task.id}`;
                            if (appState.taskCompletions[taskKey]) {
                                completedTasksInWeek++;
                            }
                        });
                    }
                }
            }
            const progressPercent = totalTasksInWeek > 0 ? Math.round((completedTasksInWeek / totalTasksInWeek) * 100) : 0;

            programHtml += `
                <div class="week-card">
                    <div class="week-card-header">
                        <h3>Week ${weekNum}: ${week.title}</h3>
                        <span class="week-progress">${progressPercent}%</span>
                    </div>
                    <p class="week-card-focus">Focus: ${week.focus}</p>
                    <button class="view-week-details-btn" data-week="${weekNum}">View Daily Tasks</button>
                </div>`;
        }
    }
    programHtml += `</div></section>`;
    mainContentEl.innerHTML = programHtml;

    // Add event listeners for "View Daily Tasks" buttons
    mainContentEl.querySelectorAll('.view-week-details-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const weekNum = e.target.dataset.week;
            showProgramWeekDetailsModal(weekNum);
        });
    });
}

export function showProgramWeekDetailsModal(weekNum) {
    // Query modal elements here, as they are part of index.html but only relevant now
    programWeekDetailsModal = document.getElementById('programWeekDetailsModal');
    weekDetailsModalTitleEl = document.getElementById('weekDetailsModalTitle');
    weekDetailsModalBodyEl = document.getElementById('weekDetailsModalBody');
    // closeWeekDetailsModalBtn and okWeekDetailsModalBtn are assigned listeners in main script.js

    const week = programData[weekNum];
    if (!week || !weekDetailsModalTitleEl || !weekDetailsModalBodyEl || !programWeekDetailsModal) {
        console.error("Modal elements or week data not found for week details.");
        return;
    }

    weekDetailsModalTitleEl.textContent = `Week ${weekNum}: ${week.title}`;
    let dailyHtml = "<h4>Daily Breakdown:</h4><ul>";
    for (const dayNum in week.days) {
        if (week.days.hasOwnProperty(dayNum)) {
            const day = week.days[dayNum];
            dailyHtml += `<li><strong>${day.title}:</strong> (Cycle ${appState.currentCycle}) 
                            <a href="#" class="jump-to-day-link-modal" data-week="${weekNum}" data-day="${dayNum}" style="font-size:0.8em; margin-left: 5px;">(Go to this day)</a>
                         `;
            if (day.tasks && day.tasks.length > 0) {
                day.tasks.forEach(task => {
                    const taskKey = `c${appState.currentCycle}-${task.id}`;
                    const isCompleted = appState.taskCompletions[taskKey] ? '✔️' : '🔲';
                    dailyHtml += `<span class="task-text">${isCompleted} ${task.text}</span>`;
                });
            } else {
                dailyHtml += `<span class="task-text">- No specific tasks listed.</span>`;
            }
            dailyHtml += `</li>`;
        }
    }
    dailyHtml += "</ul>";
    weekDetailsModalBodyEl.innerHTML = dailyHtml;

    // Add event listeners for "Go to this day" links within the modal
    weekDetailsModalBodyEl.querySelectorAll('.jump-to-day-link-modal').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            closeProgramWeekDetailsModal(); // Close this modal first
            updateAppState({
                currentWeek: parseInt(e.target.dataset.week),
                currentDay: parseInt(e.target.dataset.day),
                currentPage: 'dashboard'
            });
            renderPage(); // main-navigation's renderPage will handle showing the dashboard
        });
    });

    programWeekDetailsModal.style.display = 'flex'; 
}

export function closeProgramWeekDetailsModal() {
    if (programWeekDetailsModal) { // Ensure it's been queried
        programWeekDetailsModal.style.display = 'none';
    }
}

// This function is called from main script.js to initialize modal controls
export function initProgramModals(closeBtnElement, okBtnElement, modalElement) {
    closeWeekDetailsModalBtn = closeBtnElement;
    okWeekDetailsModalBtn = okBtnElement;
    // programWeekDetailsModal = modalElement; // Already queried in showProgramWeekDetailsModal

    if(closeWeekDetailsModalBtn) closeWeekDetailsModalBtn.addEventListener('click', closeProgramWeekDetailsModal);
    if(okWeekDetailsModalBtn) okWeekDetailsModalBtn.addEventListener('click', closeProgramWeekDetailsModal);
    if(modalElement) { // modalElement is programWeekDetailsModal itself
        modalElement.addEventListener('click', (event) => { 
            if (event.target === modalElement) closeProgramWeekDetailsModal(); 
        });
    }
}