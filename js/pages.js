// pages.js — renders the six app pages. Each render* returns a DOM node.

import {
  state, dayKey, currentProgramDay, isTaskDone, toggleTask, weekStats,
  getNote, setNote, TIERS, ROLES, rankValue, addRank, removeRank, latestRank,
} from './state.js';
import { el, openModal, closeModal } from './ui.js';

const ROLE_COLORS = { Tank: '#e0a63f', Damage: '#e05c5c', Support: '#4fa3e0' };

function progressBar(done, total) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return el('div', { class: 'progress-track', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, [
    el('div', { class: 'progress-fill', style: `width:${pct}%` }),
    el('span', { class: 'progress-label', text: total ? `${done}/${total} (${pct}%)` : 'No tasks yet' }),
  ]);
}

// ---- Dashboard --------------------------------------------------------------

export function renderDashboard(onChanged) {
  const day = currentProgramDay();
  const wrap = el('section', { class: 'page dashboard' });

  // Week/day picker
  const weekSel = el('select', { id: 'weekSelect' },
    state.program.weeks.map((w, i) => el('option', { value: i + 1, selected: state.week === i + 1 ? '' : null }, w.title)));
  const maxDay = day ? state.program.weeks[state.week - 1].days.length : 1;
  const daySel = el('select', { id: 'daySelect' },
    Array.from({ length: maxDay }, (_, i) => el('option', { value: i + 1, selected: state.day === i + 1 ? '' : null }, `Day ${i + 1}`)));
  weekSel.onchange = () => { state.week = +weekSel.value; state.day = 1; onChanged(); };
  daySel.onchange = () => { state.day = +daySel.value; onChanged(); };

  const week = state.program.weeks[state.week - 1];
  wrap.appendChild(el('div', { class: 'card' }, [
    el('div', { class: 'picker-row' }, [
      el('label', {}, ['Week ', weekSel]),
      el('label', {}, ['Day ', daySel]),
    ]),
    week && el('h2', { text: `Cycle ${state.cycle} · ${week.title}` }),
    week && el('p', { class: 'focus-text', text: week.focus }),
  ]));

  // Task list
  const taskList = el('ul', { class: 'task-list' });
  if (day && day.tasks.length) {
    for (const t of day.tasks) {
      const done = isTaskDone(t.id);
      taskList.appendChild(el('li', { class: done ? 'task done' : 'task' }, [
        el('label', {}, [
          el('input', { type: 'checkbox', checked: done ? '' : null, onchange: () => { toggleTask(t.id); onChanged(); } }),
          el('span', { class: 'task-text', text: t.text }),
        ]),
        t.note ? el('div', { class: 'task-note', text: t.note }) : null,
      ]));
    }
  } else {
    taskList.appendChild(el('li', { class: 'empty', text: 'No tasks for this day. Add some in the Program page.' }));
  }
  const stats = day ? { total: day.tasks.length, done: day.tasks.filter(t => isTaskDone(t.id)).length } : { total: 0, done: 0 };
  wrap.appendChild(el('div', { class: 'card' }, [
    el('h3', { text: day ? `Day ${state.day}: ${day.title}` : `Day ${state.day}` }),
    progressBar(stats.done, stats.total),
    taskList,
  ]));

  // Daily note (autosaves on input)
  const noteArea = el('textarea', {
    class: 'note-area', rows: 4, placeholder: 'Daily note for ' + dayKey() + '… autosaves.',
    oninput: e => setNote(e.target.value),
  });
  noteArea.value = getNote();
  wrap.appendChild(el('div', { class: 'card' }, [el('h3', { text: 'Daily Note' }), noteArea]));

  // Quick rank update
  const quickRow = el('div', { class: 'quick-rank-row' });
  for (const role of ROLES) {
    const cur = latestRank(role);
    quickRow.appendChild(el('div', { class: 'quick-rank' }, [
      el('span', { class: 'role-badge', style: `background:${ROLE_COLORS[role]}`, text: role }),
      el('span', { text: cur ? `${cur.tier} ${cur.division}` : 'unranked' }),
      el('button', { class: 'btn btn-small', onclick: () => openRankForm(role, onChanged), text: 'Update' }),
    ]));
  }
  wrap.appendChild(el('div', { class: 'card' }, [el('h3', { text: 'Quick Rank Update' }), quickRow]));
  return wrap;
}

function openRankForm(role, onChanged) {
  const tierSel = el('select', {}, TIERS.map(t => el('option', { value: t, text: t })));
  const divSel = el('select', {}, [5, 4, 3, 2, 1].map(d => el('option', { value: d, text: String(d) })));
  const form = el('form', { class: 'rank-form' }, [
    el('label', {}, ['Tier ', tierSel]),
    el('label', {}, ['Division ', divSel]),
  ]);
  openModal(`Log ${role} rank`, form, [
    el('button', {
      class: 'btn btn-primary', text: 'Save', onclick: () => {
        addRank(role, tierSel.value, +divSel.value);
        closeModal();
        onChanged();
      },
    }),
  ]);
}

// ---- Program overview --------------------------------------------------------

export function renderProgram(onChanged, onOpenEditor) {
  const wrap = el('section', { class: 'page program' });
  wrap.appendChild(el('div', { class: 'page-head' }, [
    el('h2', { text: 'Training Program' }),
    el('button', { class: 'btn btn-primary', onclick: onOpenEditor, text: '✎ Edit program' }),
  ]));
  state.program.weeks.forEach((w, wi) => {
    const s = weekStats(wi);
    const daysGrid = el('div', { class: 'week-days' });
    w.days.forEach((d, di) => {
      const dn = d.tasks.filter(t => isTaskDone(t.id)).length;
      daysGrid.appendChild(el('button', {
        class: 'day-chip' + (dn === d.tasks.length && d.tasks.length ? ' complete' : ''),
        title: d.tasks.map(t => (isTaskDone(t.id) ? '☑ ' : '☐ ') + t.text).join('\n'),
        onclick: () => { state.week = wi + 1; state.day = di + 1; onChanged('dashboard'); },
      }, [
        el('span', { class: 'day-num', text: `D${di + 1}` }),
        el('span', { class: 'day-count', text: `${dn}/${d.tasks.length}` }),
      ]));
    });
    wrap.appendChild(el('div', { class: 'card week-card' }, [
      el('div', { class: 'week-head' }, [
        el('h3', { text: `Week ${wi + 1}: ${w.title}` }),
        el('span', { class: 'week-pct', text: s.total ? `${Math.round(s.done / s.total * 100)}%` : '—' }),
      ]),
      el('p', { class: 'focus-text', text: w.focus }),
      progressBar(s.done, s.total),
      daysGrid,
    ]));
  });
  if (!state.program.weeks.length) {
    wrap.appendChild(el('p', { class: 'empty', text: 'Program is empty. Use the editor to add weeks.' }));
  }
  return wrap;
}

// ---- Notes -------------------------------------------------------------------

export function renderNotes() {
  const wrap = el('section', { class: 'page notes' });
  const search = el('input', { type: 'search', placeholder: 'Search notes…', class: 'note-search' });
  const list = el('div', { class: 'notes-list' });

  function draw() {
    list.textContent = '';
    const q = search.value.toLowerCase();
    const keys = Object.keys(state.notes)
      .filter(k => !q || k.includes(q) || state.notes[k].toLowerCase().includes(q))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    if (!keys.length) { list.appendChild(el('p', { class: 'empty', text: 'No notes found.' })); return; }
    for (const k of keys) {
      list.appendChild(el('div', { class: 'card note-item' }, [
        el('div', { class: 'note-key', text: k.replace(/^c(\d+)w(\d+)d(\d+)$/, 'Cycle $1 · Week $2 · Day $3') }),
        el('div', { class: 'note-body', text: state.notes[k] }),
      ]));
    }
  }
  search.oninput = draw;
  wrap.appendChild(el('div', { class: 'card' }, [el('h2', { text: 'Daily Notes' }), search]));
  wrap.appendChild(list);
  draw();
  return wrap;
}

// ---- Rank history (with tiny inline SVG chart) --------------------------------

export function renderRanks(onChanged) {
  const wrap = el('section', { class: 'page ranks' });
  wrap.appendChild(el('div', { class: 'page-head' }, [
    el('h2', { text: 'Rank History' }),
    el('button', { class: 'btn btn-primary', text: '+ Log rank', onclick: () => openRankForm('Tank', onChanged) }),
  ]));

  if (state.ranks.length) {
    wrap.appendChild(el('div', { class: 'card' }, [chartSvg()]));
  }

  const table = el('table', { class: 'rank-table' });
  table.appendChild(el('thead', {}, el('tr', {}, ['Date', 'Role', 'Rank', ''].map(h => el('th', { text: h })))));
  const tbody = el('tbody');
  [...state.ranks].map(r => ({ r, i: state.ranks.indexOf(r) })).reverse().forEach(({ r, i }) => {
    tbody.appendChild(el('tr', {}, [
      el('td', { text: r.date }),
      el('td', {}, el('span', { class: 'role-badge', style: `background:${ROLE_COLORS[r.role] || '#888'}`, text: r.role })),
      el('td', { text: `${r.tier} ${r.division}` }),
      el('td', {}, el('button', { class: 'icon-btn danger', 'aria-label': 'Delete', text: '×', onclick: () => { removeRank(i); onChanged(); } })),
    ]));
  });
  table.appendChild(tbody);
  wrap.appendChild(el('div', { class: 'card' }, [table]));
  if (!state.ranks.length) wrap.appendChild(el('p', { class: 'empty', text: 'No ranks logged yet.' }));
  return wrap;
}

function chartSvg() {
  const W = 640, H = 240, P = 34;
  const all = state.ranks;
  const xs = all.map(r => new Date(r.date).getTime());
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const span = Math.max(1, xMax - xMin);
  const X = t => P + ((t - xMin) / span) * (W - 2 * P);
  const Y = v => H - P - ((v - 0) / (TIERS.length * 5)) * (H - 2 * P);

  const parts = [];
  // gridlines + tier labels
  TIERS.forEach((tier, i) => {
    const y = Y(i * 5 + 3);
    parts.push(el0('line', { x1: P, y1: y, x2: W - P, y2: y, class: 'grid' }));
    parts.push(el0('text', { x: 4, y: y + 3, class: 'axis' }, tier));
  });
  // one line per role
  for (const role of ROLES) {
    const pts = all.filter(r => r.role === role)
      .map(r => `${X(new Date(r.date).getTime()).toFixed(1)},${Y(rankValue(r)).toFixed(1)}`);
    if (!pts.length) continue;
    parts.push(el0('polyline', { points: pts.join(' '), fill: 'none', stroke: ROLE_COLORS[role], 'stroke-width': 2 }));
  }
  // legend
  let lx = P;
  for (const role of ROLES) {
    if (!all.some(r => r.role === role)) continue;
    parts.push(el0('rect', { x: lx, y: 6, width: 10, height: 10, fill: ROLE_COLORS[role] }));
    parts.push(el0('text', { x: lx + 14, y: 15, class: 'axis' }, role));
    lx += 90;
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'rank-chart');
  for (const p of parts) svg.appendChild(p);
  return svg;
}

function el0(tag, attrs, text) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
}

// ---- Resources -----------------------------------------------------------------

export function renderResources() {
  const wrap = el('section', { class: 'page resources' });
  wrap.appendChild(el('h2', { text: 'Resources' }));
  const list = el('ul', { class: 'resource-list' });
  const items = state.program.resources.length ? state.program.resources
    : [{ name: 'No resources yet', url: '#', note: 'Add them under "resources" in program.json or the editor JSON tab.' }];
  for (const r of items) {
    list.appendChild(el('li', { class: 'card resource' }, [
      el('a', { href: r.url, target: '_blank', rel: 'noopener', text: r.name }),
      r.note ? el('div', { class: 'task-note', text: r.note }) : null,
    ]));
  }
  wrap.appendChild(list);
  return wrap;
}
