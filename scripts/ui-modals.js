// ui-modals.js
import { appState, updateAppState } from './app-state.js';
import { populateRankSelects, generateDivisionButtons, addRankEntry } from './ui-render-progress.js';
import { renderDashboardRankChart } from './ui-render-dashboard.js';
import { renderRankHistoryPage } from './ui-render-progress.js'; // For updating progress page chart if open

// DOM Element References (will be initialized)
let rankPromptModal = null;
let rankPromptTitleEl = null;
let modalRankLogForm = null;
let modalRankLogWeekInput = null;
let modalRankLogTypeInput = null;
let modalRankTierSelect = null;
let modalRankDivisionButtonsEl = null;
let modalRankDivisionValueInput = null;
let closeRankPromptModalBtn = null;
let saveModalRankLogBtn = null;
let cancelModalRankLogBtn = null;

export function initRankPromptModal(
    modalEl, titleEl, formEl, weekInputEl, typeInputEl, tierSelectEl, 
    divisionButtonsContainerEl, divisionValueInputEl, 
    closeBtnEl, saveBtnEl, cancelBtnEl
) {
    rankPromptModal = modalEl;
    rankPromptTitleEl = titleEl;
    modalRankLogForm = formEl;
    modalRankLogWeekInput = weekInputEl;
    modalRankLogTypeInput = typeInputEl;
    modalRankTierSelect = tierSelectEl;
    modalRankDivisionButtonsEl = divisionButtonsContainerEl;
    modalRankDivisionValueInput = divisionValueInputEl;
    closeRankPromptModalBtn = closeBtnEl;
    saveModalRankLogBtn = saveBtnEl;
    cancelModalRankLogBtn = cancelBtnEl;

    if (closeRankPromptModalBtn) closeRankPromptModalBtn.addEventListener('click', closeRankPromptModal);
    if (saveModalRankLogBtn) saveModalRankLogBtn.addEventListener('click', handleModalRankLogSave);
    if (cancelModalRankLogBtn) cancelModalRankLogBtn.addEventListener('click', closeRankPromptModal);
    if (rankPromptModal) {
        rankPromptModal.addEventListener('click', (event) => {
            if (event.target === rankPromptModal) { // Clicked on overlay
                closeRankPromptModal();
            }
        });
    }
}

export function promptForRank(week, type = 'initial') {
    if (!rankPromptModal || !modalRankLogForm || !modalRankDivisionButtonsEl || !modalRankDivisionValueInput || !rankPromptTitleEl || !modalRankLogWeekInput || !modalRankLogTypeInput) {
        console.error("Rank prompt modal elements not all initialized.");
        return;
    }
    
    // Check if this specific prompt (cycle + week + type) has already been actioned (saved or skipped)
    // For 'initial', week is 0.
    const promptKey = type === 'initial' ? `c${appState.currentCycle}_initialPrompt` : `c${appState.currentCycle}w${week}_${type}Prompt`;
    if (type === 'endOfWeek' && appState.hasPromptedRankForWeek[promptKey]) {
        console.log(`Already actioned prompt for rank for end of W${week} C${appState.currentCycle}.`);
        return; 
    }
     if (type === 'initial' && appState.hasPromptedInitialRankThisCycle) {
        // This covers the case where init calls it, but it was already prompted and skipped/saved
        // However, the main check for initial rank should be if an 'initial' rank entry exists for the cycle.
        const currentCycleInitialRankExists = appState.rankHistory.some(
            r => r.cycle === appState.currentCycle && r.type === 'initial'
        );
        if(currentCycleInitialRankExists) {
            console.log(`Initial rank for Cycle ${appState.currentCycle} already logged or explicitly skipped via hasPrompted flag.`);
            return;
        }
    }


    rankPromptTitleEl.textContent = type === 'initial' ? `Log Initial Rank (Cycle ${appState.currentCycle})` : `Log Rank for End of Week ${week} (Cycle ${appState.currentCycle})`;
    modalRankLogWeekInput.value = (type === 'initial' ? 0 : week); // Store week 0 for initial
    modalRankLogTypeInput.value = type;

    populateRankSelects(modalRankTierSelect); // Populate only Tier select for the modal
    generateDivisionButtons(modalRankDivisionButtonsEl, modalRankDivisionValueInput, 'modalPrompt');
    
    modalRankLogForm.reset(); // Clear previous entries from tier select
    modalRankDivisionValueInput.value = ''; // Clear hidden division input explicitly
    modalRankDivisionButtonsEl.querySelectorAll('button').forEach(btn => btn.classList.remove('selected')); // Clear button selection

    // Pre-fill with latest rank if available for the current cycle, or absolute latest if none for current cycle
    const latestRankInCycle = appState.rankHistory.slice().reverse().find(r => r.cycle === appState.currentCycle);
    const latestRankOverall = appState.rankHistory.length > 0 ? appState.rankHistory[appState.rankHistory.length - 1] : null;
    const rankToPrePopulate = latestRankInCycle || latestRankOverall;

    if (rankToPrePopulate && modalRankTierSelect) {
        modalRankTierSelect.value = rankToPrePopulate.tier;
        if (rankToPrePopulate.division && modalRankDivisionButtonsEl) {
            const selectedBtn = modalRankDivisionButtonsEl.querySelector(`button[data-division="${rankToPrePopulate.division}"]`);
            if (selectedBtn) {
                selectedBtn.classList.add('selected');
                modalRankDivisionValueInput.value = rankToPrePopulate.division;
            }
        }
    }
    
    rankPromptModal.style.display = 'flex';
}

export function closeRankPromptModal() {
    if (rankPromptModal) rankPromptModal.style.display = 'none';
    
    // Mark as prompted even if skipped, to avoid re-prompting for the same event.
    const type = modalRankLogTypeInput.value;
    const week = parseInt(modalRankLogWeekInput.value); // This is week 0 for 'initial'

    if (type === 'initial') {
        updateAppState({ hasPromptedInitialRankThisCycle: true });
    } else if (type === 'endOfWeek') {
        const promptKey = `c${appState.currentCycle}w${week}_${type}Prompt`;
        updateAppState({ 
            hasPromptedRankForWeek: { ...appState.hasPromptedRankForWeek, [promptKey]: true } 
        });
    }
}

function handleModalRankLogSave() {
    if (!modalRankLogForm || !modalRankLogWeekInput || !modalRankLogTypeInput || !modalRankTierSelect || !modalRankDivisionValueInput) return;

    const weekForLog = parseInt(modalRankLogWeekInput.value); // This is 0 for 'initial' type
    const type = modalRankLogTypeInput.value;
    const tier = modalRankTierSelect.value;
    const division = modalRankDivisionValueInput.value;

    if (!tier || !division) { 
        alert("Please select a Tier and Division."); 
        return; 
    }
    
    const added = addRankEntry({ 
        week: weekForLog, // Pass the week (0 for initial)
        type, 
        tier, 
        division 
    });
    
    // Mark as prompted and actioned
    if (type === 'initial') {
        updateAppState({ hasPromptedInitialRankThisCycle: true });
    } else if (type === 'endOfWeek') {
        const promptKey = `c${appState.currentCycle}w${weekForLog}_${type}Prompt`;
        updateAppState({ 
            hasPromptedRankForWeek: { ...appState.hasPromptedRankForWeek, [promptKey]: true } 
        });
    }
    
    closeRankPromptModal(); // Close modal first
    
    // Update relevant charts if the current page is showing them
    if (appState.currentPage === 'dashboard') renderDashboardRankChart();
    if (appState.currentPage === 'progress') renderRankHistoryPage(); // This will re-render the list and its chart
}