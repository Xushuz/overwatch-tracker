// main.js — app bootstrap: loads program.json, wires navigation, themes, settings.

import { state, persist, DEFAULT_PROGRAM, THEMES, STORAGE_KEY, exportData, importData, resetAll } from './state.js';
import { el, applyTheme, setTheme, openModal, closeModal } from './ui.js';
import { renderDashboard, renderProgram, renderNotes, renderRanks, renderResources } from './pages.js';
import { openEditor } from './editor.js';

const PAGES = {
  dashboard: { label: 'Dashboard', render: onChanged => renderDashboard(onChanged) },
  program:   { label: 'Program',   render: onChanged => renderProgram(onChanged, () => openEditor(() => render())) },
  notes:     { label: 'Notes',     render: () => renderNotes() },
  ranks:     { label: 'Rank History', render: onChanged => renderRanks(onChanged) },
  resources: { label: 'Resources', render: () => renderResources() },
  settings:  { label: 'Settings',  render: onChanged => renderSettings(onChanged) },
};

let currentPage = 'dashboard';
const main = document.getElementById('main');
const nav = document.getElementById('nav');

for (const [id, p] of Object.entries(PAGES)) {
  nav.appendChild(el('a', { href: `#${id}`, class: 'nav-link', 'data-page': id, text: p.label }));
}
nav.addEventListener('click', e => {
  const link = e.target.closest('.nav-link');
  if (!link) return;
  e.preventDefault();
  location.hash = link.dataset.page;
});
window.addEventListener('hashchange', () => {
  const p = location.hash.slice(1);
  if (PAGES[p]) currentPage = p;
  render();
});

function render() {
  for (const a of nav.children) a.classList.toggle('active', a.dataset.page === currentPage);
  main.textContent = '';
  main.appendChild(PAGES[currentPage].render(goTo));
}

function goTo(page) {
  if (page && PAGES[page]) currentPage = page;
  render();
}

// ---- Settings page -------------------------------------------------------------

function renderSettings(onChanged) {
  void onChanged;
  const wrap = el('section', { class: 'page settings' });
  wrap.appendChild(el('h2', { text: 'Settings' }));

  // Theme picker
  const themeRow = el('div', { class: 'theme-row' });
  for (const t of THEMES) {
    themeRow.appendChild(el('button', {
      class: 'btn btn-theme' + (state.theme === t ? ' active' : ''),
      'data-theme-preview': t,
      text: t,
      onclick: () => { setTheme(t); render(); },
    }));
  }
  wrap.appendChild(el('div', { class: 'card' }, [el('h3', { text: 'Theme' }), themeRow]));

  // Cycle management
  wrap.appendChild(el('div', { class: 'card' }, [
    el('h3', { text: `Current cycle: ${state.cycle}` }),
    el('div', {}, [
      el('button', {
        class: 'btn', text: 'Start next cycle', onclick: () => {
          if (confirm(`Finish Cycle ${state.cycle} and start Cycle ${state.cycle + 1}? Task history is kept; you'll begin at Week 1.`)) {
            state.cycle += 1; state.week = 1; state.day = 1; persist(); render();
          }
        },
      }),
    ]),
  ]));

  // Program source info
  wrap.appendChild(el('div', { class: 'card' }, [
    el('h3', { text: 'Training program' }),
    el('p', { text: `Program version ${state.program.version || 1}. Edit it any time from the Program page (Visual or JSON tabs).` }),
    el('div', {}, [
      el('button', { class: 'btn btn-primary', text: 'Open program editor', onclick: () => openEditor(render) }),
      el('button', { class: 'btn', text: 'Reload default program', onclick: reloadDefault }),
    ]),
  ]));

  // Data management
  const fileInput = el('input', { type: 'file', accept: '.json', style: 'display:none' });
  fileInput.onchange = () => {
    const f = fileInput.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { importData(reader.result); } catch (e) { alert('Import failed: ' + e.message); }
    };
    reader.readAsText(f);
  };
  wrap.appendChild(el('div', { class: 'card' }, [
    el('h3', { text: 'Data' }),
    el('p', { text: 'Everything lives in this browser only.' }),
    el('div', { class: 'btn-row' }, [
      el('button', { class: 'btn', text: 'Export backup', onclick: downloadBackup }),
      el('button', { class: 'btn', text: 'Import backup', onclick: () => fileInput.click() }),
      fileInput,
      el('button', { class: 'btn danger', text: 'Erase all data', onclick: () => { if (confirm('Delete ALL progress, notes, ranks and custom program?')) resetAll(); } }),
    ]),
  ]));
  return wrap;
}

function downloadBackup() {
  const blob = new Blob([exportData()], { type: 'application/json' });
  const a = el('a', { href: URL.createObjectURL(blob), download: `ow-tracker-backup-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function reloadDefault() {
  openModal('Reload default program?',
    el('p', { text: 'This replaces your current (possibly customized) program with the shipped program.json. Completion history for matching task IDs is kept.' }),
    [
      el('button', { class: 'btn', text: 'Cancel', onclick: closeModal }),
      el('button', {
        class: 'btn danger', text: 'Replace', onclick: async () => {
          closeModal();
          state.program = await fetchProgramJson();
          state.week = Math.min(state.week, state.program.weeks.length) || 1;
          state.day = 1;
          persist();
          render();
        },
      }),
    ]);
}

async function fetchProgramJson() {
  try {
    const res = await fetch('program.json');
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    console.warn('Could not load program.json, using embedded fallback.', e);
    return DEFAULT_PROGRAM;
  }
}

// ---- Boot ------------------------------------------------------------------------

(async function boot() {
  // If no saved state existed, seed with the shipped program.json.
  if (!localStorage.getItem(STORAGE_KEY)) {
    state.program = await fetchProgramJson();
    persist();
  }
  document.getElementById('currentDate').textContent =
    new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  applyTheme();
  const p = location.hash.slice(1);
  if (PAGES[p]) currentPage = p;
  render();
})();
