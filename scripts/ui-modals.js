// scripts/ui-modals.js
import { appState, updateAppState } from './app-state.js';
import { populateRankSelects, generateDivisionButtons, addRankEntry } from './ui-render-progress.js';
import { renderDashboardRankChart } from './ui-render-dashboard-tasks.js';
import { renderRankHistoryPage } from './ui-render-progress.js'; 

// DOM Element References (will be initialized by initRankPromptModal)
let rankPromptModalEl = null; 
let rankPromptTitleEl = null;
let modalRankLogFormEl = null; 
let modalRankLogWeekInputEl = null; 
let modalRankLogTypeInputEl = null; 
let modalRankTierSelectEl = null; 
let modalRankDivisionButtonsEl = null;
let modalRankDivisionValueInputEl = null; 
let closeRankPromptModalBtnEl = null; 
let saveModalRankLogBtnEl = null; 
let cancelModalRankLogBtnEl = null; 

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
        console.error("Rank prompt modal elements not all initialized correctly for promptForRank.");
        return;
    }
    
    const promptKey = type === 'initial' ? `c${appState.currentCycle}_initialPrompt` : `c${appState.currentCycle}w${week}_${type}Prompt`;
    if (type === 'endOfWeek' && appState.hasPromptedRankForWeek[promptKey]) {
        console.log(`Already actioned prompt for rank for end of W${week} C${appState.currentCycle}.`);
        return; 
    }
     if (type === 'initial' && appState.hasPromptedInitialRankThisCycle) {
        const currentCycleInitialRankExists = appState.rankHistory.some(
            r => r.cycle === appState.currentCycle && r.type === 'initial'
        );
        if(currentCycleInitialRankExists) {
            console.log(`Initial rank for Cycle ${appState.currentCycle} already logged or explicitly skipped.`);
            return;
        }
    }

    rankPromptTitleEl.textContent = type === 'initial' ? `Log Initial Rank (Cycle ${appState.currentCycle})` : `Log Rank for End of Week ${week} (Cycle ${appState.currentCycle})`;
    modalRankLogWeekInputEl.value = (type === 'initial' ? 0 : week); 
    modalRankLogTypeInputEl.value = type;

    populateRankSelects(modalRankTierSelectEl); 
    // Crucially, ensure generateDivisionButtons is called and elements are correct
    generateDivisionButtons(modalRankDivisionButtonsEl, modalRankDivisionValueInputEl, 'modalPrompt');
    
    modalRankLogFormEl.reset(); // Clears tier select
    modalRankDivisionValueInputEl.value = ''; // Clear hidden division input explicitly
    if(modalRankDivisionButtonsEl) modalRankDivisionButtonsEl.querySelectorAll('button').forEach(btn => btn.classList.remove('selected')); // Clear button selection

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
    
    // These elements might not exist if modal was never fully initialized, so guard access
    const typeInput = document.getElementById('modalRankLogType'); // Re-querying here just in case
    const weekInput = document.getElementById('modalRankLogWeek');

    if (!typeInput || !weekInput) return; 

    const type = typeInput.value;
    const week = parseInt(weekInput.value); 

    if (type === 'initial') {
        updateAppState({ hasPromptedInitialRankThisCycle: true });
    } else if (type === 'endOfWeek' && !isNaN(week)) { // Ensure week is a number
        const promptKey = `c${appState.currentCycle}w${week}_${type}Prompt`;
        updateAppState({ 
            hasPromptedRankForWeek: { ...appState.hasPromptedRankForWeek, [promptKey]: true } 
        });
    }
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
        
    closeRankPromptModal(); 
    
    if (appState.currentPage === 'dashboard') renderDashboardRankChart();
    if (appState.currentPage === 'progress') renderRankHistoryPage();
}