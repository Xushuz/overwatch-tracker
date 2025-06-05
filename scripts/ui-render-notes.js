// ui-render-notes.js
import { appState, updateAppState } from './app-state.js';
import { getProgramData } from './program-data.js'; // To get day titles

/**
 * Render the Daily Notes summary view with optional search filter.
 * @param {HTMLElement} mainContentEl
 * @param {string} filterTerm
 */
export function renderDailyNotesSummaryPage(mainContentEl, filterTerm = '') {
  const searchTerm = filterTerm.trim().toLowerCase();
  // Sort note keys: cycle, week, day
  const keys = Object.keys(appState.dailyNotes).sort((a, b) => {
    const [ca, wa, da] = a.match(/c(\d+)w(\d+)d(\d+)/).slice(1).map(Number);
    const [cb, wb, db] = b.match(/c(\d+)w(\d+)d(\d+)/).slice(1).map(Number);
    return ca - cb || wa - wb || da - db;
  });
  // Apply search filter
  const filtered = searchTerm
    ? keys.filter(k => {
        const txt = (appState.dailyNotes[k] || '').toLowerCase();
        return txt.includes(searchTerm) || k.toLowerCase().includes(searchTerm);
      })
    : keys;
  // Build HTML
  let html = `<section class="daily-notes-summary-page content-card">`;
  html += `<h3>All Daily Notes</h3>`;
  html += `<input id="notesSearch" class="notes-search-input" type="text" placeholder="Search notes..." value="${filterTerm}" />`;
  if (filtered.length === 0) {
    html += `<p>${keys.length === 0 ? 'No daily notes have been saved yet.' : 'No notes match your search.'}</p>`;
  } else {
    filtered.forEach(key => {
      const noteText = appState.dailyNotes[key] || '';
      const [, cycle, week, day] = key.match(/c(\d+)w(\d+)d(\d+)/);
      const programData = getProgramData();
      const title = programData[week]?.days?.[day]?.title || `Day ${day}`;
      const content = window.marked ? marked.parse(noteText) : noteText.replace(/\n/g, '<br>');
      html += `<div class="note-entry" data-note-key="${key}">`;
      html += `<div class="note-entry-header">Cycle ${cycle}, Week ${week}, ${title}`;
      html += `<button class="note-delete-btn" data-note-key="${key}" title="Delete note"><i data-feather="trash-2"></i></button>`;
      html += `</div>`;
      html += `<div class="note-content">${content}</div>`;
      html += `</div>`;
    });
  }
  html += `</section>`;
  mainContentEl.innerHTML = html;
  // Render icons and bind events
  if (window.feather) feather.replace();
  const searchEl = mainContentEl.querySelector('#notesSearch');
  if (searchEl) searchEl.addEventListener('input', e => renderDailyNotesSummaryPage(mainContentEl, e.target.value));
  mainContentEl.querySelectorAll('.note-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const key = btn.dataset.noteKey;
      if (confirm('Delete this note?')) {
        const newNotes = { ...appState.dailyNotes };
        delete newNotes[key];
        updateAppState({ dailyNotes: newNotes });
        renderDailyNotesSummaryPage(mainContentEl, filterTerm);
      }
    });
  });
}