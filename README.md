# Overwatch Pro Path Tracker

A web-based application designed to help Overwatch players follow a structured 6-week training program, inspired by pro guides, to improve their game sense, positioning, decision-making, and team coordination. This tool allows users to track daily tasks, manage weekly focuses, take daily notes, and monitor their in-game rank progression.

**Live Demo / Access the App:** [https://xushuz.github.io/overwatch-tracker/](https://xushuz.github.io/overwatch-tracker/)

## Features

*   **Structured 6-Week Program:** Follows a detailed day-by-day training plan.
*   **Daily Task Tracking:** Check off completed tasks for each day of the program.
*   **Persistent Daily Notes:** A dedicated area to jot down reflections, VOD review takeaways, or goals for the current training day, with auto-saving.
*   **Daily Notes Summary:** Review all your daily notes in a chronological overview.
*   **Program Overview:** See all weeks at a glance, check progress, and jump to any day.
*   **Weekly Rank Tracking:** Log your Overwatch rank (Tier, Division, and optional SR) weekly and visualize your progression on a chart.
*   **Resource Hub:** Quick links to helpful Overwatch guides, communities, and tools.
*   **Light/Dark Theme:** Choose your preferred viewing mode.
*   **Cycle Management:** Restart the 6-week program for continuous improvement, keeping track of progress per cycle.
*   **Client-Side Storage:** All your data is saved locally in your browser's `localStorage`. No backend or user accounts required.
*   **Responsive Design:** Usable across desktop, tablet, and mobile devices.

## How It Works

This application is built entirely with HTML, CSS, and vanilla JavaScript. It uses the browser's `localStorage` to save all user data, meaning your information stays private to your browser and device.

## Getting Started (For Users)

1.  Simply visit the live demo link above.
2.  The app will guide you through the 6-week program starting from Week 1, Day 1.
3.  Navigate using the bottom navigation bar and on-page controls.
4.  Your progress and notes will be saved automatically in your browser.

## Development (For Contributors/Self-Hosting)

This is a simple static web application.

1.  Clone the repository:
    ```bash
    git clone https://github.com/Xushuz/overwatch-tracker.git
    ```
2.  Open `index.html` in your web browser.

---
This project was inspired by comprehensive Overwatch training guides aimed at helping players reach higher tiers of play.