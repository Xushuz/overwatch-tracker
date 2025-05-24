// scripts/ui-render-progress.js
import { getAppState, updateAppState } from './app-state.js';
import { programData } from './program-data.js';
import { getTaskCompletionStats } from './task-utils.js';

export let rankChartInstanceProgress = null; 

export const rankToValue = (tier, division) => {
    const tierValues = { "Bronze": 0, "Silver": 5, "Gold": 10, "Platinum": 15, "Diamond": 20, "Master": 25, "Grandmaster": 30, "Champion": 35 };
    const numericDivision = parseInt(division);
    if (isNaN(numericDivision) || numericDivision < 1 || numericDivision > 5) {
        return tierValues[tier] || 0; 
    }
    return (tierValues[tier] || 0) + (5 - numericDivision); 
};

export const rankTiersAndDivisions = [
    "Bronze 5", "Bronze 4", "Bronze 3", "Bronze 2", "Bronze 1", "Silver 5", "Silver 4", "Silver 3", "Silver 2", "Silver 1",
    "Gold 5", "Gold 4", "Gold 3", "Gold 2", "Gold 1", "Platinum 5", "Platinum 4", "Platinum 3", "Platinum 2", "Platinum 1",
    "Diamond 5", "Diamond 4", "Diamond 3", "Diamond 2", "Diamond 1", "Master 5", "Master 4", "Master 3", "Master 2", "Master 1",
    "Grandmaster 5", "Grandmaster 4", "Grandmaster 3", "Grandmaster 2", "Grandmaster 1", "Champion 5", "Champion 4", "Champion 3", "Champion 2", "Champion 1"
];


export function renderRankHistoryPage(mainContentEl) { 
    const currentAppState = getAppState();
    let historyHtml = `<section class="progress-page"><h2>Rank Update History</h2>`;
    historyHtml += `
        <div class="content-card">
            <h3>Overall Program Completion (Current Cycle #${currentAppState.currentCycle})</h3>
            <div id="overallProgramProgressContainer"></div>
        </div>
    `;
    historyHtml += `<div class="content-card rank-history-section">`;
    historyHtml += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0;">All Logged Ranks (All Cycles)</h3>
        <button id="resetRankHistoryBtn" class="form-button form-button--danger" type="button">Reset Progress</button>
    </div>`;
    historyHtml += `<ul id="fullRankHistoryList" class="rank-history-list">`;

    if (currentAppState.rankHistory.length === 0) {
        historyHtml += `<li>No ranks logged yet.</li>`;
    } else {
        const sortedHistory = [...currentAppState.rankHistory].sort((a,b) => new Date(a.dateLogged) - new Date(b.dateLogged));
        sortedHistory.forEach(rankEntry => {
            let entryLabel = `C${rankEntry.cycle}, `;
            if (rankEntry.type === 'initial') entryLabel += `Initial`;
            else if (rankEntry.type === 'endOfWeek') entryLabel += `End of W${rankEntry.week}`;
            else if (rankEntry.type === 'daily') entryLabel += `Daily Update`;
            else if (rankEntry.week) entryLabel += `W${rankEntry.week}`; 
            else entryLabel += `Update`;
            historyHtml += `<li>
                                <span><span class="rank-type">${entryLabel}:</span> ${rankEntry.rankString}</span> 
                                <span class="rank-date">(${rankEntry.dateLogged})</span>
                             </li>`;
        });
    }
    historyHtml += `</ul></div>`;
    historyHtml += `
        <div class="content-card">
            <h3>Rank Progression Chart (All Time)</h3>
             <div id="progressPageRankChartContainer" style="min-height: 350px; position: relative;">
                <canvas id="progressPageRankChart"></canvas>
            </div>
        </div>`;
    historyHtml += `</section>`;
    mainContentEl.innerHTML = historyHtml;

    // Add event listener for reset button
    const resetBtn = document.getElementById('resetRankHistoryBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all rank history? This cannot be undone.')) {
                updateAppState({ rankHistory: [] });
                renderRankHistoryPage(mainContentEl);
            }
        });
    }

    renderOverallProgramProgress(); 
    renderProgressPageRankChart(); 
}
    
export function renderOverallProgramProgress() {
    const currentAppState = getAppState();
    const progressContainer = document.getElementById('overallProgramProgressContainer');
    if (!progressContainer) return;
    const { total, completed, percent } = getTaskCompletionStats({ all: true });
    progressContainer.innerHTML = `
        <p>You have completed <strong>${completed}</strong> out of <strong>${total}</strong> tasks for Cycle #${currentAppState.currentCycle}.</p>
        <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${percent}%;">
                ${percent > 10 ? `${percent}%` : ''}
            </div>
        </div>
    `;
}

export function addRankEntry({ week = null, type, tier, division }) {
    const currentAppState = getAppState();
    const rankString = `${tier} ${division}`;
    const dateLogged = new Date().toISOString().split('T')[0]; 

    if (type === 'initial' || type === 'endOfWeek') {
        const alreadyExists = currentAppState.rankHistory.some(
            r => r.cycle === currentAppState.currentCycle && r.week === week && r.type === type
        );
        if (alreadyExists) {
             console.warn(`Rank for ${type} W${week} C${currentAppState.currentCycle} already exists. Not adding duplicate.`);
             return false; 
        }
    }
    const newRankHistory = [
        ...currentAppState.rankHistory,
        { cycle: currentAppState.currentCycle, week: type === 'daily' ? null : week, type, tier, division: parseInt(division), rankString, dateLogged }
    ];
    newRankHistory.sort((a,b) => {
        const dateComparison = new Date(a.dateLogged) - new Date(b.dateLogged);
        if (dateComparison !== 0) return dateComparison;
        if (a.cycle !== b.cycle) return a.cycle - b.cycle;
        const typeOrder = { 'initial': 0, 'endOfWeek': 1, 'daily': 2 };
        const weekA = a.type === 'initial' ? -1 : (a.week ?? Infinity);
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
        return label;
    });
    const dataPoints = rankDataEntries.map(r => rankToValue(r.tier, r.division));
    
    // Get themed colors from CSS custom properties
    const bodyStyles = getComputedStyle(document.body);
    const chartTextColor = bodyStyles.getPropertyValue('--current-chart-text-color').trim() || '#666';
    const chartGridColor = bodyStyles.getPropertyValue('--current-chart-grid-color').trim() || '#ddd';
    const chartAccentColor = bodyStyles.getPropertyValue('--current-accent-color').trim() || 'rgb(0,123,255)';
    const chartTooltipBgColor = bodyStyles.getPropertyValue('--current-chart-tooltip-bg').trim() || 'rgba(0,0,0,0.8)';
    const chartTooltipTextColor = bodyStyles.getPropertyValue('--current-chart-tooltip-text-color').trim() || '#fff';


    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${chartLabelPrefix}`,
                data: dataPoints,
                borderColor: chartAccentColor,
                backgroundColor: chartAccentColor.replace(/rgb/g, 'rgba').replace(/\)/g, ', 0.1)'), // Make it semi-transparent
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
                    backgroundColor: chartTooltipBgColor, // Use themed tooltip background
                    titleColor: chartTooltipTextColor,    // Use themed tooltip title text color
                    bodyColor: chartTooltipTextColor,     // Use themed tooltip body text color
                    callbacks: {
                        label: function(context) {
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
    const currentAppState = getAppState();
    if (!canvasEl || !chartContainer) return;

    if (rankChartInstanceProgress) rankChartInstanceProgress.destroy();
    
    const allRankData = [...currentAppState.rankHistory].sort((a,b) => new Date(a.dateLogged) - new Date(b.dateLogged));

    if (allRankData.length === 0) {
        chartContainer.innerHTML = '<p style="text-align:center; padding-top:20px;">No rank data logged yet.</p>'; 
        return;
    }
    if (!document.getElementById('progressPageRankChart')) { 
        chartContainer.innerHTML = '<canvas id="progressPageRankChart"></canvas>'; 
    }

    const chartConfig = createRankChartConfig(allRankData, "Overall Rank Progression");
    const newCanvasEl = document.getElementById('progressPageRankChart');
    if (newCanvasEl) {
      rankChartInstanceProgress = new Chart(newCanvasEl, chartConfig);
    } else {
        console.error("Progress page chart canvas not found after attempting to re-add it.");
    }
}

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
        button.classList.add('form-button'); // Apply the standard button class
        // Consider adding a more specific class if these need further unique styling beyond .form-button
        // e.g., button.classList.add('division-group-button');
        button.textContent = i;
        button.dataset.division = i;
        button.id = `${prefix}DivBtn${i}`;
        button.addEventListener('click', (e) => {
            const selectedButton = e.target;
            const division = selectedButton.dataset.division;
            hiddenInputEl.value = division;
            const siblings = containerEl.querySelectorAll('button');
            siblings.forEach(btn => btn.classList.remove('selected'));
            selectedButton.classList.add('selected');
        });
        containerEl.appendChild(button);
    }
}