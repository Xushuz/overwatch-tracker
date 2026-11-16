# Overwatch Training Tracker

A zero-dependency, client-side web app for following a structured 6-week Overwatch training cycle. All data stays in your browser (`localStorage`) — no accounts, no backend, no build step.

## Features

- **One source of truth:** the entire training program (weeks, days, tasks, resources) lives in [`program.json`](program.json). Edit that file to change the program — nothing is hardcoded in JS.
- **Program Editor UI:** on the *Program* page, click **✎ Edit program** to modify every week/day/task in one place:
  - *Visual* tab — inline text editing, add/delete, native drag & drop reorder (no libraries).
  - *JSON* tab — raw JSON editing with validation ("Apply JSON" checks structure and dedupes task IDs).
  - Changes are staged in a draft; nothing touches your data until you press **Save program**.
- **Stable task IDs:** completions are keyed by task `id`, so reordering or renaming tasks never corrupts your history. Deleting a week/days keeps history too (it's just hidden until the ID returns).
- **Dashboard:** week/day picker, checkable tasks with progress bar, autosaving daily note, quick rank update.
- **Rank History:** per-role (Tank/Damage/Support) rank logging, a lightweight hand-rolled SVG multi-line chart (no Chart.js), and a deletable history table.
- **Notes:** searchable archive of all daily notes.
- **Themes:** light / dark / pink / cyberpunk via CSS custom properties.
- **Backups:** export/import full state as JSON; "Erase all data" for a clean start; "Reload default program" restores `program.json` without touching progress.

## Getting started

No install, no npm needed:

```bash
python3 -m http.server 8000   # any static server works
# open http://localhost:8000
```

(Opening `index.html` via `file://` also works, but then the initial seed falls back to a small built-in program because browsers block `fetch` of local files.)

## Modifying the training program

Two ways, pick either:

1. **In the app** — Program page → *Edit program* (visual or JSON tab). This changes only *your* browser's copy. Use Settings → *Export backup* if you want to keep it, or share the JSON with others.
2. **In the repo** — edit `program.json`. New visitors get it automatically; existing visitors can click Settings → *Reload default program*.

### Schema

```jsonc
{
  "version": 1,
  "weeks": [
    {
      "title": "Fundamentals & Assessment",
      "focus": "…",
      "days": [
        {
          "title": "Assessment",
          "tasks": [
            { "id": "w1d1t1", "text": "Task description", "note": "optional detail" }
          ]
        }
      ]
    }
  ],
  "resources": [ { "name": "…", "url": "…", "note": "…" } ]
}
```

Keep `id`s stable when you rename tasks (IDs are what your checkmarks attach to); give new tasks unique IDs. The editor enforces this automatically.

## Project layout

```
index.html      single page shell
css/style.css   one stylesheet (themes = CSS variables)
js/state.js     localStorage read/write + domain logic (the ONLY storage touchpoint)
js/ui.js        DOM helper, modal, theming
js/pages.js     dashboard / program / notes / ranks / resources views
js/editor.js    the Program Editor (visual + JSON tabs)
js/main.js      bootstrap, navigation, settings
program.json    the shipped training program (source of truth for content)
```

~750 lines total, vanilla ES modules, zero runtime dependencies.
