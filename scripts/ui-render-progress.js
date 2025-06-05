// scripts/ui-render-progress.js
import { getAppState, updateAppState } from './app-state.js';
import { getProgramData } from './program-data.js';
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
    historyHtml += `<ul id="fullRankHistoryList" class="rank-history-list"></ul>`;
    historyHtml += `<div id="rankHistoryPaginationControls" style="text-align:center; margin-top:10px;"></div>`;
    historyHtml += `</div>`;

    // After rendering, set up paginated history rendering and controls
    setTimeout(() => renderPaginatedRankHistory(), 0);
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

// Helper for paginated rank history
function renderPaginatedRankHistory(page = 1) {
    const currentAppState = getAppState();
    const historyListEl = document.getElementById('fullRankHistoryList');
    const controlsEl = document.getElementById('rankHistoryPaginationControls');
    if (!historyListEl || !controlsEl) return;
    const sortedHistory = [...currentAppState.rankHistory].sort((a,b) => new Date(a.dateLogged) - new Date(b.dateLogged));
    const total = sortedHistory.length;
    if (total === 0) {
        historyListEl.innerHTML = `<li>No ranks logged yet.</li>`;
        controlsEl.innerHTML = '';
        return;
    }
    // Pagination logic
    let itemsToShow = 5;
    let paged = false;
    let maxPage = 1;
    if (total > 5) {
        itemsToShow = 10;
        maxPage = Math.ceil((total - 5) / 10) + 1;
        paged = total > 10;
    }
    // Calculate slice indices (show from bottom up)
    let startIdx = 0, endIdx = total;
    if (total <= 5) {
        startIdx = 0;
        endIdx = total;
    } else if (page === 1) {
        startIdx = total - 5;
        endIdx = total;
    } else {
        startIdx = total - 5 - (page - 2) * 10 - 10;
        endIdx = total - 5 - (page - 2) * 10;
        if (startIdx < 0) startIdx = 0;
        if (endIdx < 0) endIdx = 0;
    }
    const pageEntries = sortedHistory.slice(startIdx, endIdx);
    historyListEl.innerHTML = '';
    pageEntries.forEach(rankEntry => {
        let entryLabel = `C${rankEntry.cycle}, `;
        if (rankEntry.type === 'initial') entryLabel += `Initial`;
        // Removed endOfWeek label (feature deprecated)
        else if (rankEntry.type === 'daily') entryLabel += `Daily Update`;
        else if (rankEntry.week) entryLabel += `W${rankEntry.week}`; 
        else entryLabel += `Update`;
        // Role label and color
        let roleLabel = '';
        let roleColor = '';
        if (rankEntry.role === 'tank') {
            roleLabel = 'Tank';
            roleColor = 'var(--tank-primary, #1565C0)';
        } else if (rankEntry.role === 'support') {
            roleLabel = 'Support';
            roleColor = 'var(--support-primary, #388E3C)';
        } else if (rankEntry.role === 'dps') {
            roleLabel = 'DPS';
            roleColor = 'var(--damage-primary, #D32F2F)';
        } else {
            roleLabel = rankEntry.role ? rankEntry.role : 'Unknown';
            roleColor = '#888';
        }
        historyListEl.innerHTML = `<li style="display: flex; align-items: stretch;">
            <div class="rank-role-label" style="min-width: 70px; display: flex; align-items: center; justify-content: flex-start; font-size: 1em; font-weight: bold; color: ${roleColor}; padding-right: 10px; border-right: 2px solid #eee; margin-right: 12px;">${roleLabel}</div>
            <div style="flex:1; padding-left: 0.5em;">
                <span><span class="rank-type">${entryLabel}:</span> ${rankEntry.rankString}</span><br>
                <span class="rank-date">(${rankEntry.dateLogged})</span>
            </div>
        </li>` + historyListEl.innerHTML;
    });
    // Controls
    controlsEl.innerHTML = '';
    if (total > 5) {
        if (page === 1) {
            controlsEl.innerHTML = `<button id="showMoreRankHistoryBtn" class="form-button" style="margin:5px auto;">Show More</button>`;
        } else {
            // Pagination controls
            let prevDisabled = page <= 1 ? 'disabled' : '';
            let nextDisabled = page >= maxPage ? 'disabled' : '';
            controlsEl.innerHTML = `
                <button id="rankHistoryPrevBtn" class="form-button" ${prevDisabled} style="margin:5px;">Previous</button>
                <span style="margin:0 10px;">Page ${page} of ${maxPage}</span>
                <button id="rankHistoryNextBtn" class="form-button" ${nextDisabled} style="margin:5px;">Next</button>
            `;
        }
    }
    // Event listeners
    if (total > 5 && page === 1) {
        const showMoreBtn = document.getElementById('showMoreRankHistoryBtn');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => renderPaginatedRankHistory(2));
        }
    } else if (total > 5 && page > 1) {
        const prevBtn = document.getElementById('rankHistoryPrevBtn');
        const nextBtn = document.getElementById('rankHistoryNextBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => renderPaginatedRankHistory(page - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => renderPaginatedRankHistory(page + 1));
    }
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

export function addRankEntry({ week = null, type, tier, division, role = 'dps' }) {
    const currentAppState = getAppState();
    const rankString = `${tier} ${division}`;
    const dateLogged = new Date().toISOString().split('T')[0];

    if (type === 'initial') {
        const alreadyExists = currentAppState.rankHistory.some(
            r => r.cycle === currentAppState.currentCycle && r.week === week && r.type === type && r.role === role
        );
        if (alreadyExists) {
            console.warn(`Rank for ${type} W${week} C${currentAppState.currentCycle} (${role}) already exists. Not adding duplicate.`);
            return false;
        }
    }
    // Always store division as a string for consistency
    const newRankHistory = [
        ...currentAppState.rankHistory,
        { cycle: currentAppState.currentCycle, week, type, tier, division: String(division), rankString, dateLogged, role }
    ];
    newRankHistory.sort((a, b) => {
        const dateComparison = new Date(a.dateLogged) - new Date(b.dateLogged);
        if (dateComparison !== 0) return dateComparison;
        if (a.cycle !== b.cycle) return a.cycle - b.cycle;
        const typeOrder = { 'initial': 0, 'daily': 1 };
        const weekA = a.type === 'initial' ? -1 : (a.week ?? Infinity);
        const weekB = b.type === 'initial' ? -1 : (b.week ?? Infinity);
        if (weekA !== weekB) return weekA - weekB;
        return (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9);
    });
    updateAppState({ rankHistory: newRankHistory });
    console.log('[addRankEntry] Added:', { cycle: currentAppState.currentCycle, week, type, tier, division, rankString, dateLogged, role });
    return true;
}

export function createRankChartConfig(rankDataEntries, chartLabelPrefix = "Rank Progression") {
    // Show progression: X axis is every log entry (chronological), not just unique dates
    const roles = ['dps', 'tank', 'support'];
    // Sort entries by date/time (and optionally by insertion order if needed)
    const sortedEntries = [...rankDataEntries].sort((a, b) => {
        // If you want to support multiple entries per day, sort by full ISO string if available
        // If only date (YYYY-MM-DD), this will still work
        return new Date(a.dateLogged) - new Date(b.dateLogged);
    });
    // Build labels for each entry
    const labels = sortedEntries.map(entry => {
        let label = '';
        if (entry && entry.dateLogged) {
            label = new Date(entry.dateLogged).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
            if (entry.type === 'initial') label += ` (C${entry.cycle} Start)`;
            // Removed endOfWeek label (feature deprecated)
            else if (entry.type === 'daily') label += ` (Daily)`;
            if (entry.role && typeof entry.role === 'string') {
                label += ` [${entry.role.charAt(0).toUpperCase() + entry.role.slice(1)}]`;
            }
        } else {
            label = '(Unknown)';
        }
        return label;
    });
    // For each role, build a dataset: value if entry is for that role, else null
    const datasets = roles.map(role => {
        const dataPoints = sortedEntries.map(entry => {
            return entry.role === role ? rankToValue(entry.tier, entry.division) : null;
        });
        // Get themed color for this role
        const bodyStyles = getComputedStyle(document.body);
        let colorVar = '--current-accent-color';
        let pointColor = '#888';
        let borderDash = undefined;
        let roleLabel = '';
        if (role === 'tank') {
            colorVar = '--tank-primary';
            pointColor = bodyStyles.getPropertyValue('--tank-primary').trim() || '#1565C0';
            roleLabel = 'Tank';
        } else if (role === 'support') {
            colorVar = '--support-primary';
            pointColor = bodyStyles.getPropertyValue('--support-primary').trim() || '#388E3C';
            roleLabel = 'Support';
        } else if (role === 'dps') {
            colorVar = '--damage-primary';
            pointColor = bodyStyles.getPropertyValue('--damage-primary').trim() || '#D32F2F';
            roleLabel = 'DPS';
        }
        const chartAccentColor = bodyStyles.getPropertyValue(colorVar).trim() || pointColor;
        // Use different line styles for each role for extra clarity
        if (role === 'tank') borderDash = [6, 4];
        if (role === 'support') borderDash = [2, 2];
        // DPS = solid
        return {
            label: roleLabel,
            data: dataPoints,
            borderColor: chartAccentColor,
            backgroundColor: chartAccentColor.replace(/rgb/g, 'rgba').replace(/\)/g, ', 0.1)'),
            tension: 0.2, fill: false, pointRadius: 5, pointBackgroundColor: chartAccentColor,
            spanGaps: true,
            borderDash: borderDash
        };
    });
    // Get themed colors from CSS custom properties
    const bodyStyles = getComputedStyle(document.body);
    const chartTextColor = bodyStyles.getPropertyValue('--current-chart-text-color').trim() || '#666';
    const chartGridColor = bodyStyles.getPropertyValue('--current-chart-grid-color').trim() || '#ddd';
    const chartTooltipBgColor = bodyStyles.getPropertyValue('--current-chart-tooltip-bg').trim() || 'rgba(0,0,0,0.8)';
    const chartTooltipTextColor = bodyStyles.getPropertyValue('--current-chart-tooltip-text-color').trim() || '#fff';

    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
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
                            // context.dataIndex is the index in sortedEntries
                            const entry = sortedEntries[context.dataIndex];
                            let label = `${context.dataset.label}: `;
                            label += entry?.rankString || (typeof context.parsed.y === 'number' ? rankTiersAndDivisions[context.parsed.y] : '');
                            return label;
                        }
                    }
                }
            }
        }
    };
}

export async function renderProgressPageRankChart() { // Made async
    // Lazy-load Chart.js only when needed
    if (typeof window.Chart !== 'function') {
        try {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                s.onload = resolve;
                s.onerror = () => reject(new Error('Failed to load Chart.js'));
                document.head.appendChild(s);
            });
        } catch (error) {
            console.error(error.message);
            const chartContainer = document.getElementById('progressPageRankChartContainer');
            if (chartContainer) {
                chartContainer.innerHTML = '<p style="text-align:center; padding-top:20px; color:var(--danger-color);">Failed to load charting library. Please check your internet connection and try again.</p>';
            }
            return; // Stop execution if Chart.js fails to load
        }
    }

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

export function generateDivisionButtons(containerEl, hiddenInputEl, prefix = 'form', preselectDivision = null) {
    if (!containerEl || !hiddenInputEl) return;
    containerEl.innerHTML = '';
    hiddenInputEl.value = '';
    for (let i = 5; i >= 1; i--) {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('form-button');
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
        // Preselect if provided
        if (preselectDivision && String(preselectDivision) === String(i)) {
            button.classList.add('selected');
            hiddenInputEl.value = i;
        }
        containerEl.appendChild(button);
    }
}