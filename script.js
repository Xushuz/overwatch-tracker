// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const body = document.body;
    const currentDateEl = document.getElementById('currentDate');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const newCycleBtn = document.getElementById('newCycleBtn');
    
    const mainContentEl = document.querySelector('.app-main');
    const navLinks = document.querySelectorAll('.app-nav .nav-link');

    // Rank Prompt Modal Elements
    const rankPromptModal = document.getElementById('rankPromptModal');
    const closeRankPromptModalBtn = document.getElementById('closeRankPromptModalBtn');
    const modalRankLogForm = document.getElementById('modalRankLogForm');
    const saveModalRankLogBtn = document.getElementById('saveModalRankLogBtn');
    const cancelModalRankLogBtn = document.getElementById('cancelModalRankLogBtn');
    const rankPromptTitleEl = document.getElementById('rankPromptTitle');
    const modalRankLogWeekInput = document.getElementById('modalRankLogWeek');
    const modalRankLogTypeInput = document.getElementById('modalRankLogType');
    const modalRankDivisionButtonsEl = document.getElementById('modalRankDivisionButtons');
    const modalRankDivisionValueInput = document.getElementById('modalRankDivisionValue');


    let dailyNoteSaveTimeout = null;
    let rankChartInstanceDashboard = null; 
    let rankChartInstanceProgress = null;

    // --- Program Data (Ensure your full 6-week data is here) ---
    const programData = { /* ... PASTE YOUR FULL 6-WEEK programData HERE ... */ 
        1: { 
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
            { name: "Spilo (Coaching VODs)", url: "https://www.youtube.com/@Spilo probablement" , note: "Search for his Discord for VOD archives."},
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
        ]
    };
    // --- End of Resources Data ---

    // App State
    const themes = ['light', 'dark', 'pink']; 
    let appState = {
        currentPage: 'dashboard',
        currentCycle: 1,
        currentWeek: 1,
        currentDay: 1,
        theme: themes[0], 
        taskCompletions: {}, 
        dailyNotes: {},
        rankHistory: [], // [{ cycle: 1, week: 0, type: 'initial', rankString: "D3", dateLogged: "...", tier, division}]
                         // [{ cycle: 1, week: 1, type: 'endOfWeek', rankString: "D2", dateLogged: "...", tier, division}]
                         // [{ cycle: 1, date: "YYYY-MM-DD", type: 'daily', rankString: "D2", dateLogged: "...", tier, division}]
        hasPromptedInitialRankThisCycle: false // New flag
    };
    
    const APP_STATE_KEY = 'overwatchTrackerAppState_v5'; // Incremented for new state/features

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
                if (!themes.includes(parsedState.theme)) parsedState.theme = themes[0];
                
                appState = { 
                    ...appState, 
                    ...parsedState,
                    taskCompletions: { ...(parsedState.taskCompletions || {}) },
                    dailyNotes: { ...(parsedState.dailyNotes || {}) },
                    rankHistory: [ ...(parsedState.rankHistory || []) ],
                    hasPromptedInitialRankThisCycle: parsedState.hasPromptedInitialRankThisCycle || false 
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
        checkAndPromptForInitialRank(); // Check for initial rank prompt
    }

    function setCurrentDate() {
        const now = new Date();
        currentDateEl.textContent = now.toLocaleDateString(undefined, { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    function applyTheme() {
        body.classList.remove(...themes.map(t => t + '-mode')); 
        body.classList.add(appState.theme + '-mode'); 
        const currentThemeIndex = themes.indexOf(appState.theme);
        const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
        themeToggleBtn.textContent = `To ${themes[nextThemeIndex].charAt(0).toUpperCase() + themes[nextThemeIndex].slice(1)}`;
        if (appState.currentPage === 'dashboard' && rankChartInstanceDashboard) renderDashboardRankChart();
        if (appState.currentPage === 'progress' && rankChartInstanceProgress) renderProgressPageRankChart();
    }

    // --- Page Rendering Logic ---
    function renderPage() {
        // Destroy charts before clearing content to prevent issues
        if (rankChartInstanceDashboard) { rankChartInstanceDashboard.destroy(); rankChartInstanceDashboard = null; }
        if (rankChartInstanceProgress) { rankChartInstanceProgress.destroy(); rankChartInstanceProgress = null; }
        
        mainContentEl.innerHTML = ''; 

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === appState.currentPage) {
                link.classList.add('active');
            }
        });

        switch (appState.currentPage) {
            case 'dashboard': renderDashboardPage(); break;
            case 'program': renderProgramOverviewPage(); break;
            case 'dailyNotes': renderDailyNotesSummaryPage(); break;
            case 'progress': renderRankHistoryPage(); break; // Renamed from renderProgressPage
            case 'resources': renderResourcesPage(); break;
            default: appState.currentPage = 'dashboard'; renderDashboardPage();
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
                        <div class="current-week-progress">
                            <p id="currentWeekProgressText"></p>
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" id="currentWeekProgressBar"></div>
                            </div>
                        </div>
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
                <aside class="dashboard-side-panel">
                    <section class="daily-notes-section">
                        <h4>Daily Notes for <span id="dailyNotesDateHeader">W${appState.currentWeek}D${appState.currentDay}</span></h4>
                        <textarea id="dailyNotesTextarea" placeholder="Reflections, VOD notes, goals..."></textarea>
                    </section>
                    <section class="dashboard-rank-section">
                        <h4>Quick Rank Update</h4>
                        <form id="dashboardRankUpdateForm" class="dashboard-rank-update-form">
                            <div>
                                <label for="dashboardRankTier">Tier:</label>
                                <select id="dashboardRankTier" name="dashboardRankTier" required></select> 
                            </div>
                            <div>
                                <label for="dashboardRankDivision">Division:</label>
                                <select id="dashboardRankDivision" name="dashboardRankDivision" required></select>
                            </div>
                            <button type="submit" class="form-button">Update Today's Rank</button>
                        </form>
                        <div id="dashboardRankChartContainer" style="min-height: 220px; position: relative;">
                             <canvas id="dashboardRankChart"></canvas>
                        </div>
                    </section>
                </aside>
            </div>
        `;
        
        // Populate rank dropdowns
        populateRankSelects(document.getElementById('dashboardRankTier'), document.getElementById('dashboardRankDivision'));

        const localPrevDayBtn = document.getElementById('prevDayBtn');
        const localNextDayBtn = document.getElementById('nextDayBtn');
        if(localPrevDayBtn && localNextDayBtn) {
            localPrevDayBtn.addEventListener('click', () => navigateToDay(-1));
            localNextDayBtn.addEventListener('click', () => navigateToDay(1));
        }
        
        const dashboardRankForm = document.getElementById('dashboardRankUpdateForm');
        if(dashboardRankForm) dashboardRankForm.addEventListener('submit', handleDashboardRankUpdate);

        renderCurrentDayTasks(); 
        renderCurrentWeekProgress();
        setupDailyNotesArea();
        renderDashboardRankChart();
    }
    
    // In populateRankSelects, only populate tier if divisionSelect is null
    function populateRankSelects(tierSelect, divisionSelect) { // divisionSelect can be null
        if (!tierSelect) return;
        // Tiers
        tierSelect.innerHTML = `<option value="">--Tier--</option>`;
        ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Champion"].forEach(t => {
            tierSelect.innerHTML += `<option value="${t}">${t}</option>`;
        });
        
        // Divisions (only if divisionSelect is provided, which it won't be for the modal anymore)
        if (divisionSelect) {
            divisionSelect.innerHTML = `<option value="">--Div--</option>`;
            [5,4,3,2,1].forEach(d => {
                divisionSelect.innerHTML += `<option value="${d}">${d}</option>`;
            });
        }
    }

    // In renderDashboardPage, when populating rank dropdowns for the dashboard form:
    // Make sure you are still calling populateRankSelects for the dashboard's own tier and division dropdowns.
    // For example, in renderDashboardPage:
    // const dashboardRankTierSelect = document.getElementById('dashboardRankTier');
    // const dashboardRankDivisionSelect = document.getElementById('dashboardRankDivision');
    // populateRankSelects(dashboardRankTierSelect, dashboardRankDivisionSelect); // This line should still exist


    function renderCurrentWeekProgress() {
        const progressTextEl = document.getElementById('currentWeekProgressText');
        const progressBarEl = document.getElementById('currentWeekProgressBar');
        if (!progressTextEl || !progressBarEl) return;

        const weekData = programData[appState.currentWeek];
        if (!weekData || !weekData.days) {
            progressTextEl.textContent = "Week data not available.";
            progressBarEl.style.width = '0%';
            progressBarEl.textContent = '0%';
            return;
        }

        let tasksInWeek = 0;
        let completedInWeek = 0;
        for (const dayNum in weekData.days) {
            const day = weekData.days[dayNum];
            if (day.tasks) {
                tasksInWeek += day.tasks.length;
                day.tasks.forEach(task => {
                    if (appState.taskCompletions[task.id]) {
                        completedInWeek++;
                    }
                });
            }
        }
        const percent = tasksInWeek > 0 ? Math.round((completedInWeek / tasksInWeek) * 100) : 0;
        progressTextEl.textContent = `Current Week Progress: ${completedInWeek} / ${tasksInWeek} tasks`;
        progressBarEl.style.width = `${percent}%`;
        progressBarEl.textContent = `${percent}%`;
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

                if (task.focus) { 
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

        const noteKey = `c${appState.currentCycle}w${appState.currentWeek}d${appState.currentDay}`;
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
                        // For cycle-specific progress, task IDs would need cycle prefix or completions reset per cycle
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
                        <span class="week-progress">${progressPercent}%</span>
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
        let notesHtml = `<section class="daily-notes-summary-page content-card"><h3>All Daily Notes</h3>`;
        const sortedNoteKeys = Object.keys(appState.dailyNotes).sort((a, b) => {
            const [aMatch, aCycle, aWeek, aDay] = a.match(/c(\d+)w(\d+)d(\d+)/) || [null,0,0,0];
            const [bMatch, bCycle, bWeek, bDay] = b.match(/c(\d+)w(\d+)d(\d+)/) || [null,0,0,0];
            if (!aMatch || !bMatch) return 0;
            if (Number(aCycle) !== Number(bCycle)) return Number(aCycle) - Number(bCycle);
            if (Number(aWeek) !== Number(bWeek)) return Number(aWeek) - Number(bWeek);
            return Number(aDay) - Number(bDay);
        });

        if (sortedNoteKeys.length === 0) {
            notesHtml += "<p>No daily notes saved yet.</p>";
        } else {
            sortedNoteKeys.forEach(noteKey => {
                const noteText = appState.dailyNotes[noteKey];
                if (noteText && noteText.trim() !== '') { 
                    const match = noteKey.match(/c(\d+)w(\d+)d(\d+)/);
                    if(match) {
                        const [_, cycleNum, weekNum, dayNum] = match;
                        const dayTitle = programData[weekNum]?.days[dayNum]?.title || `Day ${dayNum}`;
                        notesHtml += `
                            <div class="note-entry">
                                <div class="note-entry-header">Cycle ${cycleNum}, Week ${weekNum}, ${dayTitle}</div>
                                <div class="note-content">${noteText.replace(/\n/g, '<br>')}</div>
                            </div>`;
                    }
                }
            });
             if (notesHtml.endsWith("</h3>")) { 
                notesHtml += "<p>No daily notes with content saved yet.</p>";
            }
        }
        notesHtml += `</section>`;
        mainContentEl.innerHTML = notesHtml;
    }

    function renderRankHistoryPage() { 
        let historyHtml = `<section class="progress-page"><h2>Rank Update History</h2>`;
        historyHtml += `<div class="content-card rank-history-section">`;
        historyHtml += `<h3>All Logged Ranks</h3>`;
        historyHtml += `<ul id="fullRankHistoryList" class="rank-history-list">`;

        if (appState.rankHistory.length === 0) {
            historyHtml += `<li>No ranks logged yet.</li>`;
        } else {
            // Sort by date logged for a chronological history across cycles
            const sortedHistory = [...appState.rankHistory].sort((a,b) => new Date(a.dateLogged) - new Date(b.dateLogged));
            sortedHistory.forEach(rankEntry => {
                let entryLabel = `C${rankEntry.cycle}, `;
                if (rankEntry.type === 'initial') entryLabel += `Initial`;
                else if (rankEntry.type === 'endOfWeek') entryLabel += `End of W${rankEntry.week}`;
                else if (rankEntry.type === 'daily') entryLabel += `Daily Update`;
                else entryLabel += `W${rankEntry.week || 'N/A'}`;


                historyHtml += `<li>
                                    <span>
                                        <span class="rank-type">${entryLabel}:</span> ${rankEntry.rankString}
                                    </span> 
                                    <span class="rank-date">(${rankEntry.dateLogged})</span>
                                 </li>`;
            });
        }
        historyHtml += `</ul></div>`;
        
        // Larger chart on this page
        historyHtml += `
            <div class="content-card">
                <h3>Rank Progression Chart (All Cycles)</h3>
                 <div id="progressPageRankChartContainer" style="min-height: 350px; position: relative;">
                    <canvas id="progressPageRankChart"></canvas>
                </div>
            </div>`;

        historyHtml += `</section>`;
        mainContentEl.innerHTML = historyHtml;
        renderProgressPageRankChart(); // Render the chart for this page
    }
    
    function handleDashboardRankUpdate(event) {
        event.preventDefault();
        const form = event.target;
        const tier = form.dashboardRankTier.value;
        const division = form.dashboardRankDivision.value;
        //const sr = form.dashboardRankSR.value ? parseInt(form.dashboardRankSR.value) : null;

        if (!tier || !division) {
            alert("Please select a Tier and Division.");
            return;
        }
        
        addRankEntry({
            type: 'daily', // Mark as a daily, optional update
            tier,
            division
            //sr
            // week: appState.currentWeek // Could associate with current program week if desired
        });
        form.reset();
        renderDashboardRankChart(); // Update chart on dashboard
    }

    function addRankEntry({ week = null, type, tier, division, sr = null }) {
        const rankString = `${tier} ${division}`;
        const dateLogged = new Date().toISOString().split('T')[0];

        // For 'initial' or 'endOfWeek', check if an entry for that specific week/type in current cycle already exists
        if (type === 'initial' || type === 'endOfWeek') {
            const existingEntryIndex = appState.rankHistory.findIndex(
                r => r.cycle === appState.currentCycle && r.week === week && r.type === type
            );
            if (existingEntryIndex > -1) {
                 console.log(`Rank for ${type} W${week} C${appState.currentCycle} already logged. Skipping.`);
                 return false; // Indicate not added or overwritten
            }
        }

        appState.rankHistory.push({
            cycle: appState.currentCycle,
            week: type === 'daily' ? null : week, // Store program week for initial/endOfWeek, null for daily
            type, // 'initial', 'endOfWeek', 'daily'
            tier,
            division: parseInt(division),
            //sr,
            rankString,
            dateLogged 
        });
        appState.rankHistory.sort((a,b) => new Date(a.dateLogged) - new Date(b.dateLogged) || (a.cycle - b.cycle) || (a.week - b.week) );
        saveState();
        return true; // Indicate success
    }

    const rankToValue = (tier, division) => {
        const tierValues = { "Bronze": 0, "Silver": 5, "Gold": 10, "Platinum": 15, "Diamond": 20, "Master": 25, "Grandmaster": 30, "Champion": 35 };
        return (tierValues[tier] || 0) + (5 - parseInt(division)); 
    };
    const rankTiersAndDivisions = [
        "Bronze 5", "Bronze 4", "Bronze 3", "Bronze 2", "Bronze 1",
        "Silver 5", "Silver 4", "Silver 3", "Silver 2", "Silver 1",
        "Gold 5", "Gold 4", "Gold 3", "Gold 2", "Gold 1",
        "Platinum 5", "Platinum 4", "Platinum 3", "Platinum 2", "Platinum 1",
        "Diamond 5", "Diamond 4", "Diamond 3", "Diamond 2", "Diamond 1",
        "Master 5", "Master 4", "Master 3", "Master 2", "Master 1",
        "Grandmaster 5", "Grandmaster 4", "Grandmaster 3", "Grandmaster 2", "Grandmaster 1",
        "Champion 5", "Champion 4", "Champion 3", "Champion 2", "Champion 1"
    ];

    function createRankChartConfig(rankDataEntries, chartLabelPrefix = "Rank Progression") {
        const labels = rankDataEntries.map(r => {
            if (r.type === 'initial') return `C${r.cycle} Start`;
            if (r.type === 'endOfWeek') return `C${r.cycle} W${r.week} End`;
            return r.dateLogged; // Daily entries use date
        });
        const dataPoints = rankDataEntries.map(r => rankToValue(r.tier, r.division));
        
        const chartTextColor = getComputedStyle(document.body).getPropertyValue('--current-text-color').trim() || '#666';
        const chartGridColor = getComputedStyle(document.body).getPropertyValue('--current-border-color').trim() || '#ddd';
        const chartAccentColor = getComputedStyle(document.body).getPropertyValue('--current-accent-color').trim() || 'rgb(0,123,255)';

        return {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${chartLabelPrefix} (Cycle ${appState.currentCycle})`,
                    data: dataPoints,
                    borderColor: chartAccentColor,
                    backgroundColor: chartAccentColor.replace(/rgb/g, 'rgba').replace(/\)/g, ', 0.1)'),
                    tension: 0.1,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: chartAccentColor,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false, 
                        ticks: {
                            callback: function(value) {
                                if (value >= 0 && value < rankTiersAndDivisions.length) return rankTiersAndDivisions[value];
                                return '';
                            },
                            stepSize: 1, color: chartTextColor
                        },
                        grid: { color: chartGridColor },
                        title: { display: true, text: 'Rank', color: chartTextColor }
                    },
                    x: {
                         ticks: { color: chartTextColor, maxRotation: 45, minRotation: 45 }, 
                         grid: { color: chartGridColor },
                         title: { display: true, text: 'Time / Event', color: chartTextColor }
                    }
                },
                plugins: {
                    legend: { labels: { color: chartTextColor } }, 
                    tooltip: {
                        titleColor: chartTextColor, bodyColor: chartTextColor,
                        callbacks: {
                            label: function(context) {
                                let label = rankDataEntries[context.dataIndex]?.rankString || rankTiersAndDivisions[context.parsed.y] || '';
                                //const sr = rankDataEntries[context.dataIndex]?.sr;
                                //if (sr) label += ` (${sr} SR)`;
                                return label;
                            }
                        }
                    }
                }
            }
        };
    }

    function renderDashboardRankChart() {
        const chartContainer = document.getElementById('dashboardRankChartContainer');
        const ctx = document.getElementById('dashboardRankChart');
        if (!ctx || !chartContainer) return;
        if (rankChartInstanceDashboard) rankChartInstanceDashboard.destroy();
        
        // Show recent rank history for the current cycle for the dashboard chart
        const currentCycleRankData = appState.rankHistory
            .filter(r => r.cycle === appState.currentCycle)
            .sort((a,b) => new Date(a.dateLogged) - new Date(b.dateLogged)); // Sort by actual date

        if (currentCycleRankData.length === 0) {
            chartContainer.innerHTML = '<p style="text-align:center; padding-top:20px;">Log your rank to see progression.</p>';
            return;
        }
        // Ensure canvas is there if we previously put text
        if (!document.getElementById('dashboardRankChart')) {
            chartContainer.innerHTML = '<canvas id="dashboardRankChart"></canvas>';
        }


        rankChartInstanceDashboard = new Chart(document.getElementById('dashboardRankChart'), createRankChartConfig(currentCycleRankData, "Daily Rank Trend"));
    }

    function renderProgressPageRankChart() {
        const chartContainer = document.getElementById('progressPageRankChartContainer');
        const ctx = document.getElementById('progressPageRankChart');
        if (!ctx || !chartContainer) return;
        if (rankChartInstanceProgress) rankChartInstanceProgress.destroy();

        // Show all rank history across all cycles for the progress page chart
        const allRankData = [...appState.rankHistory].sort((a,b) => new Date(a.dateLogged) - new Date(b.dateLogged));

        if (allRankData.length === 0) {
            chartContainer.innerHTML = '<p style="text-align:center; padding-top:20px;">No rank data logged yet.</p>';
            return;
        }
         if (!document.getElementById('progressPageRankChart')) {
            chartContainer.innerHTML = '<canvas id="progressPageRankChart"></canvas>';
        }

        rankChartInstanceProgress = new Chart(document.getElementById('progressPageRankChart'), createRankChartConfig(allRankData, "Overall Rank Progression"));
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
        const oldWeek = appState.currentWeek;
        const oldDay = appState.currentDay;

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
            
            // Check for end-of-week rank prompt
            if (direction === 1 && targetWeek > oldWeek && oldWeek <= 6) { // Moved to a new week
                // Prompt for the week that just ENDED (oldWeek)
                const alreadyLoggedEndOfWeek = appState.rankHistory.some(
                    r => r.cycle === appState.currentCycle && r.week === oldWeek && r.type === 'endOfWeek'
                );
                if (!alreadyLoggedEndOfWeek) {
                    promptForRank(oldWeek, 'endOfWeek');
                }
            }
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
    
    // --- Rank Prompt Modal Logic ---
    function promptForRank(week, type = 'initial') {
        if (!rankPromptModal || !modalRankLogForm) return;
        
        rankPromptTitleEl.textContent = type === 'initial' ? `Log Initial Rank (Cycle ${appState.currentCycle})` : `Log Rank for End of Week ${week} (Cycle ${appState.currentCycle})`;
        modalRankLogWeekInput.value = week;
        modalRankLogTypeInput.value = type;

        populateRankSelects(document.getElementById('modalRankTier'), null); // Only populate Tier select
        modalRankLogForm.reset(); // Clear previous entries for tier
        modalRankDivisionValueInput.value = ''; // Clear hidden division input

        // Generate division buttons
        if (modalRankDivisionButtonsEl) {
            modalRankDivisionButtonsEl.innerHTML = ''; // Clear old buttons
            for (let i = 5; i >= 1; i--) {
                const button = document.createElement('button');
                button.type = 'button'; // Important to prevent form submission
                button.textContent = i;
                button.dataset.division = i;
                button.addEventListener('click', handleDivisionButtonClick);
                modalRankDivisionButtonsEl.appendChild(button);
            }
        }
        
        const latestRank = appState.rankHistory.length > 0 ? appState.rankHistory[appState.rankHistory.length - 1] : null;
        if (latestRank) {
            document.getElementById('modalRankTier').value = latestRank.tier;
            // Pre-select division button if data exists
            if (latestRank.division && modalRankDivisionButtonsEl) {
                const selectedBtn = modalRankDivisionButtonsEl.querySelector(`button[data-division="${latestRank.division}"]`);
                if (selectedBtn) {
                    selectedBtn.classList.add('selected');
                    modalRankDivisionValueInput.value = latestRank.division;
                }
            }
        }
        
        rankPromptModal.style.display = 'block';
    }

    function handleDivisionButtonClick(event) {
    const selectedButton = event.target;
    const division = selectedButton.dataset.division;

    // Update hidden input
    modalRankDivisionValueInput.value = division;

    // Update visual selection
    if (modalRankDivisionButtonsEl) {
        const buttons = modalRankDivisionButtonsEl.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('selected'));
    }
    selectedButton.classList.add('selected');
    }

    function closeRankPromptModal() {
        if (rankPromptModal) rankPromptModal.style.display = 'none';
    }

    function handleModalRankLogSave() {
        const week = parseInt(modalRankLogWeekInput.value);
        const type = modalRankLogTypeInput.value;
        const tier = document.getElementById('modalRankTier').value;
        const division = modalRankDivisionValueInput.value; // Get value from hidden input

        if (!tier || !division) {
            alert("Please select a Tier and Division.");
            return;
        }
        
        const added = addRankEntry({ week, type, tier, division });
        if (added && type === 'initial') {
            appState.hasPromptedInitialRankThisCycle = true;
        }
        
        closeRankPromptModal();
        if (appState.currentPage === 'dashboard') renderDashboardRankChart();
        if (appState.currentPage === 'progress') renderRankHistoryPage(); // This calls renderProgressPageRankChart
    }

    function checkAndPromptForInitialRank() {
        const currentCycleInitialRank = appState.rankHistory.find(
            r => r.cycle === appState.currentCycle && r.type === 'initial'
        );
        if (!currentCycleInitialRank && !appState.hasPromptedInitialRankThisCycle) {
            setTimeout(() => { // Slight delay to ensure page is rendered
                 promptForRank(0, 'initial'); // Week 0 for initial
            }, 500);
        }
    }


    // --- Event Handlers & State Management ---
    function toggleTaskCompletion(taskId) {
        appState.taskCompletions[taskId] = !appState.taskCompletions[taskId];
        saveState();
        if (appState.currentPage === 'dashboard') renderCurrentWeekProgress(); // Update dashboard progress bar
        if (appState.currentPage === 'program') renderProgramOverviewPage(); // Update program overview progress
        
        // Check for end of week completion to prompt rank
        const weekData = programData[appState.currentWeek];
        if(weekData && weekData.days[appState.currentDay]){
            const dayTasks = weekData.days[appState.currentDay].tasks;
            const allDayTasksCompleted = dayTasks.every(task => appState.taskCompletions[task.id]);
            
            if(allDayTasksCompleted && appState.currentDay === getTotalDaysInWeek(appState.currentWeek) && appState.currentWeek <= 6) {
                 const alreadyLoggedEndOfWeek = appState.rankHistory.some(
                    r => r.cycle === appState.currentCycle && r.week === appState.currentWeek && r.type === 'endOfWeek'
                );
                if(!alreadyLoggedEndOfWeek){
                    setTimeout(() => promptForRank(appState.currentWeek, 'endOfWeek'), 200); // Slight delay
                }
            }
        }
         // Also update overall progress if on that page
        if (appState.currentPage === 'progress' && document.getElementById('overallProgramProgress')) {
             // This function isn't defined yet, placeholder for if you add it back
             // renderOverallProgramProgress(); 
        }
    }


    function toggleTheme() {
        const currentThemeIndex = themes.indexOf(appState.theme);
        const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
        appState.theme = themes[nextThemeIndex];
        saveState();
        applyTheme();
    }

    function startNewCycle() {
        if (confirm("Are you sure you want to start a new cycle? This will reset task completions for the new cycle view and prompt for initial rank. Previous data is retained but filtered.")) {
            appState.currentCycle += 1;
            appState.currentWeek = 1;
            appState.currentDay = 1;
            appState.hasPromptedInitialRankThisCycle = false;
            // Task completions are global, but progress on program overview is per-cycle.
            // If you truly want to reset completions: appState.taskCompletions = {};
            saveState();
            alert(`New Cycle (#${appState.currentCycle}) started! Back to Week 1, Day 1.`);
            renderPage();
            checkAndPromptForInitialRank();
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

        // Rank Prompt Modal Listeners
        if(closeRankPromptModalBtn) closeRankPromptModalBtn.addEventListener('click', closeRankPromptModal);
        if(saveModalRankLogBtn) saveModalRankLogBtn.addEventListener('click', handleModalRankLogSave);
        if(cancelModalRankLogBtn) cancelModalRankLogBtn.addEventListener('click', closeRankPromptModal);
        if(rankPromptModal) {
            rankPromptModal.addEventListener('click', (event) => {
                if (event.target === rankPromptModal) {
                    closeRankPromptModal();
                }
            });
        }
    }

    init();
});