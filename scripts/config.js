/**
 * Configuration System for Overwatch Pro Path Tracker
 * 
 * Central configuration file to make content updates easier.
 * Edit this file to modify program structure, tasks, resources, and settings.
 */

// ============================================================================
// PROGRAM STRUCTURE CONFIGURATION
// ============================================================================

export const PROGRAM_CONFIG = {
    // Number of weeks in each cycle
    totalWeeks: 6,
    
    // Default days per week (can be overridden per week)
    defaultDaysPerWeek: 6,
    
    // Cycle names/descriptions
    cyclePrefix: 'Cycle',
    
    // Week definitions - customize titles and focuses for each week
    weeks: {
        1: {
            title: "Fundamentals & Assessment",
            focus: "Establish a baseline of your play and master the fundamentals of positioning and game sense."
        },
        2: {
            title: "Game Sense & Decision-Making",
            focus: "Improve understanding of game flow, decision-making, and team coordination."
        },
        3: {
            title: "Communication & Team Coordination",
            focus: "Develop communication skills and team coordination abilities."
        },
        4: {
            title: "Advanced Techniques & Mastery",
            focus: "Refine advanced techniques and achieve mastery in your role."
        },
        5: {
            title: "Competitive Preparation",
            focus: "Prepare for high-level competitive play and team coordination."
        },
        6: {
            title: "Tournament Execution & Development",
            focus: "Execute in competitive settings and plan continued improvement."
        }
    }
};

// ============================================================================
// TASK TEMPLATES
// ============================================================================

/**
 * Reusable task templates to avoid duplication
 * Use these as building blocks for daily tasks
 */
export const TASK_TEMPLATES = {
    // Warmup templates
    WARMUP_ROLE_SPECIFIC: (role) => ({
        id: "warmup_role",
        text: `Warm-up: ${role}-specific Practice (10 mins)`,
        focus: `Practice aim, movement, or mechanics relevant to ${role.toLowerCase()}.`
    }),
    
    WARMUP_HERO_SPECIFIC: (duration = 5) => ({
        id: "warmup_hero",
        text: `Warm-up: Hero-specific Practice (${duration} mins)`,
        focus: "Focus on your main heroes' core mechanics and combos."
    }),
    
    WARMUP_LIVE_PRACTICE: (duration = "5–10") => ({
        id: "warmup_live",
        text: `Warm-up: Live Practice (${duration} mins)`,
        focus: "Deathmatch, aim duels, or movement practice."
    }),
    
    // Gameplay templates
    GAMEPLAY_COMPETITIVE: (count = "3–4", focus = "Play normally.") => ({
        id: "gameplay_comp",
        text: `Gameplay: ${count} Competitive Matches`,
        focus: focus
    }),
    
    GAMEPLAY_RANKED: (focus = "Apply learned concepts in ranked play.") => ({
        id: "gameplay_ranked",
        text: "Gameplay: Ranked Matches",
        focus: focus
    }),
    
    // Review templates
    VOD_REVIEW_FULL: (duration = 10, focus = "Identify mistakes and improvement areas.") => ({
        id: "vod_review",
        text: `VOD Review: Watch Replay (${duration} mins)`,
        focus: focus
    }),
    
    SELF_REVIEW: (focus = "Reflect on today's performance.") => ({
        id: "self_review",
        text: "Self-Review Session",
        focus: focus
    }),
    
    // Learning templates
    LEARNING_EDUCATIONAL: (focus = "Study guides relevant to your role. Note 3 actionable tips.") => ({
        id: "learning_edu",
        text: "Learning: Watch Educational Content",
        focus: focus
    }),
    
    LEARNING_ADVANCED: (focus = "Study advanced concepts and meta developments.") => ({
        id: "learning_advanced",
        text: "Learning: Advanced Concepts",
        focus: focus
    }),
    
    // Practice templates
    PRACTICE_TARGETED: (focus = "Focus on specific areas needing improvement.") => ({
        id: "practice_targeted",
        text: "Targeted Practice: Weakness Focus",
        focus: focus
    }),
    
    PRACTICE_MECHANICS: (duration = 15, focus = "Work on advanced mechanics.") => ({
        id: "practice_mechanics",
        text: `Practice: Advanced Techniques (${duration} mins)`,
        focus: focus
    })
};

// ============================================================================
// ROLE CONFIGURATION
// ============================================================================

export const ROLES = {
    TANK: {
        id: 'tank',
        name: 'Tank',
        displayName: 'Tank',
        color: '#1565C0', // Blue
        cssClass: 'role-tank'
    },
    DAMAGE: {
        id: 'dps',
        name: 'Damage',
        displayName: 'DPS',
        color: '#D32F2F', // Red
        cssClass: 'role-damage'
    },
    SUPPORT: {
        id: 'support',
        name: 'Support',
        displayName: 'Support',
        color: '#388E3C', // Green
        cssClass: 'role-support'
    }
};

// ============================================================================
// RANK SYSTEM CONFIGURATION
// ============================================================================

export const RANK_CONFIG = {
    tiers: [
        "Bronze", "Silver", "Gold", "Platinum", 
        "Diamond", "Master", "Grandmaster", "Champion"
    ],
    
    divisions: [5, 4, 3, 2, 1],
    
    tierValues: {
        "Bronze": 0, "Silver": 5, "Gold": 10, "Platinum": 15,
        "Diamond": 20, "Master": 25, "Grandmaster": 30, "Champion": 35
    }
};

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const THEME_CONFIG = {
    available: [
        'light', 'dark', 'dark-red', 'pink', 'oceanic', 'forest', 
        'sunset', 'lavender', 'grayscale', 'cyberpunk', 'retro', 
        'arctic', 'volcano', 'cosmic', 'neon', 'forest-night'
    ],
    
    default: 'light'
};

// ============================================================================
// APP STATE CONFIGURATION
// ============================================================================

export const APP_CONFIG = {
    // LocalStorage key version (increment when breaking changes occur)
    STORAGE_KEY_VERSION: 'v9',
    STORAGE_KEY_PREFIX: 'overwatchTrackerAppState_',
    
    // Performance settings
    PERFORMANCE: {
        // Debounce delay for resize events (ms)
        RESIZE_DEBOUNCE: 100,
        
        // Scroll threshold for header effects (px)
        SCROLL_THRESHOLD_DEFAULT: 10,
        SCROLL_THRESHOLD_SENSITIVE: 5,
        
        // Themes that need sensitive scroll detection
        SENSITIVE_SCROLL_THEMES: ['neon', 'cyberpunk', 'volcano', 'cosmic'],
        
        // Lazy load chart library
        LAZY_LOAD_CHARTS: true,
        
        // Chart.js CDN URL
        CHART_JS_URL: 'https://cdn.jsdelivr.net/npm/chart.js'
    },
    
    // UI Settings
    UI: {
        // Modal close delays (ms)
        MODAL_CLOSE_DELAY: 0,
        
        // Rank prompt delay (ms)
        RANK_PROMPT_DELAY: 600,
        
        // Role selection prompt delay (ms)
        ROLE_SELECTION_DELAY: 800,
        
        // Pagination items per page
        RANK_HISTORY_ITEMS_PER_PAGE: 10,
        RANK_HISTORY_INITIAL_DISPLAY: 5
    },
    
    // Task completion tracking
    TASKS: {
        // Key format: c{cycle}-{task_id}
        KEY_FORMAT: (cycle, taskId) => `c${cycle}-${taskId}`
    }
};

// ============================================================================
// RESOURCE LINKS CONFIGURATION
// ============================================================================

export const DEFAULT_RESOURCES = {
    general: [
        {
            category: "Educational Channels",
            links: [
                { name: "Overwatch League", url: "https://www.youtube.com/overwatchleague", description: "Watch professional matches" },
                { name: "ProGuides", url: "https://proguides.com/overwatch", description: "Comprehensive guides" }
            ]
        },
        {
            category: "Tools",
            links: [
                { name: "Aim Lab", url: "https://aimlab.gg", description: "Free aim trainer" },
                { name: "Overwatch Settings", url: "https://overwatchsettings.com", description: "Pro player settings" }
            ]
        }
    ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the full storage key
 */
export function getStorageKey() {
    return `${APP_CONFIG.STORAGE_KEY_PREFIX}${APP_CONFIG.STORAGE_KEY_VERSION}`;
}

/**
 * Generate a task ID based on week, day, and task number
 */
export function generateTaskId(week, day, taskNum) {
    return `w${week}d${day}t${taskNum}`;
}

/**
 * Check if a theme is valid
 */
export function isValidTheme(themeName) {
    return THEME_CONFIG.available.includes(themeName);
}

/**
 * Get role by name (case-insensitive)
 */
export function getRoleByName(roleName) {
    const normalizedName = roleName.toLowerCase();
    
    if (normalizedName === 'tank') return ROLES.TANK;
    if (normalizedName === 'damage' || normalizedName === 'dps') return ROLES.DAMAGE;
    if (normalizedName === 'support') return ROLES.SUPPORT;
    
    return null;
}

/**
 * Calculate rank value for chart plotting
 */
export function calculateRankValue(tier, division) {
    const numericDivision = parseInt(division);
    const baseValue = RANK_CONFIG.tierValues[tier] || 0;
    
    if (isNaN(numericDivision) || numericDivision < 1 || numericDivision > 5) {
        return baseValue;
    }
    
    return baseValue + (5 - numericDivision);
}

// Export all config objects as default
export default {
    PROGRAM_CONFIG,
    TASK_TEMPLATES,
    ROLES,
    RANK_CONFIG,
    THEME_CONFIG,
    APP_CONFIG,
    DEFAULT_RESOURCES,
    getStorageKey,
    generateTaskId,
    isValidTheme,
    getRoleByName,
    calculateRankValue
};
