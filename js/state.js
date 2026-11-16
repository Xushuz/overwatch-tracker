// state.js — the ONLY place that touches localStorage.
// One key, one shape: { program, cycle, done:{taskId:true}, notes:{"c2w1d3":str}, ranks:[...], theme }

const KEY = 'owtracker.v1';

export const STORAGE_KEY = KEY;

export const DEFAULT_PROGRAM = {
  version: 1,
  weeks: [
    { title: 'Fundamentals & Assessment', focus: 'Establish a baseline and master positioning and game sense.', days: [
      { title: 'Assessment', tasks: [
        { id: 'seed1', text: 'Warm-up — 15 min' },
        { id: 'seed2', text: 'Play 3 Competitive matches as a benchmark' },
        { id: 'seed3', text: 'Watch one replay of your worst death' } ] },
      { title: 'Core Concepts', tasks: [
        { id: 'seed4', text: 'Warm-up — 15 min' },
        { id: 'seed5', text: 'Study one educational video; note 3 actionable tips' } ] },
    ] },
  ],
  resources: [],
};

export const THEMES = ['light', 'dark', 'pink', 'cyberpunk'];

function today() { return new Date().toISOString().slice(0, 10); }

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn('State load failed, starting fresh.', e); }
  return null;
}

let saved = load();

export const state = {
  program: (saved && saved.program) || DEFAULT_PROGRAM,
  cycle: (saved && saved.cycle) || 1,
  week: 1,
  day: 1,
  done: (saved && saved.done) || {},          // taskId -> true (persists across cycles by design)
  notes: (saved && saved.notes) || {},        // "c{cycle}w{week}d{day}" -> text
  ranks: (saved && saved.ranks) || [],        // {role, tier, division, date}
  theme: (saved && THEMES.includes(saved.theme)) ? saved.theme : 'light',
};

export function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      program: state.program, cycle: state.cycle,
      done: state.done, notes: state.notes, ranks: state.ranks, theme: state.theme,
    }));
  } catch (e) { console.error('State save failed:', e); }
}

// ---- Program accessors ----------------------------------------------------

export function currentProgramDay() {
  const w = state.program.weeks[state.week - 1];
  return w && w.days[state.day - 1];
}

export function dayKey(cycle = state.cycle, week = state.week, day = state.day) {
  return `c${cycle}w${week}d${day}`;
}

export function isTaskDone(id) { return !!state.done[id]; }

export function toggleTask(id) {
  if (state.done[id]) delete state.done[id]; else state.done[id] = true;
  persist();
}

export function weekStats(weekIdx) {
  const w = state.program.weeks[weekIdx];
  if (!w) return { total: 0, done: 0 };
  let total = 0, done = 0;
  for (const d of w.days) for (const t of d.tasks) { total++; if (state.done[t.id]) done++; }
  return { total, done };
}

// Generate unique task ids for new tasks added via the editor.
export function nextTaskId() {
  const used = new Set();
  for (const w of state.program.weeks)
    for (const d of w.days)
      for (const t of d.tasks) used.add(t.id);
  let n = 1;
  while (used.has(`custom${n}`)) n++;
  return `custom${n}`;
}

// ---- Notes -----------------------------------------------------------------

export function getNote(key = dayKey()) { return state.notes[key] || ''; }

export function setNote(text, key = dayKey()) {
  if (text) state.notes[key] = text; else delete state.notes[key];
  persist();
}

// ---- Ranks -----------------------------------------------------------------

export const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Champion'];
export const ROLES = ['Tank', 'Damage', 'Support'];

export function rankValue(entry) {
  return TIERS.indexOf(entry.tier) * 5 + (6 - entry.division); // higher = better
}

export function addRank(role, tier, division) {
  state.ranks.push({ role, tier, division, date: today() });
  persist();
}

export function removeRank(index) {
  state.ranks.splice(index, 1);
  persist();
}

export function latestRank(role) {
  return [...state.ranks].reverse().find(r => r.role === role);
}

// ---- Import / export / reset -----------------------------------------------

export function exportData() {
  return JSON.stringify({ exportedAt: today(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }, null, 2);
}

export function importData(json) {
  const parsed = JSON.parse(json); // throws on invalid — caller handles
  if (!parsed || !Array.isArray(parsed.ranks) || typeof parsed.done !== 'object') {
    throw new Error('Not a valid backup file.');
  }
  localStorage.setItem(KEY, JSON.stringify(parsed));
  location.reload();
}

export function resetAll() {
  localStorage.removeItem(KEY);
  location.reload();
}
