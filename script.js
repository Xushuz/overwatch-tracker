// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const body = document.body;
    const currentDateEl = document.getElementById('currentDate');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const newCycleBtn = document.getElementById('newCycleBtn');
    
    const mainContentEl = document.querySelector('.app-main');
    const navLinks = document.querySelectorAll('.app-nav .nav-link');

    let dailyNoteSaveTimeout = null;
    let rankChartInstance = null; // To store the Chart.js instance

    // --- Program Data (Ensure your full 6-week data is here) ---
    const programData = { /* ... PASTE YOUR FULL 6-WEEK programData HERE ... */ 
        1: { // Week 1
            title: "Positioning Fundamentals & Assessment",
            focus: "Establish a baseline of your play and master the fundamentals of DPS positioning (High Ground, Angles, Cover, Range).",
            days: {
                1: { 
                    title: "Day 1: Assessment",
                    tasks: [
                        { id: "w1d1t1", text: "Warm-up: Aim Trainer (10 mins)"}, 
                        { id: "w1d1t2", text: "Warm-up: Hero-specific Practice (5 mins)"},
                        { id: "w1d1t3", text: "Warm-up: Deathmatch or Aim Duel (5–10 mins)"},
                        { id: "w1d1t4", text: "Gameplay: 3–4 Competitive Matches (Benchmark)"},
                        { id: "w1d1t5", text: "Self-Review: Watch one replay (10 mins)" }
                    ]
                },
                2: { 
                    title: "Day 2: Cover & Spilo's Guide",
                    tasks: [
                        { id: "w1d2t1", text: "Warm-up Routine" },
                        { id: "w1d2t2", text: "Gameplay: Matches (Focus on Cover)" },
                        { id: "w1d2t3", text: "Learning: Watch 'DPS Positioning Guide (Spilo)'" }
                    ]
                },
                3: { 
                    title: "Day 3: High Ground & Off-Angles",
                    tasks: [
                        { id: "w1d3t1", text: "Warm-up Routine (Try different aim drill)" },
                        { id: "w1d3t2", text: "Gameplay: Matches (Focus High Ground/Off-Angles)" },
                        { id: "w1d3t3", text: "Quick Review: One Teamfight Death" }
                    ]
                },
                4: { 
                    title: "Day 4: Deep Self-Review (Positioning)",
                    tasks: [
                        { id: "w1d4t1", text: "Warm-up Routine" },
                        { id: "w1d4t2", text: "VOD Review: Full Replay (Positioning)" }
                    ]
                },
                5: { 
                    title: "Day 5: Apply Corrections",
                    tasks: [
                        { id: "w1d5t1", text: "Warm-up Routine" },
                        { id: "w1d5t2", text: "Gameplay: Matches (Focus on Corrections)" }
                    ]
                },
                6: { 
                    title: "Day 6: Lighter Day / Reinforce Concepts",
                    tasks: [
                        { id: "w1d6t1", text: "Warm-up Routine" },
                        { id: "w1d6t2", text: "Practice/Learning: Deathmatch or Casual Mode / Pro VODs" }
                    ]
                }
            }
        },
        2: { 
            title: "Game Sense, Awareness & Decision-Making",
            focus: "Improve understanding of ult economies, anticipating enemy plays, and making smart decisions mid-fight.",
            days: {
                1: { 
                    title: "Day 1: Ult Tracking Focus",
                    tasks: [
                        { id: "w2d1t1", text: "Warm-up Routine" },
                        { id: "w2d1t2", text: "Gameplay: Matches (Focus Ult Tracking)" }
                    ]
                },
                2: { 
                    title: "Day 2: Decision Making Post-Elims",
                    tasks: [
                        { id: "w2d2t1", text: "Warm-up Routine" },
                        { id: "w2d2t2", text: "Gameplay: Matches (Post-Elim Decisions)" }
                    ]
                },
                3: { 
                    title: "Day 3: Cooldown Tracking & Calls",
                    tasks: [
                        { id: "w2d3t1", text: "Warm-up Routine" },
                        { id: "w2d3t2", text: "Gameplay: Matches (Focus Cooldowns)" },
                        { id: "w2d3t3", text: "Quick Review: One Replay Death" }
                    ]
                },
                4: { 
                    title: "Day 4: Mid-Week VOD Review (Awareness)",
                    tasks: [
                        { id: "w2d4t1", text: "Warm-up Routine" },
                        { id: "w2d4t2", text: "VOD Review: Replay (Awareness Focus)" }
                    ]
                },
                5: { 
                    title: "Day 5: Implement Lessons - Broad Awareness",
                    tasks: [
                        { id: "w2d5t1", text: "Warm-up Routine" },
                        { id: "w2d5t2", text: "Gameplay: Matches (Broad Awareness)" }
                    ]
                },
                6: { 
                    title: "Day 6: Reinforce Knowledge / Self-Assessment",
                    tasks: [
                        { id: "w2d6t1", text: "Warm-up Routine" },
                        { id: "w2d6t2", text: "Learning: Educational Content / Quiz" },
                        { id: "w2d6t3", text: "Self-Assessment: Journal" } 
                    ]
                }
            }
        },
        3: { 
            title: "Communication and Team Coordination",
            focus: "Practice effective callouts, coordinating plays, and becoming a better team player.",
            days: {
                1: {
                    title: "Day 1: Pure Comms Focus (Ranked)",
                    tasks: [
                        { id: "w3d1t1", text: "Warm-up Routine" },
                        { id: "w3d1t2", text: "Gameplay: Ranked (Vocal Comms)" }
                    ]
                },
                2: {
                    title: "Day 2: Scrim/Organized Play (Structured Comms)",
                    tasks: [
                        { id: "w3d2t1", text: "Warm-up Routine" },
                        { id: "w3d2t2", text: "Gameplay: Scrim or FACEIT/PUGs" }
                    ]
                },
                3: {
                    title: "Day 3: Ultimate Coordination Focus",
                    tasks: [
                        { id: "w3d3t1", text: "Warm-up Routine" },
                        { id: "w3d3t2", text: "Gameplay: Matches (Ult Coordination)" }
                    ]
                },
                4: {
                    title: "Day 4: Mid-Week Comms Review",
                    tasks: [
                        { id: "w3d4t1", text: "Warm-up Routine" },
                        { id: "w3d4t2", text: "Self-Review: Record & Listen to Your Comms" }
                    ]
                },
                5: {
                    title: "Day 5: Apply Comms Feedback",
                    tasks: [
                        { id: "w3d5t1", text: "Warm-up Routine" },
                        { id: "w3d5t2", text: "Gameplay: Matches (Apply Feedback)" }
                    ]
                },
                6: {
                    title: "Day 6: Social & Community Day",
                    tasks: [
                        { id: "w3d6t1", text: "Warm-up Routine" },
                        { id: "w3d6t2", text: "Community Engagement/Learning" }
                    ]
                }
            }
        },
        4: { 
            title: "Advanced Techniques & Hero Mastery",
            focus: "Refine advanced techniques for Sojourn/Ashe and apply everything in higher-level competitive play.",
            days: {
                1: {
                    title: "Day 1: Hero Focus Day (Micro-optimizations)",
                    tasks: [
                        { id: "w4d1t1", text: "Warm-up Routine" },
                        { id: "w4d1t2", text: "Practice: Hero-Specific Mechanics (15 mins)" },
                        { id: "w4d1t3", text: "Gameplay: Ranked (Apply New Tech)" }
                    ]
                },
                2: {
                    title: "Day 2: Hero Pool Diversification",
                    tasks: [
                        { id: "w4d2t1", text: "Warm-up Routine" },
                        { id: "w4d2t2", text: "Gameplay: Matches on Backup Hero" }
                    ]
                },
                3: {
                    title: "Day 3: Scrim Day (Simulate Tournament Play)",
                    tasks: [
                        { id: "w4d3t1", text: "Warm-up Routine" },
                        { id: "w4d3t2", text: "Gameplay: Arrange Scrim or High Elo FACEIT PUG" }
                    ]
                },
                4: {
                    title: "Day 4: Reflect & Adjust (Review High-Level Games)",
                    tasks: [
                        { id: "w4d4t1", text: "Warm-up Routine" },
                        { id: "w4d4t2", text: "VOD Review: Scrims/FACEIT Matches" }
                    ]
                },
                5: {
                    title: "Day 5: Intensive Practice on Weaknesses",
                    tasks: [
                        { id: "w4d5t1", text: "Warm-up Routine" },
                        { id: "w4d5t2", text: "Targeted Practice: Custom Games/Deathmatch" },
                        { id: "w4d5t3", text: "Gameplay: Comp/Scrim (Apply Fixes & Full Package)" }
                    ]
                },
                6: {
                    title: "Day 6: Recovery & Knowledge Day",
                    tasks: [
                        { id: "w4d6t1", text: "Warm-up Routine (Optional/Light)" },
                        { id: "w4d6t2", text: "Learning/Relaxation: Fun Modes or Theory" }
                    ]
                }
            }
        },
        5: { 
            title: "Preparation for Open Division – Team Dynamics and Strategy",
            focus: "Build team synergy, learn tournament strategies, and iron out gameplay kinks. Finalize OD team if needed.",
            days: {
                1: {
                    title: "Day 1: Team Scrims (Focus Set Plays)",
                    tasks: [
                        { id: "w5d1t1", text: "Warm-up Routine" },
                        { id: "w5d1t2", text: "Team Practice: Scrims (Execute Combos/Strats)" }
                    ]
                },
                2: {
                    title: "Day 2: Refine Personal Play in Team Context",
                    tasks: [
                        { id: "w5d2t1", text: "Warm-up Routine" },
                        { id: "w5d2t2", text: "Team Practice: Scrims/Ranked (Enable Team)" }
                    ]
                },
                3: {
                    title: "Day 3: Tournament Simulation",
                    tasks:
                    [
                        { id: "w5d3t1", text: "Warm-up Routine (Team Warm-up Optional)" },
                        { id: "w5d3t2", text: "Team Practice: Scrim as Tournament Match (Best-of-X)" }
                    ]
                },
                4: {
                    title: "Day 4: Fix Remaining Tech/Strat Issues",
                    tasks: [
                        { id: "w5d4t1", text: "Warm-up Routine" },
                        { id: "w5d4t2", text: "Targeted Practice/Theorycrafting" }
                    ]
                },
                5: {
                    title: "Day 5: Mental & Review Day (Light Practice)",
                    tasks: [
                        { id: "w5d5t1", text: "Warm-up Routine (Light)" },
                        { id: "w5d5t2", text: "Gameplay: Light Scrim or Ranked (Stay Warm)" },
                        { id: "w5d5t3", text: "Review/Prep: Notes, VODs, Team Q&A" }
                    ]
                },
                6: {
                    title: "Day 6: Rest & Visualization (Pre-OD)",
                    tasks: [
                        { id: "w5d6t1", text: "Warm-up Routine (Brief, Optional)" },
                        { id: "w5d6t2", text: "Mental Prep: Visualize Success" },
                        { id: "w5d6t3", text: "Logistics Check: FACEIT Account, Team Reg" }
                    ]
                }
            }
        },
        6: { 
            title: "Open Division Competition and Ongoing Development",
            focus: "Perform in matches, handle pressure, learn from matches, and plan continued improvement.",
            days: {
                1: { 
                    title: "Day 1: OD Match Day / Focused Practice",
                    tasks: [
                        { id: "w6d1t1", text: "Match Day Warm-up Routine" },
                        { id: "w6d1t2", text: "Activity: Open Division Match" },
                        { id: "w6d1t3", text: "Post-Match: Brief Team Huddle / Self-Reflection" }
                    ]
                },
                2: { 
                    title: "Day 2: Post-Match Analysis / Targeted Practice",
                    tasks: [
                        { id: "w6d2t1", text: "Warm-up Routine" },
                        { id: "w6d2t2", text: "VOD Review: OD Match Replay (Team or Self)" },
                        { id: "w6d2t3", text: "Practice: Address Issues from OD Match" }
                    ]
                },
                3: {
                    title: "Day 3: Hero Pool Refinement / Scrim",
                    tasks: [
                        { id: "w6d3t1", text: "Warm-up Routine" },
                        { id: "w6d3t2", text: "Practice: Work on secondary heroes or specific map strategies" },
                        { id: "w6d3t3", text: "Team Practice: Scrim focusing on adaptability" }
                    ]
                },
                4: {
                    title: "Day 4: Advanced Learning & Community",
                    tasks: [
                        { id: "w6d4t1", text: "Warm-up Routine" },
                        { id: "w6d4t2", text: "Learning: Watch High-Level Analysis (Spilo, SVB)" },
                        { id: "w6d4t3", text: "Community: Engage in OD/Tier 3 Discords" }
                    ]
                },
                5: {
                    title: "Day 5: Personal Reflection & Next Steps Planning",
                    tasks: [
                        { id: "w6d5t1", text: "Warm-up Routine" },
                        { id: "w6d5t2", text: "Self-Reflection: Review 6-Week Journey" },
                        { id: "w6d5t3", text: "Planning: Outline Next Training Cycle/Goals" }
                    ]
                },
                6: { 
                    title: "Day 6: Flexible - OD Match / Rest / In-depth Review",
                    tasks: [
                        { id: "w6d6t1", text: "Warm-up Routine (as needed)" },
                        { id: "w6d6t2", text: "Activity: OD Match (if scheduled) OR In-depth VOD Review Session OR Rest Day" },
                        { id: "w6d6t3", text: "Final Checkpoint: Balance and Burnout Avoidance" }
                    ]
                }
            }
        }
    };
    // --- End of Program Data ---

    // --- Resources Data ---
    const resourcesData = { /* ... PASTE YOUR FULL resourcesData HERE ... */ 
        youtubersCoaches: [
            { name: "Spilo (Coaching VODs)", url: "https://www.youtube.com/@CoachSpilo" , note: "Search for his Discord for VOD archives."},
            { name: "ioStux (Hero Guides)", url: "https://www.youtube.com/@ioStux", note: "In-depth hero guides." },
            { name: "KarQ (Tips for Every Hero)", url: "https://www.youtube.com/@KarQ", note: "Quick tips and hero interactions." },
            { name: "SVB (Analytical Coaching)", url: "https://www.youtube.com/@SiliconValet", note: "Analytical content and meta discussions." },
            { name: "GameLeap (Advanced Guides)", url: "https://www.gameleap.com/overwatch", note: "Subscription for some content." },
            { name: "Emongg (Streamer)", url: "https://www.twitch.tv/emongg", note: "Insightful gameplay commentary (Tank focus usually)." },
            { name: "Wanted (Streamer - Hitscan)", url: "https://www.twitch.tv/wantedow", note: "High-level hitscan gameplay." },
            { name: "ML7 (Streamer - Support/Comms)", url: "https://www.twitch.tv/ml7support", note: "Great comms examples (Support focus)." },
            { name: "Jay3 (Streamer - DPS/Entertainment)", url: "https://www.twitch.tv/jay3", note: "Gameplay and entertainment." }
        ],
        communitiesDiscords: [
            { name: "r/CompetitiveOverwatch Discord", url: "https://discord.gg/competitiveoverwatch", note: "Hub for discussions and LFG." },
            { name: "Overwatch University Discord", url: "https://discord.gg/overwatchuniversity", note: "Advice, VOD reviews, LFG." },
            { name: "Overwatch Scrim Finder Discords", url: "#", note: "Search Discord for active scrim finder communities." },
            { name: "FACEIT Overwatch Hub", url: "https://www.faceit.com/en/organizers/173c170d-c936-4d01-b1c7-78199ea44147/Overwatch%20Community", note: "FACEIT platform." },
            { name: "Official Overwatch Esports Discord", url: "https://discord.gg/overwatchesports", note: "OD announcements, LFG."}
        ],
        toolsWebsites: [
            { name: "Overbuff", url: "https://www.overbuff.com/", note: "Stat tracking." },
            { name: "Omnic.ai", url: "https://omnic.ai/", note: "AI gameplay analysis." },
            { name: "KovaaK's FPS Aim Trainer", url: "https://store.steampowered.com/app/824270/KovaaKs_FPS_Aim_Trainer/", note: "Paid aim trainer." },
            { name: "Aim Lab", url: "https://store.steampowered.com/app/714010/Aim_Lab/", note: "Free aim trainer." },
            { name: "Overwatch Liquipedia", url: "https://liquipedia.net/overwatch/", note: "Esports info." }
        ],
        keyGuideLinks: [
            { name: "Spilo's DPS Positioning Concepts (Find on Channel/Discord)", url: "https://www.youtube.com/@CoachSpilo", note: "Fundamental positioning."}
            { name: "Spilo's VOD Channel", url: "https://www.youtube.com/@Spilo2", note: "Various VOD Reviews"}
        ]
    };
    // --- End of Resources Data ---

    // App State
    let appState = {
        currentPage: 'dashboard',
        currentCycle: 1,
        currentWeek: 1,
        currentDay: 1,
        theme: 'light',
        taskCompletions: {}, 
        dailyNotes: {},
        rankHistory: [] // New: [{ cycle: 1, week: 1, rankString: "Diamond 3", dateLogged: "YYYY-MM-DD" }]
    };
    
    const APP_STATE_KEY = 'overwatchTrackerAppState_v3'; // Incremented version for new state structure

    // --- localStorage Persistence ---
    function saveState() {
        try {
            localStorage.setItem(APP_STATE_KEY, JSON.stringify(appState));
        } catch (e) {
            console.error("Error saving state to localStorage:", e);
        }
    }

    function loadState() {
        try {
            const storedState = localStorage.getItem(APP_STATE_KEY);
            if (storedState) {
                const parsedState = JSON.parse(storedState);
                appState = { 
                    ...appState, 
                    ...parsedState,
                    taskCompletions: { ...(parsedState.taskCompletions || {}) },
                    dailyNotes: { ...(parsedState.dailyNotes || {}) },
                    rankHistory: [ ...(parsedState.rankHistory || []) ] // Ensure array is spread
                };
            }
        } catch (e) {
            console.error("Error loading state from localStorage:", e);
        }
    }

    // --- Initialization ---
    function init() {
        loadState();
        setCurrentDate();
        applyTheme();
        renderPage(); 
        setupEventListeners();
    }

    function setCurrentDate() {
        const now = new Date();
        currentDateEl.textContent = now.toLocaleDateString(undefined, { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    function applyTheme() {
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(appState.theme + '-mode');
        themeToggleBtn.textContent = appState.theme === 'light' ? 'Dark Mode' : 'Light Mode';
    }

    // --- Page Rendering Logic ---
    function renderPage() {
        if (rankChartInstance) { // Destroy existing chart before clearing main content
            rankChartInstance.destroy();
            rankChartInstance = null;
        }
        mainContentEl.innerHTML = ''; 

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === appState.currentPage) {
                link.classList.add('active');
            }
        });

        switch (appState.currentPage) {
            case 'dashboard':
                renderDashboardPage();
                break;
            case 'program':
                renderProgramOverviewPage();
                break;
            case 'dailyNotes':
                renderDailyNotesSummaryPage();
                break;
            case 'progress':
                renderProgressPage();
                break;
            case 'resources':
                renderResourcesPage();
                break;
            default:
                appState.currentPage = 'dashboard'; 
                renderDashboardPage();
        }
        saveState(); 
    }

    function renderDashboardPage() {
        mainContentEl.innerHTML = `
            <div class="dashboard-layout">
                <div class="dashboard-main-content">
                    <section class="week-info">
                        <h2 id="weekTitle"></h2>
                        <p id="weekFocus"></p>
                        <h3 id="dayTitle"></h3>
                    </section>
                    <section class="tasks-section">
                        <h4>Today's Tasks</h4>
                        <ul class="task-list" id="taskList"></ul>
                    </section>
                    <section class="day-navigation-controls">
                        <button class="nav-button prev-day-btn" id="prevDayBtn">« Previous Day</button>
                        <button class="nav-button next-day-btn" id="nextDayBtn">Next Day »</button>
                    </section>
                </div>
                <aside class="dashboard-notes-area">
                    <section class="daily-notes-section">
                        <h4>Daily Notes for <span id="dailyNotesDateHeader">W${appState.currentWeek}D${appState.currentDay}</span></h4>
                        <textarea id="dailyNotesTextarea" placeholder="Type your reflections, VOD notes, goals for the day..."></textarea>
                    </section>
                </aside>
            </div>
        `;
        
        const localPrevDayBtn = document.getElementById('prevDayBtn');
        const localNextDayBtn = document.getElementById('nextDayBtn');
        if(localPrevDayBtn && localNextDayBtn) {
            localPrevDayBtn.addEventListener('click', () => navigateToDay(-1));
            localNextDayBtn.addEventListener('click', () => navigateToDay(1));
        }
        
        renderCurrentDayTasks(); 
        setupDailyNotesArea();
    }

    function renderCurrentDayTasks() {
        const localWeekTitleEl = document.getElementById('weekTitle');
        const localWeekFocusEl = document.getElementById('weekFocus');
        const localDayTitleEl = document.getElementById('dayTitle');
        const localTaskListEl = document.getElementById('taskList');

        if (!localWeekTitleEl || !localTaskListEl) return; 

        const weekData = programData[appState.currentWeek];
        if (!weekData) {
            localWeekTitleEl.textContent = "Error"; localTaskListEl.innerHTML = `<li>Week data missing.</li>`;
            updateNavigationButtons(); return;
        }
        const dayData = weekData.days[appState.currentDay];
        if (!dayData) {
            localWeekTitleEl.textContent = `W${appState.currentWeek}: ${weekData.title}`;
            if(localDayTitleEl) localDayTitleEl.textContent = "Error: Day data missing";
            localTaskListEl.innerHTML = `<li>Day data missing.</li>`;
            updateNavigationButtons(); return;
        }

        localWeekTitleEl.textContent = `Week ${appState.currentWeek}: ${weekData.title}`;
        if(localWeekFocusEl) localWeekFocusEl.textContent = `Focus: ${weekData.focus}`;
        if(localDayTitleEl) localDayTitleEl.textContent = dayData.title;

        localTaskListEl.innerHTML = ''; 
        if (dayData.tasks && dayData.tasks.length > 0) {
            dayData.tasks.forEach(task => {
                const li = document.createElement('li');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = task.id;
                checkbox.checked = appState.taskCompletions[task.id] || false;
                checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

                const taskDetailsDiv = document.createElement('div');
                taskDetailsDiv.classList.add('task-details');
                if (checkbox.checked) taskDetailsDiv.classList.add('completed');
                
                const taskTextSpan = document.createElement('span');
                taskTextSpan.textContent = task.text;
                taskDetailsDiv.appendChild(taskTextSpan);

                if (task.focus) { // Assuming 'focus' might still be relevant on tasks
                    const focusSpan = document.createElement('span');
                    focusSpan.classList.add('task-focus');
                    focusSpan.textContent = `(Focus: ${task.focus})`;
                    taskDetailsDiv.appendChild(focusSpan);
                }
                
                li.appendChild(checkbox);
                li.appendChild(taskDetailsDiv);
                localTaskListEl.appendChild(li);
            });
        } else {
            localTaskListEl.innerHTML = '<li>No tasks for today.</li>';
        }
        updateNavigationButtons(); 
    }

    function setupDailyNotesArea() {
        const dailyNotesTextarea = document.getElementById('dailyNotesTextarea');
        const dailyNotesDateHeader = document.getElementById('dailyNotesDateHeader');
        if (!dailyNotesTextarea || !dailyNotesDateHeader) return;

        const noteKey = `w${appState.currentWeek}d${appState.currentDay}`;
        dailyNotesDateHeader.textContent = `W${appState.currentWeek}D${appState.currentDay}`;
        dailyNotesTextarea.value = appState.dailyNotes[noteKey] || '';

        dailyNotesTextarea.addEventListener('input', () => {
            saveDailyNoteWithDebounce(noteKey, dailyNotesTextarea.value);
        });
    }
    
    function saveDailyNoteWithDebounce(noteKey, text) {
        clearTimeout(dailyNoteSaveTimeout);
        dailyNoteSaveTimeout = setTimeout(() => {
            appState.dailyNotes[noteKey] = text;
            saveState();
        }, 750); 
    }

    function renderProgramOverviewPage() {
        let programHtml = `<section class="program-overview-page"><h2>Program Overview (Cycle #${appState.currentCycle})</h2>`;
        programHtml += `<div class="weeks-container">`;

        for (const weekNum in programData) {
            const week = programData[weekNum];
            let completedTasksInWeek = 0;
            let totalTasksInWeek = 0;

            for (const dayNum in week.days) {
                const day = week.days[dayNum];
                if (day.tasks) {
                    totalTasksInWeek += day.tasks.length;
                    day.tasks.forEach(task => {
                        if (appState.taskCompletions[task.id]) {
                            completedTasksInWeek++;
                        }
                    });
                }
            }
            const progressPercent = totalTasksInWeek > 0 ? Math.round((completedTasksInWeek / totalTasksInWeek) * 100) : 0;

            programHtml += `
                <div class="week-card">
                    <div class="week-card-header">
                        <h3>Week ${weekNum}: ${week.title}</h3>
                        <span class="week-progress">Progress: ${progressPercent}%</span>
                    </div>
                    <p class="week-card-focus">Focus: ${week.focus}</p>
                    <button class="view-week-details-btn" data-week="${weekNum}">View Details</button>
                    <div class="week-details-content" id="details-week-${weekNum}" style="display: none;">
                        <h4>Daily Breakdown:</h4>
                        <ul>`;
            for (const dayNum in week.days) {
                const day = week.days[dayNum];
                programHtml += `<li><a href="#" class="jump-to-day-link" data-week="${weekNum}" data-day="${dayNum}">${day.title}</a></li>`;
            }
            programHtml += `    </ul></div></div>`;
        }
        programHtml += `</div></section>`;
        mainContentEl.innerHTML = programHtml;

        document.querySelectorAll('.view-week-details-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const weekNum = e.target.dataset.week;
                const detailsContent = document.getElementById(`details-week-${weekNum}`);
                if (detailsContent) {
                    detailsContent.style.display = detailsContent.style.display === 'none' ? 'block' : 'none';
                    e.target.textContent = detailsContent.style.display === 'none' ? 'View Details' : 'Hide Details';
                }
            });
        });
        document.querySelectorAll('.jump-to-day-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                appState.currentWeek = parseInt(e.target.dataset.week);
                appState.currentDay = parseInt(e.target.dataset.day);
                appState.currentPage = 'dashboard';
                renderPage();
            });
        });
    }

    function renderDailyNotesSummaryPage() {
        let notesHtml = `<section class="daily-notes-summary-page content-card"><h3>Daily Notes Summary (Cycle #${appState.currentCycle})</h3>`;
        const sortedNoteKeys = Object.keys(appState.dailyNotes).sort((a, b) => {
            const [aMatch, aWeek, aDay] = a.match(/w(\d+)d(\d+)/) || [];
            const [bMatch, bWeek, bDay] = b.match(/w(\d+)d(\d+)/) || [];
            if (!aMatch || !bMatch) return 0; // Should not happen with current key format
            if (Number(aWeek) !== Number(bWeek)) return Number(aWeek) - Number(bWeek);
            return Number(aDay) - Number(bDay);
        });

        if (sortedNoteKeys.length === 0) {
            notesHtml += "<p>No daily notes saved yet.</p>";
        } else {
            sortedNoteKeys.forEach(noteKey => {
                const noteText = appState.dailyNotes[noteKey];
                if (noteText && noteText.trim() !== '') { 
                    const [_, weekNum, dayNum] = noteKey.match(/w(\d+)d(\d+)/);
                    const dayTitle = programData[weekNum]?.days[dayNum]?.title || `Day ${dayNum}`;
                    notesHtml += `
                        <div class="note-entry">
                            <div class="note-entry-header">Week ${weekNum}, ${dayTitle} (Cycle ${appState.currentCycle})</div>
                            <div class="note-content">${noteText.replace(/\n/g, '<br>')}</div>
                        </div>`;
                }
            });
        }
        notesHtml += `</section>`;
        mainContentEl.innerHTML = notesHtml;
    }

    function renderProgressPage() { 
        let progressHtml = `<section class="progress-page"><h2>Progress & Stats (Cycle #${appState.currentCycle})</h2>`;

        // --- Rank Tracking Section ---
        progressHtml += `
            <div class="content-card rank-tracking-section">
                <h3>Weekly Rank Tracking</h3>
                <form id="rankLogForm" class="rank-logging-form">
                    <div>
                        <label for="rankWeek">Week:</label>
                        <select id="rankWeek" name="rankWeek" required>
                            ${Array.from({length: 6}, (_, i) => `<option value="${i+1}" ${appState.currentWeek === (i+1) ? 'selected' : ''}>Week ${i+1}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="rankTier">Tier:</label>
                        <select id="rankTier" name="rankTier" required>
                            <option value="">--Select Tier--</option>
                            <option value="Bronze">Bronze</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Diamond">Diamond</option>
                            <option value="Master">Master</option>
                            <option value="Grandmaster">Grandmaster</option>
                            <option value="Champion">Champion</option>
                        </select>
                    </div>
                    <div>
                        <label for="rankDivision">Division:</label>
                        <select id="rankDivision" name="rankDivision" required>
                            <option value="">--Div--</option>
                            ${Array.from({length: 5}, (_, i) => `<option value="${5-i}">${5-i}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="rankSR">SR (Optional):</label>
                        <input type="number" id="rankSR" name="rankSR" min="0" max="5000">
                    </div>
                    <button type="submit" class="form-button">Log Rank</button>
                </form>
                <div id="rankChartContainer">
                    <canvas id="rankChart"></canvas>
                </div>
                <h4>Rank History:</h4>
                <ul id="rankHistoryList" class="rank-history-list">
                    ${appState.rankHistory.filter(r => r.cycle === appState.currentCycle).length === 0 ? '<li>No ranks logged for this cycle yet.</li>' : ''}
                </ul>
            </div>
        `;
        // --- End Rank Tracking Section ---

        // Placeholder for other progress stats
        progressHtml += `
            <div class="content-card">
                <h3>Other Stats (Coming Soon)</h3>
                <p>Consistency calendar and task completion rates will be shown here.</p>
            </div>
        `;
        
        progressHtml += `</section>`;
        mainContentEl.innerHTML = progressHtml;

        populateRankHistoryList();
        renderRankChart();

        // Add event listener for the rank log form
        const rankLogForm = document.getElementById('rankLogForm');
        if (rankLogForm) {
            rankLogForm.addEventListener('submit', handleRankLogSubmit);
        }
    }
    
    function handleRankLogSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const week = parseInt(form.rankWeek.value);
        const tier = form.rankTier.value;
        const division = parseInt(form.rankDivision.value);
        const sr = form.rankSR.value ? parseInt(form.rankSR.value) : null;
        const rankString = `${tier} ${division}${sr ? ` (${sr} SR)` : ''}`;
        const dateLogged = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Avoid duplicate logs for the same week in the same cycle (optional, can allow multiple)
        const existingEntryIndex = appState.rankHistory.findIndex(r => r.cycle === appState.currentCycle && r.week === week);
        if (existingEntryIndex > -1) {
            if (!confirm(`You already logged a rank for Week ${week} in this cycle. Overwrite it?`)) {
                return;
            }
            appState.rankHistory.splice(existingEntryIndex, 1); // Remove old to replace
        }
        
        appState.rankHistory.push({
            cycle: appState.currentCycle,
            week,
            tier,
            division,
            sr,
            rankString,
            dateLogged 
        });
        // Sort by week for consistent display and charting
        appState.rankHistory.sort((a,b) => (a.cycle - b.cycle) || (a.week - b.week));
        
        saveState();
        renderProgressPage(); // Re-render the progress page to update list and chart
        form.reset(); // Optionally reset form fields
        document.getElementById('rankWeek').value = appState.currentWeek; // Default week to current
    }

    function populateRankHistoryList() {
        const listEl = document.getElementById('rankHistoryList');
        if (!listEl) return;
        
        const currentCycleRanks = appState.rankHistory.filter(r => r.cycle === appState.currentCycle);
        listEl.innerHTML = ''; // Clear previous
        if (currentCycleRanks.length === 0) {
            listEl.innerHTML = '<li>No ranks logged for this cycle yet.</li>';
            return;
        }
        currentCycleRanks.forEach(rankEntry => {
            const li = document.createElement('li');
            li.innerHTML = `<span>Week ${rankEntry.week}: ${rankEntry.rankString}</span> <span class="rank-date">Logged: ${rankEntry.dateLogged}</span>`;
            listEl.appendChild(li);
        });
    }

    function renderRankChart() {
        const ctx = document.getElementById('rankChart');
        if (!ctx) return;

        if (rankChartInstance) {
            rankChartInstance.destroy(); // Destroy previous chart instance
        }
        
        const currentCycleRanks = appState.rankHistory.filter(r => r.cycle === appState.currentCycle)
                                        .sort((a,b) => a.week - b.week); // Ensure sorted by week

        if (currentCycleRanks.length === 0) {
            ctx.parentElement.style.display = 'none'; // Hide chart container if no data
            return;
        }
        ctx.parentElement.style.display = 'block';

        const labels = currentCycleRanks.map(r => `W${r.week}`);
        
        // Convert rank (Tier + Division) to a numerical value for charting
        // Higher value = higher rank
        const rankToValue = (tier, division) => {
            const tierValues = { "Bronze": 0, "Silver": 5, "Gold": 10, "Platinum": 15, "Diamond": 20, "Master": 25, "Grandmaster": 30, "Champion": 35 };
            return (tierValues[tier] || 0) + (5 - division); // Division 5 is lowest, 1 is highest within a tier
        };
        const dataPoints = currentCycleRanks.map(r => rankToValue(r.tier, r.division));
        
        const rankTiersDivisions = [
            "Bronze 5", "Bronze 4", "Bronze 3", "Bronze 2", "Bronze 1",
            "Silver 5", "Silver 4", "Silver 3", "Silver 2", "Silver 1",
            "Gold 5", "Gold 4", "Gold 3", "Gold 2", "Gold 1",
            "Platinum 5", "Platinum 4", "Platinum 3", "Platinum 2", "Platinum 1",
            "Diamond 5", "Diamond 4", "Diamond 3", "Diamond 2", "Diamond 1",
            "Master 5", "Master 4", "Master 3", "Master 2", "Master 1",
            "Grandmaster 5", "Grandmaster 4", "Grandmaster 3", "Grandmaster 2", "Grandmaster 1",
            "Champion 5", "Champion 4", "Champion 3", "Champion 2", "Champion 1"
        ];

        rankChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Rank Progression (Cycle ${appState.currentCycle})`,
                    data: dataPoints,
                    borderColor: 'rgb(0, 123, 255)',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false, // Don't necessarily start at Bronze 5 if ranks are higher
                        ticks: {
                            callback: function(value, index, values) {
                                // Map numerical value back to Rank Tier Division string
                                if (value >= 0 && value < rankTiersDivisions.length) {
                                    return rankTiersDivisions[value];
                                }
                                return '';
                            },
                            stepSize: 1 // Ensure every rank division can be a tick
                        },
                        title: {
                            display: true,
                            text: 'Rank'
                        }
                    },
                    x: {
                         title: {
                            display: true,
                            text: 'Program Week'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                const rankValue = context.parsed.y;
                                if (rankValue >= 0 && rankValue < rankTiersDivisions.length) {
                                   label += rankTiersDivisions[rankValue];
                                }
                                const sr = currentCycleRanks[context.dataIndex]?.sr;
                                if (sr) {
                                    label += ` (${sr} SR)`;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }


    function renderResourcesPage() {
        let resourcesHtml = `<section class="resources-page"><h2>Helpful Resources</h2>`;
        const createResourceListHtml = (title, resourcesArray) => {
            if (!resourcesArray || resourcesArray.length === 0) return '';
            let listHtml = `<div class="resource-category content-card"><h3>${title}</h3><ul>`;
            resourcesArray.forEach(resource => {
                listHtml += `<li>
                                <a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.name}</a>
                                ${resource.note ? `<span class="resource-note"> - ${resource.note}</span>` : ''}
                             </li>`;
            });
            listHtml += `</ul></div>`;
            return listHtml;
        };
        resourcesHtml += createResourceListHtml("YouTubers & Coaches", resourcesData.youtubersCoaches);
        resourcesHtml += createResourceListHtml("Communities & Discords", resourcesData.communitiesDiscords);
        resourcesHtml += createResourceListHtml("Tools & Websites", resourcesData.toolsWebsites);
        resourcesHtml += createResourceListHtml("Key Guide Concepts/Links", resourcesData.keyGuideLinks);
        resourcesHtml += `</section>`;
        mainContentEl.innerHTML = resourcesHtml;
    }

    // --- Day/Week Navigation Logic ---
    function getTotalDaysInWeek(weekNumber) {
        const weekData = programData[weekNumber];
        return (weekData && weekData.days) ? Object.keys(weekData.days).length : 0;
    }

    function navigateToDay(direction) {
        let targetDay = appState.currentDay;
        let targetWeek = appState.currentWeek;

        if (direction === 1) { 
            const totalDaysInCurrentWeek = getTotalDaysInWeek(targetWeek);
            if (targetDay < totalDaysInCurrentWeek) targetDay++;
            else { targetWeek++; targetDay = 1; }
        } else if (direction === -1) { 
            if (targetDay > 1) targetDay--;
            else { 
                targetWeek--;
                if (programData[targetWeek]) targetDay = getTotalDaysInWeek(targetWeek); 
                else { targetWeek = 1; targetDay = 1; }
            }
        }
        
        if (programData[targetWeek]?.days?.[targetDay]) {
            appState.currentWeek = targetWeek;
            appState.currentDay = targetDay;
            renderPage(); 
        } else {
            if (appState.currentPage === 'dashboard') updateNavigationButtons();
        }
    }

    function updateNavigationButtons() {
        const prevBtn = document.getElementById('prevDayBtn');
        const nextBtn = document.getElementById('nextDayBtn');
        if (!prevBtn || !nextBtn) return;

        prevBtn.disabled = (appState.currentWeek === 1 && appState.currentDay === 1);
        let nextDayExists = false;
        const currentWeekData = programData[appState.currentWeek];
        if (currentWeekData) {
            if (appState.currentDay < getTotalDaysInWeek(appState.currentWeek)) {
                if (currentWeekData.days[appState.currentDay + 1]) nextDayExists = true;
            } else {
                const nextWeekData = programData[appState.currentWeek + 1];
                if (nextWeekData?.days?.[1]) nextDayExists = true;
            }
        }
        nextBtn.disabled = !nextDayExists;
    }
    
    // --- Event Handlers & State Management ---
    function toggleTaskCompletion(taskId) {
        appState.taskCompletions[taskId] = !appState.taskCompletions[taskId];
        saveState();
        renderPage(); 
    }

    function toggleTheme() {
        appState.theme = appState.theme === 'light' ? 'dark' : 'light';
        saveState();
        applyTheme();
    }

    function startNewCycle() {
        if (confirm("Are you sure you want to start a new cycle? This will reset your current task progress, daily notes, and rank history for the new cycle view.")) {
            appState.currentCycle += 1;
            appState.currentWeek = 1;
            appState.currentDay = 1;
            // Clear data relevant to a cycle, or filter by cycle when displaying
            // For simplicity here, we'll filter by cycle in display functions.
            // If you want to truly clear old cycle data from appState.taskCompletions, etc., you'd do that here.
            // For now, rankHistory, dailyNotes, taskCompletions will just grow, and we filter by currentCycle.
            saveState();
            alert(`New Cycle (#${appState.currentCycle}) started! Back to Week 1, Day 1.`);
            renderPage();
        }
    }
    
    // --- Setup Event Listeners ---
    function setupEventListeners() {
        themeToggleBtn.addEventListener('click', toggleTheme);
        newCycleBtn.addEventListener('click', startNewCycle);
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                appState.currentPage = e.target.dataset.page;
                renderPage();
            });
        });
    }

    init();
});