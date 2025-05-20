# Overwatch Pro Path Tracker

A web-based application designed to help Overwatch players follow a structured 6-week training program, inspired by pro guides, to improve their game sense, positioning, decision-making, and team coordination. This tool allows users to track daily tasks, manage weekly focuses, take daily notes with auto-saving, and monitor their in-game rank progression with visual charts.

**Live Demo / Access the App:** [https://xushuz.github.io/overwatch-tracker/](https://xushuz.github.io/overwatch-tracker/)

## Features

*   **Structured 6-Week Program:** Follows a detailed day-by-day training plan.
*   **Daily Task Tracking:** Check off completed tasks for each day.
*   **Current Week Progress Bar:** Visual feedback on your task completion for the current week directly on the dashboard.
*   **Persistent Daily Notes:** A dedicated, always-visible area on the dashboard to jot down reflections, VOD review takeaways, or goals for the current training day, with auto-saving.
*   **Daily Notes Summary Page:** Review all your daily notes in a chronological, organized overview.
*   **Program Overview with Modal Details:** See all weeks at a glance with progress percentages. Click to view daily tasks for any week in a clean modal pop-up.
*   **Enhanced Rank Tracking:**
    *   **Initial & End-of-Week Prompts:** Get reminded to log your rank at the start of a cycle and at the end of each program week.
    *   **Daily Rank Updates:** Optionally update your current rank directly from the dashboard.
    *   **Intuitive Division Selection:** Use buttons instead of dropdowns for quicker rank division input.
    *   **Rank History Page:** A dedicated page to view all your logged rank updates across cycles, sorted chronologically.
    *   **Progression Charts:** Visualize your rank trend on the dashboard (current cycle) and on the Rank History page (all time).
*   **Resource Hub:** Quick links to helpful Overwatch guides, communities, and tools.
*   **Multiple Themes:** Choose between Light, Dark, and Pink themes.
*   **Cycle Management:** Restart the 6-week program for continuous improvement, with data tracked per cycle.
*   **Client-Side Storage:** All your data is saved locally in your browser's `localStorage`. No backend or user accounts required.
*   **Responsive Design:** Optimized for use across desktop, tablet, and mobile devices.

## How It Works

This application is built with HTML, CSS, and vanilla JavaScript, organized into ES6 modules. It uses the browser's `localStorage` to save all user data, meaning your information stays private to your browser and device.

## Project Structure

The project is organized with modular CSS and JavaScript for better maintainability:

*   `index.html`: The main application page.
*   `styles/`: Contains modular CSS files.
    *   `main.css`: Imports all other stylesheets.
    *   `base.css`, `header-nav.css`, `dashboard.css`, etc.
*   `scripts/`: Contains modular JavaScript files.
    *   `script.js`: Main orchestrator, initializes the app.
    *   `app-state.js`, `program-data.js`, `ui-theme.js`, and various `ui-render-*.js` modules.

## Getting Started (For Users)

1.  Simply visit the live demo link above.
2.  The app will guide you through the 6-week program starting from Week 1, Day 1. You'll be prompted to log your initial rank.
3.  Navigate using the bottom navigation bar and on-page controls.
4.  Your progress, notes, and rank updates will be saved automatically in your browser.

## Development (For Contributors/Self-Hosting)

This is a static web application that uses ES6 modules.

1.  Clone the repository:
    ```bash
    git clone https://github.com/Xushuz/overwatch-tracker 
    ```
2.  Navigate into the project directory.
3.  **Important:** Due to the use of ES6 modules, you need to serve `index.html` via a local web server. Opening it directly as a `file:///...` URL will likely cause module loading errors.
    *   **Using Node.js & `live-server` (recommended):**
        ```bash
        npm install -g live-server 
        # (if not already installed, may need sudo on Linux/macOS)
        live-server
        ```
        This will typically open the app at `http://127.0.0.1:8080`.
    *   **Using Python's built-in server:**
        ```bash
        # For Python 3.x
        python -m http.server
        # For Python 2.x
        python -m SimpleHTTPServer
        ```
        Then open `http://localhost:8000` in your browser.
    *   **Using VS Code's "Live Server" extension.**

---
This project was inspired by comprehensive Overwatch training guides aimed at helping players reach higher tiers of play by providing a structured way to track progress and maintain good habits.