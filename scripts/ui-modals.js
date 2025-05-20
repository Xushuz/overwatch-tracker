// scripts/ui-modals.js
import { appState, updateAppState } from './app-state.js';
import { populateRankSelects, generateDivisionButtons, addRankEntry } from './ui-render-progress.js';
import { renderDashboardRankChart } from './ui-render-dashboard.js';
import { renderRankHistoryPage } from './ui-render-progress.js'; 

// DOM Element References (will be initialized by initRankPromptModal)
let rankPromptModalEl = null; // Changed from rankPromptModal to avoid conflict if other modals use this var name
let rankPromptTitleEl = null;
let modalRankLogFormEl = null; // Changed from modalRankLogForm
let modalRankLogWeekInputEl = null; // Changed from modalRankLogWeekInput
let modalRankLogTypeInputEl = null; // Changed from modalRankLogTypeInput
let modalRankTierSelectEl = null; // Changed from modalRankTierSelect
let modalRankDivisionButtonsEl = null;
let modalRankDivisionValueInputEl = null; // Changed from modalRankDivisionValueInput
let closeRankPromptModalBtnEl = null; // Changed from closeRankPromptModalBtn
let saveModalRankLogBtnEl = null; // Changed from saveModalRankLogBtn
let cancelModalRankLogBtnEl = null; // Changed from cancelModalRankLogBtn

export function initRankPromptModal(
    modalElement, titleElement, formElement, weekInputElement, typeInputElement, tierSelectElement, 
    divisionButtonsContainerElement, divisionValueInputElement, 
    closeButtonElement, saveButtonElement, cancelButtonElement
) {
    rankPromptModalEl = modalElement;
    rankPromptTitleEl = titleElement;
    modalRankLogFormEl = formElement;
    modalRankLogWeekInputEl = weekInputElement;
    modalRankLogTypeInputEl = typeInputElement;
    modalRankTierSelectEl = tierSelectElement;
    modalRankDivisionButtonsEl = divisionButtonsContainerElement;
    modalRankDivisionValueInputEl = divisionValueInputElement;
    closeRankPromptModalBtnEl = closeButtonElement;
    saveModalRankLogBtnEl = saveButtonElement;
    cancelModalRankLogBtnEl = cancelButtonElement;

    if (closeRankPromptModalBtnEl) closeRankPromptModalBtnEl.addEventListener('click', closeRankPromptModal);
    if (saveModalRankLogBtnEl) saveModalRankLogBtnEl.addEventListener('click', handleModalRankLogSave);
    if (cancelModalRankLogBtnEl) cancelModalRankLogBtnEl.addEventListener('click', closeRankPromptModal);
    if (rankPromptModalEl) {
        rankPromptModalEl.addEventListener('click', (event) => {
            if (event.target === rankPromptModalEl) { 
                closeRankPromptModal();
            }
        });
    }
}

export function promptForRank(week, type = 'initial') {
    if (!rankPromptModalEl || !modalRankLogFormEl || !modalRankDivisionButtonsEl || !modalRankDivisionValueInputEl || !rankPromptTitleEl || !modalRankLogWeekInputEl || !modalRankLogTypeInputEl || !modalRankTierSelectEl) {
        console.error("Rank prompt modal elements not all initialized correctly.");
        return;
    }
    
    const promptKey = type === 'initial' ? `c${appState.currentCycle}_initialPrompt` : `c${appState.currentCycle}w${week}_${type}Prompt`;
    if (type === 'endOfWeek' && appState.hasPromptedRankForWeek[promptKey]) {
        return; 
    }
    if (type === 'initial' && appState.hasPromptedInitialRankThisCycle) {
        const currentCycleInitialRankExists = appState.rankHistory.some(
            r => r.cycle === appState.currentCycle && r.type === 'initial'
        );
        if(currentCycleInitialRankExists) return;
    }

    rankPromptTitleEl.textContent = type === 'initial' ? `Log Initial Rank (Cycle ${appState.currentCycle})` : `Log Rank for End of Week ${week} (Cycle ${appState.currentCycle})`;
    modalRankLogWeekInputEl.value = (type === 'initial' ? 0 : week); 
    modalRankLogTypeInputEl.value = type;

    populateRankSelects(modalRankTierSelectEl); 
    generateDivisionButtons(modalRankDivisionButtonsEl, modalRankDivisionValueInputEl, 'modalPrompt');
    
    modalRankLogFormEl.reset(); 
    modalRankDivisionValueInputEl.value = ''; 
    if(modalRankDivisionButtonsEl) modalRankDivisionButtonsEl.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));

    const latestRankInCycle = appState.rankHistory.slice().reverse().find(r => r.cycle === appState.currentCycle);
    const latestRankOverall = appState.rankHistory.length > 0 ? appState.rankHistory[appState.rankHistory.length - 1] : null;
    const rankToPrePopulate = latestRankInCycle || latestRankOverall;

    if (rankToPrePopulate && modalRankTierSelectEl) {
        modalRankTierSelectEl.value = rankToPrePopulate.tier;
        if (rankToPrePopulate.division && modalRankDivisionButtonsEl) {
            const selectedBtn = modalRankDivisionButtonsEl.querySelector(`button[data-division="${rankToPrePopulate.division}"]`);
            if (selectedBtn) {
                selectedBtn.classList.add('selected');
                modalRankDivisionValueInputEl.value = rankToPrePopulate.division;
            }
        }
    }
    
    rankPromptModalEl.style.display = 'flex'; // Explicitly set to flex to show and center
}

export function closeRankPromptModal() {
    if (rankPromptModalEl) rankPromptModalEl.style.display = 'none';
    
    const type = modalRankLogTypeInputEl.value; // Use the element reference
    const week = parseInt(modalRankLogWeekInputEl.value); 

    if (type === 'initial') {
        updateAppState({ hasPromptedInitialRankThisCycle: true });
    } else if (type === 'endOfWeek') {
        const promptKey = `c${appState.currentCycle}w${week}_${type}Prompt`;
        updateAppState({ 
            hasPromptedRankForWeek: { ...appState.hasPromptedRankForWeek, [promptKey]: true } 
        });
    }
    // saveState() is called by updateAppState
}

function handleModalRankLogSave() {
    if (!modalRankLogFormEl || !modalRankLogWeekInputEl || !modalRankLogTypeInputEl || !modalRankTierSelectEl || !modalRankDivisionValueInputEl) {
        console.error("Modal form elements for rank log save not found.");
        return;
    }

    const weekForLog = parseInt(modalRankLogWeekInputEl.value); 
    const type = modalRankLogTypeInputEl.value;
    const tier = modalRankTierSelectEl.value;
    const division = modalRankDivisionValueInputEl.value;

    if (!tier || !division) { 
        alert("Please select a Tier and Division."); 
        return; 
    }
    
    addRankEntry({ 
        week: weekForLog, 
        type, 
        tier, 
        division 
    });
    
    // Marking as prompted is now handled by closeRankPromptModal which is called next
    
    closeRankPromptModal(); 
    
    if (appState.currentPage === 'dashboard') renderDashboardRankChart();
    if (appState.currentPage === 'progress') renderRankHistoryPage();
}