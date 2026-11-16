// ui.js — tiny shared DOM helpers, theming, and modal plumbing.

import { state, THEMES, persist } from './state.js';

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function applyTheme() {
  document.body.classList.remove(...THEMES.map(t => `${t}-theme`));
  document.body.classList.add(`${state.theme}-theme`);
}

export function setTheme(name) {
  state.theme = name;
  persist();
  applyTheme();
}

// ---- Modal -----------------------------------------------------------------

let activeModal = null;

export function openModal(title, contentNode, footerButtons = []) {
  closeModal();
  const overlay = el('div', { class: 'modal-overlay', onclick: e => { if (e.target === overlay) closeModal(); } }, [
    el('div', { class: 'modal' }, [
      el('div', { class: 'modal-header' }, [
        el('h3', { text: title }),
        el('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: closeModal }, '×'),
      ]),
      el('div', { class: 'modal-body' }, contentNode),
      footerButtons.length ? el('div', { class: 'modal-footer' }, footerButtons) : null,
    ]),
  ]);
  document.body.appendChild(overlay);
  activeModal = overlay;
  return overlay;
}

export function closeModal() {
  if (activeModal) { activeModal.remove(); activeModal = null; }
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
