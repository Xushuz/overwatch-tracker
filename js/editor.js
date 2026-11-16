// editor.js — the Program Editor modal: edit ALL training content in one place.
// Two tabs: "Visual" (native drag & drop, no libraries) and "JSON" (raw power).
// The edited copy is a deep clone; nothing touches live state until Save.

import { state, persist, nextTaskId } from './state.js';
import { el, openModal, closeModal } from './ui.js';

let draft = null; // deep clone of state.program being edited

function cloneProgram() { return JSON.parse(JSON.stringify(state.program)); }

export function openEditor(onSaved) {
  draft = cloneProgram();
  const status = el('span', { class: 'editor-status' });

  const visualPane = el('div', { class: 'editor-visual' });
  const jsonArea = el('textarea', { class: 'editor-json', spellcheck: 'false', rows: 24 });
  const jsonPane = el('div', { class: 'editor-json-pane' }, [jsonArea]);

  refreshAll = () => {
    visualPane.textContent = '';
    draft.weeks.forEach((week, wi) => visualPane.appendChild(weekBlock(week, wi)));
    visualPane.appendChild(el('button', {
      class: 'btn btn-small', text: '+ Add week',
      onclick: () => { draft.weeks.push({ title: `Week ${draft.weeks.length + 1}`, focus: '', days: [{ title: 'Day 1', tasks: [] }] }); refreshAll(); },
    }));
  };

  function switchTab(showJson) {
    visualPane.hidden = showJson;
    jsonPane.hidden = !showJson;
    tabVisualBtn.classList.toggle('active', !showJson);
    tabJsonBtn.classList.toggle('active', showJson);
    if (showJson) jsonArea.value = JSON.stringify(draft, null, 2);
    else {
      try {
        draft = normalize(JSON.parse(jsonArea.value));
        status.textContent = '';
        status.className = 'editor-status';
      } catch (e) {
        // keep draft as-is if JSON invalid; error already shown on Apply attempt
      }
      refreshAll();
    }
  }

  const tabVisualBtn = el('button', { class: 'tab active', text: 'Visual', onclick: () => switchTab(false) });
  const tabJsonBtn = el('button', { class: 'tab', text: 'JSON', onclick: () => switchTab(true) });

  const applyJson = el('button', {
    class: 'btn btn-small', text: 'Apply JSON to visual editor',
    onclick: () => {
      try {
        draft = normalize(JSON.parse(jsonArea.value));
        status.textContent = 'JSON applied ✓';
        status.className = 'editor-status ok';
        switchTab(false);
      } catch (e) {
        status.textContent = 'Invalid JSON: ' + e.message;
        status.className = 'editor-status err';
      }
    },
  });
  jsonPane.appendChild(el('div', { class: 'editor-json-actions' }, [applyJson]));

  const saveBtn = el('button', {
    class: 'btn btn-primary', text: 'Save program',
    onclick: () => {
      state.program = normalize(draft);
      // clamp current position to new program bounds
      state.week = Math.min(state.week, state.program.weeks.length) || 1;
      state.day = Math.min(state.day, (state.program.weeks[state.week - 1] || { days: [1] }).days.length) || 1;
      persist();
      closeModal();
      onSaved();
    },
  });
  const discardBtn = el('button', { class: 'btn', text: 'Discard changes', onclick: closeModal });

  const body = el('div', {}, [
    el('div', { class: 'editor-tabs' }, [tabVisualBtn, tabJsonBtn, status]),
    visualPane,
    jsonPane,
  ]);
  openModal('Edit Training Program', body, [discardBtn, saveBtn]);
  jsonPane.hidden = true;
  refreshAll();
}

// ---- Validation / normalization ---------------------------------------------

function normalize(p) {
  if (!p || !Array.isArray(p.weeks)) throw new Error('Program must be an object with a "weeks" array.');
  const seen = new Set();
  p.weeks = p.weeks.map(w => ({
    title: String(w.title || 'Untitled week'),
    focus: String(w.focus || ''),
    days: Array.isArray(w.days) && w.days.length ? w.days : [{ title: 'Day 1', tasks: [] }],
  })).map(w => ({ ...w, days: w.days.map(d => ({
    title: String(d.title || 'Day'),
    tasks: Array.isArray(d.tasks) ? d.tasks : [],
  })) }));
  for (const w of p.weeks) for (const d of w.days) for (const t of d.tasks) {
    t.text = String(t.text || '').trim();
    if (!t.id || seen.has(t.id)) t.id = nextTaskIdFrom(p, seen);
    seen.add(t.id);
  }
  if (!Array.isArray(p.resources)) p.resources = [];
  p.version = (p.version || 0) + 1;
  return p;
}

function nextTaskIdFrom(p, seen) {
  let n = 1;
  while (seen.has(`custom${n}`) || collectIds(p).has(`custom${n}`)) n++;
  return `custom${n}`;
}

function collectIds(p) {
  const s = new Set();
  for (const w of p.weeks) for (const d of w.days) for (const t of d.tasks) s.add(t.id);
  return s;
}

// ---- Visual editor blocks -----------------------------------------------------

function textInput(value, onChange, attrs = {}) {
  const input = el('input', { value, ...attrs, oninput: e => onChange(e.target.value) });
  return input;
}

function moveInArray(arr, from, to) {
  if (to < 0 || to >= arr.length) return;
  arr.splice(to, 0, arr.splice(from, 1)[0]);
}

// Drag state: what's being dragged and where it started.
let dragInfo = null; // {type:'task'|'day'|'week', wi, di, ti}

function draggable(node, info, overHandler, dropHandler) {
  node.draggable = true;
  node.addEventListener('dragstart', e => {
    dragInfo = info;
    e.dataTransfer.effectAllowed = 'move';
    node.classList.add('dragging');
  });
  node.addEventListener('dragend', () => { node.classList.remove('dragging'); dragInfo = null; });
  node.addEventListener('dragover', e => { if (dragInfo && dragInfo.type === info.type) { e.preventDefault(); overHandler(e); } });
  node.addEventListener('drop', e => {
    if (dragInfo && dragInfo.type === info.type) { e.preventDefault(); e.stopPropagation(); dropHandler(); refreshAll(); }
  });
  return node;
}

let refreshAll = () => {}; // set by openEditor via closure below

function weekBlock(week, wi) {
  const card = el('div', { class: 'ed-week card' });

  const head = el('div', { class: 'ed-row' }, [
    el('span', { class: 'ed-handle', title: 'Drag to reorder weeks', text: '⠿' }),
    el('strong', { text: `Week ${wi + 1}: ` }),
    textInput(week.title, v => week.title = v, { class: 'ed-title-input' }),
    el('button', { class: 'icon-btn danger', text: '✕', title: 'Delete week', onclick: () => { if (confirm(`Delete week ${wi + 1}?`)) { draft.weeks.splice(wi, 1); refreshAll(); } } }),
  ]);
  card.appendChild(head);
  card.appendChild(el('div', { class: 'ed-row' }, [
    el('span', { text: 'Focus: ' }),
    textInput(week.focus, v => week.focus = v, { class: 'ed-focus-input', placeholder: 'Weekly focus…' }),
  ]));

  const daysWrap = el('div', { class: 'ed-days' });
  week.days.forEach((day, di) => daysWrap.appendChild(dayBlock(day, wi, di)));
  daysWrap.appendChild(el('button', {
    class: 'btn btn-small', text: '+ Add day',
    onclick: () => { week.days.push({ title: `Day ${week.days.length + 1}`, tasks: [] }); refreshAll(); },
  }));
  card.appendChild(daysWrap);

  return draggable(card, { type: 'week', wi },
    () => card.classList.add('drop-above'),
    () => { card.classList.remove('drop-above'); moveInArray(draft.weeks, dragInfo.wi, wi); });
}

function dayBlock(day, wi, di) {
  const box = el('div', { class: 'ed-day' });
  const week = draft.weeks[wi];

  box.appendChild(el('div', { class: 'ed-row' }, [
    el('span', { class: 'ed-handle', title: 'Drag to reorder days', text: '⠿' }),
    el('span', { class: 'ed-day-label', text: `D${di + 1}` }),
    textInput(day.title, v => day.title = v, { class: 'ed-title-input ed-day-title' }),
    el('button', { class: 'icon-btn', text: '↑', title: 'Move up', onclick: () => { moveInArray(week.days, di, di - 1); refreshAll(); } }),
    el('button', { class: 'icon-btn', text: '↓', title: 'Move down', onclick: () => { moveInArray(week.days, di, di + 1); refreshAll(); } }),
    el('button', { class: 'icon-btn danger', text: '✕', title: 'Delete day', onclick: () => { week.days.splice(di, 1); if (!week.days.length) week.days.push({ title: 'Day 1', tasks: [] }); refreshAll(); } }),
  ]));

  const taskList = el('ul', { class: 'ed-tasks' });
  day.tasks.forEach((task, ti) => taskList.appendChild(taskRow(task, wi, di, ti)));
  taskList.appendChild(el('li', {}, el('button', {
    class: 'btn btn-small', text: '+ Add task',
    onclick: () => { day.tasks.push({ id: nextTaskId(), text: '' }); refreshAll(); },
  })));
  box.appendChild(taskList);

  return draggable(box, { type: 'day', wi, di },
    () => box.classList.add('drop-above'),
    () => {
      box.classList.remove('drop-above');
      const srcWeek = draft.weeks[dragInfo.wi];
      if (srcWeek !== week) {                       // moving a day across weeks
        const [moved] = srcWeek.days.splice(dragInfo.di, 1);
        week.days.splice(di, 0, moved);
      } else {
        moveInArray(week.days, dragInfo.di, di);
      }
    });
}


function taskRow(task, wi, di, ti) {
  const day = draft.weeks[wi].days[di];
  const text = textInput(task.text, v => task.text = v, { class: 'ed-task-input', placeholder: 'Task description…' });
  const note = textInput(task.note || '', v => { if (v) task.note = v; else delete task.note; }, { class: 'ed-note-input', placeholder: 'note (optional)' });
  const row = el('li', { class: 'ed-task' }, [
    el('span', { class: 'ed-handle', title: 'Drag to reorder', text: '⠿' }),
    text, note,
    el('button', { class: 'icon-btn danger', text: '✕', title: 'Delete task', onclick: () => { day.tasks.splice(ti, 1); refreshAll(); } }),
  ]);
  return draggable(row, { type: 'task', wi, di, ti },
    () => row.classList.add('drop-above'),
    () => {
      row.classList.remove('drop-above');
      const srcDay = draft.weeks[dragInfo.wi].days[dragInfo.di];
      const [moved] = srcDay.tasks.splice(dragInfo.ti, 1);
      day.tasks.splice(ti, 0, moved);
    });
}

