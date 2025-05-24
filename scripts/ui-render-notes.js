// ui-render-notes.js
import { appState, updateAppState } from './app-state.js';
import { programData } from './program-data.js'; // To get day titles

/**
 * Render the Daily Notes summary view with optional search filter.
 * @param {HTMLElement} mainContentEl
 * @param {string} filterTerm
 */
export function renderDailyNotesSummaryPage(mainContentEl, filterTerm = '') {
    const searchTerm = filterTerm.trim().toLowerCase();
    // Search input and header
    let notesHtml = `<section class="daily-notes-summary-page content-card">
        <h3>All Daily Notes</h3>
        <input id="notesSearch" class="notes-search-input" type="text" placeholder="Search notes..." value="${filterTerm}" />`;
    
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
        // Filter keys by search term if provided
        const keysToShow = searchTerm
            ? sortedNoteKeys.filter(key => {
                const text = (appState.dailyNotes[key] || '').toLowerCase();
                const headerLabel = key.toLowerCase();
                return text.includes(searchTerm) || headerLabel.includes(searchTerm);
            })
            : sortedNoteKeys;
        if (keysToShow.length === 0) {
            notesHtml += "<p>No notes match your search.</p>";
        } else {
            keysToShow.forEach(noteKey => {
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
                    <div class="note-entry" data-note-key="${noteKey}">
                        <div class="note-entry-header">
                            Cycle ${cycleNum}, Week ${weekNum}, ${dayTitleDisplay}
                            <button class="note-delete-btn" title="Delete note" data-note-key="${noteKey}">
                                <i data-feather="trash-2"></i>
                            </button>
                        </div>
                        <div class="note-content">${ window.marked ? marked.parse(noteText) : noteText.replace(/\n/g, '<br>') }</div>
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
    // Render Feather icons for delete buttons
    if (window.feather) {
        window.feather.replace();
    }
    // Attach search input handler
    const searchInput = mainContentEl.querySelector('#notesSearch');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            renderDailyNotesSummaryPage(mainContentEl, e.target.value);
        });
    }

    // Attach delete handlers
    const deleteButtons = mainContentEl.querySelectorAll('.note-delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', event => {
            event.stopPropagation();
            const key = btn.dataset.noteKey;
            if (confirm('Are you sure you want to delete this note?')) {
                const newNotes = { ...appState.dailyNotes };
                delete newNotes[key];
                updateAppState({ dailyNotes: newNotes });
                renderDailyNotesSummaryPage(mainContentEl);
            }
        });
    });
}