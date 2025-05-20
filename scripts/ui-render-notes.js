// ui-render-notes.js
import { appState } from './app-state.js';
import { programData } from './program-data.js'; // To get day titles

export function renderDailyNotesSummaryPage(mainContentEl) {
    let notesHtml = `<section class="daily-notes-summary-page content-card"><h3>All Daily Notes</h3>`;
    
    // Get all note keys and sort them: c1w1d1, c1w1d2, ..., c2w1d1, ...
    const sortedNoteKeys = Object.keys(appState.dailyNotes).sort((a, b) => {
        const matchA = a.match(/c(\d+)w(\d+)d(\d+)/);
        const matchB = b.match(/c(\d+)w(\d+)d(\d+)/);

        if (!matchA || !matchB) return 0; // Should not happen if keys are correct

        const [, cycleA, weekA, dayA] = matchA.map(Number);
        const [, cycleB, weekB, dayB] = matchB.map(Number);

        if (cycleA !== cycleB) return cycleA - cycleB;
        if (weekA !== weekB) return weekA - weekB;
        return dayA - dayB;
    });

    let contentFound = false;
    if (sortedNoteKeys.length === 0) {
        notesHtml += "<p>No daily notes have been saved yet.</p>";
    } else {
        sortedNoteKeys.forEach(noteKey => {
            const noteText = appState.dailyNotes[noteKey];
            if (noteText && noteText.trim() !== '') { 
                contentFound = true;
                const match = noteKey.match(/c(\d+)w(\d+)d(\d+)/);
                if (match) {
                    const [_, cycleNum, weekNum, dayNum] = match;
                    // Attempt to get a more descriptive day title from programData
                    const dayData = programData[weekNum]?.days?.[dayNum];
                    const dayTitleDisplay = dayData?.title || `Day ${dayNum}`;
                    
                    notesHtml += `
                        <div class="note-entry">
                            <div class="note-entry-header">Cycle ${cycleNum}, Week ${weekNum}, ${dayTitleDisplay}</div>
                            <div class="note-content">${noteText.replace(/\n/g, '<br>')}</div>
                        </div>`;
                }
            }
        });
        if (!contentFound && sortedNoteKeys.length > 0) {
            notesHtml += "<p>No daily notes with content have been saved yet.</p>";
        }
    }
    notesHtml += `</section>`;
    mainContentEl.innerHTML = notesHtml;
}