
# Overwatch Pro Path Tracker

A modern, themeable web app to help Overwatch players follow a structured 6-week training program, track daily tasks, take notes, and monitor role-based rank progression with beautiful charts and history. All data is private and stored locally in your browser.

**Live Demo:** [https://xushuz.github.io/overwatch-tracker/](https://xushuz.github.io/overwatch-tracker/)

---

## Features

- **Structured 6-Week Program:** Day-by-day training plan with weekly focuses.
- **Daily Task Tracking:** Check off tasks, see animated progress bars, and view overall completion.
- **Persistent Daily Notes:** Auto-saved notes for each day, plus a searchable summary page.
- **Program Overview:** At-a-glance progress for all weeks, with detailed modal breakdowns.
- **Role-Based Rank Tracking:**
  - Log your rank for DPS, Tank, or Support—each tracked separately.
  - Multi-line rank progression charts (one line per role) with clear legends and theme-aligned colors.
  - Modern, paginated rank history with role badges and export/import support.
- **Quick Rank Update:** Instantly log your current rank for any role from the dashboard.
- **Multiple Themes:** Choose from Light, Dark, Pink, Cyberpunk, and more.
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile.
- **Data Export/Import:** Backup or transfer your progress with a single click.
- **No Accounts, No Cloud:** 100% client-side, all data stays in your browser.

---

## How It Works

- Built with HTML, CSS, and vanilla JavaScript (ES6 modules).
- All data is stored in your browser’s `localStorage`—no accounts, no tracking, no backend.
---

## Project Structure

- `index.html` — Main app page.
- `styles/` — Modular CSS (themes, layout, components).
- `scripts/` — Modular JS (state, UI, charts, logic).
- `assets/` — App icons and images.

---

## Getting Started

1. **Just use the app:** Visit the [live demo](https://xushuz.github.io/overwatch-tracker/).
2. **Self-host locally:**  
   - Clone the repo:
     ```bash
     git clone https://github.com/Xushuz/overwatch-tracker
     cd overwatch-tracker
     ```
   - Serve with a local web server (required for ES6 modules):
     - **Python 3:**
       ```bash
       python -m http.server 8000
       ```
       Then open [http://localhost:8000](http://localhost:8000)
     - **Node.js (`live-server`):**
       ```bash
       npm install -g live-server
       live-server
       ```
     - **Or use VS Code’s “Live Server” extension.**

---

## Contributing

Pull requests and suggestions are welcome! Please open an issue for bugs or feature requests.

---

## Credits

Inspired by pro Overwatch training guides and the community.

---