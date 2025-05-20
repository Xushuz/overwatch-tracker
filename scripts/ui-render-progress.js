// ui-render-progress.js
import { appState, updateAppState } from './app-state.js'; // For accessing and saving rankHistory
import { programData } from './program-data.js'; // For overall progress calculation

export let rankChartInstanceProgress = null; // Export to be managed by theme and page changes

// Constants for rank calculations and display
export const rankToValue = (tier, division) => {
    const tierValues = { "Bronze": 0, "Silver": 5, "Gold": 10, "Platinum": 15, "Diamond": 20, "Master": 25, "Grandmaster": 30, "Champion": 35 };
    // Ensure division is treated as a number, default to 5 if invalid (though should be validated before)
    const numericDivision = parseInt(division);
    if (isNaN(numericDivision) || numericDivision < 1 || numericDivision > 5) {
        return tierValues[tier] || 0; // Return base tier value if division is invalid
    }
    return (tierValues[tier] || 0) + (5 - numericDivision); 
};

export const rankTiersAndDivisions = [
    "Bronze 5", "Bronze 4", "Bronze 3", "Bronze 2", "Bronze 1",
    "Silver 5", "Silver 4", "Silver 3", "Silver 2", "Silver 1",
    "Gold 5", "Gold 4", "Gold 3", "Gold 2", "Gold 1",
    "Platinum 5", "Platinum 4", "Platinum 3", "Platinum 2", "Platinum 1",
    "Diamond 5", "Diamond 4", "Diamond 3", "Diamond 2", "Diamond 1",
    "Master 5", "Master 4", "Master 3", "Master 2", "Master 1",
    "Grandmaster 5", "Grandmaster 4", "Grandmaster 3", "Grandmaster 2", "Grandmaster 1",
    "Champion 5", "Champion 4", "Champion 3", "Champion 2", "Champion 1"
];


export function renderRankHistoryPage(mainContentEl) { 
    let historyHtml = `<section class="progress-page"><h2>Rank Update History</h2>`;
    
    // Section for Overall Program Progress
    historyHtml += `
        <div class="content-card">
            <h3>Overall Program Completion (Current Cycle #${appState.currentCycle})</h3>
            <div id="overallProgramProgressContainer"></div>
        </div>
    `;
    
    // Section for All Logged Ranks
    historyHtml += `<div class="content-card rank-history-section">`;
    historyHtml += `<h3>All Logged Ranks (All Cycles)</h3>`;
    historyHtml += `<ul id="fullRankHistoryList" class="rank-history-list">`;

    if (appState.rankHistory.length === 0) {
        historyHtml += `<li>No ranks logged yet.</li>`;
    } else {
        const sortedHistory = [...appState.rankHistory].sort((a,b) => new Date(a.dateLogged) - new Date(b.dateLogged));
        sortedHistory.forEach(rankEntry => {
            let entryLabel = `C${rankEntry.cycle}, `;
            if (rankEntry.type === 'initial') entryLabel += `Initial`;
            else if (rankEntry.type === 'endOfWeek') entryLabel += `End of W${rankEntry.week}`;
            else if (rankEntry.type === 'daily') entryLabel += `Daily Update`;
            // Fallback if week is present but type isn't standard (e.g. old data)
            else if (rankEntry.week) entryLabel += `W${rankEntry.week}`; 
            else entryLabel += `Update`;


            historyHtml += `<li>
                                <span><span class="rank-type">${entryLabel}:</span> ${rankEntry.rankString}</span> 
                                <span class="rank-date">(${rankEntry.dateLogged})</span>
                             </li>`;
        });
    }
    historyHtml += `</ul></div>`;
    
    // Section for Larger Rank Chart (All Time)
    historyHtml += `
        <div class="content-card">
            <h3>Rank Progression Chart (All Time)</h3>
             <div id="progressPageRankChartContainer" style="min-height: 350px; position: relative;">
                <canvas id="progressPageRankChart"></canvas>
            </div>
        </div>`;

    historyHtml += `</section>`;
    mainContentEl.innerHTML = historyHtml;

    renderOverallProgramProgress(); // Call to render the progress bar
    renderProgressPageRankChart(); 
}

export function renderOverallProgramProgress() {
    const progressContainer = document.getElementById('overallProgramProgressContainer');
    if (!progressContainer) return;

    let totalTasksInProgram = 0;
    let completedTasksInProgram = 0;

    for (const weekNum in programData) {
        const week = programData[weekNum];
        for (const dayNum in week.days) {
            const day = week.days[dayNum];
            if (day.tasks) {
                totalTasksInProgram += day.tasks.length;
                day.tasks.forEach(task => {
                    const taskKey = `c${appState.currentCycle}-${task.id}`; 
                    if (appState.taskCompletions[taskKey]) {
                        completedTasksInProgram++;
                    }
                });
            }
        }
    }
    const overallProgressPercent = totalTasksInProgram > 0 ? Math.round((completedTasksInProgram / totalTasksInProgram) * 100) : 0;
    progressContainer.innerHTML = `
        <p>You have completed <strong>${completedTasksInProgram}</strong> out of <strong>${totalTasksInProgram}</strong> tasks for Cycle #${appState.currentCycle}.</p>
        <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${overallProgressPercent}%;">
                ${overallProgressPercent > 10 ? `${overallProgressPercent}%` : ''}
            </div>
        </div>
    `;
}

export function addRankEntry({ week = null, type, tier, division }) {
    const rankString = `${tier} ${division}`;
    const dateLogged = new Date().toISOString().split('T')[0]; 

    // For 'initial' or 'endOfWeek', prevent duplicate entries for the same event in the same cycle
    if (type === 'initial' || type === 'endOfWeek') {
        const alreadyExists = appState.rankHistory.some(
            r => r.cycle === appState.currentCycle && r.week === week && r.type === type
        );
        if (alreadyExists) {
             console.warn(`Rank for ${type} W${week} C${appState.currentCycle} already exists. Not adding duplicate.`);
             return false; 
        }
    }

    const newRankHistory = [
        ...appState.rankHistory,
        { 
            cycle: appState.currentCycle, 
            week: type === 'daily' ? null : week, 
            type, 
            tier, 
            division: parseInt(division), 
            rankString, 
            dateLogged 
        }
    ];
    // Sort by dateLogged primarily, then by cycle, then by week (initial/endOfWeek types)
    newRankHistory.sort((a,b) => {
        const dateComparison = new Date(a.dateLogged) - new Date(b.dateLogged);
        if (dateComparison !== 0) return dateComparison;
        if (a.cycle !== b.cycle) return a.cycle - b.cycle;
        // For entries on the same date & cycle (e.g. end of week and a daily update)
        // prioritize initial, then endOfWeek, then daily. Week 0 for initial.
        const typeOrder = { 'initial': 0, 'endOfWeek': 1, 'daily': 2 };
        const weekA = a.type === 'initial' ? -1 : (a.week ?? Infinity); // Initial comes before any week
        const weekB = b.type === 'initial' ? -1 : (b.week ?? Infinity);
        if (weekA !== weekB) return weekA - weekB;
        return (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9);
    });
    
    updateAppState({ rankHistory: newRankHistory });
    return true; 
}

export function createRankChartConfig(rankDataEntries, chartLabelPrefix = "Rank Progression") {
    const labels = rankDataEntries.map(r => {
        let label = new Date(r.dateLogged).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
        if (r.type === 'initial') label += ` (C${r.cycle} Start)`;
        else if (r.type === 'endOfWeek') label += ` (C${r.cycle} W${r.week} End)`;
        // For daily, just the date is fine, or add (Daily) if needed
        return label;
    });
    const dataPoints = rankDataEntries.map(r => rankToValue(r.tier, r.division));
    
    const chartTextColor = getComputedStyle(document.body).getPropertyValue('--current-text-color').trim() || '#666';
    const chartGridColor = getComputedStyle(document.body).getPropertyValue('--current-border-color').trim() || '#ddd';
    const chartAccentColor = getComputedStyle(document.body).getPropertyValue('--current-accent-color').trim() || 'rgb(0,123,255)';

    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${chartLabelPrefix}`,
                data: dataPoints,
                borderColor: chartAccentColor,
                backgroundColor: chartAccentColor.replace(/rgb/g, 'rgba').replace(/\)/g, ', 0.1)'),
                tension: 0.2, fill: true, pointRadius: 4, pointBackgroundColor: chartAccentColor,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false, 
                    ticks: { 
                        callback: function(value) { 
                            if (value >= 0 && value < rankTiersAndDivisions.length) return rankTiersAndDivisions[value];
                            return ''; 
                        }, 
                        stepSize: 1, color: chartTextColor 
                    },
                    grid: { color: chartGridColor }, 
                    title: { display: true, text: 'Rank', color: chartTextColor }
                },
                x: {
                     ticks: { color: chartTextColor, autoSkip: true, maxTicksLimit: 10, maxRotation: 30, minRotation: 0 }, 
                     grid: { display: false }, 
                     title: { display: true, text: 'Time / Event', color: chartTextColor }
                }
            },
            plugins: {
                legend: { labels: { color: chartTextColor } }, 
                tooltip: {
                    titleColor: chartTextColor, bodyColor: chartTextColor,
                    callbacks: {
                        label: function(context) {
                            // Use rankString from the original data entry for the most accurate tooltip
                            let label = rankDataEntries[context.dataIndex]?.rankString || rankTiersAndDivisions[context.parsed.y] || '';
                            return label;
                        }
                    }
                }
            }
        }
    };
}

export function renderProgressPageRankChart() {
    const chartContainer = document.getElementById('progressPageRankChartContainer');
    const canvasEl = document.getElementById('progressPageRankChart');
    if (!canvasEl || !chartContainer) return;

    if (rankChartInstanceProgress) rankChartInstanceProgress.destroy();
    
    // For the progress page, show all rank history, sorted by date
    const allRankData = [...appState.rankHistory].sort((a,b) => new Date(a.dateLogged) - new Date(b.dateLogged));

    if (allRankData.length === 0) {
        chartContainer.innerHTML = '<p style="text-align:center; padding-top:20px;">No rank data logged yet.</p>'; 
        return;
    }
    if (!document.getElementById('progressPageRankChart')) { // Ensure canvas exists
        chartContainer.innerHTML = '<canvas id="progressPageRankChart"></canvas>'; 
    }

    const chartConfig = createRankChartConfig(allRankData, "Overall Rank Progression");
    rankChartInstanceProgress = new Chart(document.getElementById('progressPageRankChart'), chartConfig);
}


// These helpers are used by dashboard rank update form and rank prompt modal
export function populateRankSelects(tierSelect) {
    if (!tierSelect) return;
    tierSelect.innerHTML = `<option value="">--Tier--</option>`;
    ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Champion"].forEach(t => {
        tierSelect.innerHTML += `<option value="${t}">${t}</option>`;
    });
}

export function generateDivisionButtons(containerEl, hiddenInputEl, prefix = 'form') {
    if (!containerEl || !hiddenInputEl) return;
    containerEl.innerHTML = ''; 
    for (let i = 5; i >= 1; i--) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = i;
        button.dataset.division = i;
        button.id = `${prefix}DivBtn${i}`; // e.g., dashboardDivBtn5, modalPromptDivBtn5
        button.addEventListener('click', (e) => {
            const selectedButton = e.target;
            const division = selectedButton.dataset.division;
            hiddenInputEl.value = division;
            // Remove 'selected' from siblings
            const siblings = containerEl.querySelectorAll('button');
            siblings.forEach(btn => btn.classList.remove('selected'));
            selectedButton.classList.add('selected');
        });
        containerEl.appendChild(button);
    }
}