# Content Update Guide - Overwatch Pro Path Tracker

This guide explains how to easily update and modify content in the application.

## Quick Start: What You Can Change

### 1. **Program Structure** (Weeks, Days, Tasks)
Edit: `scripts/config.js` → `PROGRAM_CONFIG`

```javascript
export const PROGRAM_CONFIG = {
    totalWeeks: 6,              // Change number of weeks
    defaultDaysPerWeek: 6,      // Default days per week
    
    weeks: {
        1: {
            title: "Your Week Title",
            focus: "Week focus description"
        },
        // Add more weeks...
    }
};
```

### 2. **Task Templates** (Reusable task definitions)
Edit: `scripts/config.js` → `TASK_TEMPLATES`

Create reusable task templates:
```javascript
WARMUP_ROUTINE: (duration = 10) => ({
    id: "warmup",
    text: `Warm-up Routine (${duration} mins)`,
    focus: "Describe the warmup focus"
})
```

### 3. **Role-Specific Programs**
Edit these files for role-specific training content:
- `scripts/program-data-tank.js` - Tank role tasks
- `scripts/program-data-dps.js` - Damage role tasks  
- `scripts/program-data-support.js` - Support role tasks

Each file exports:
- `tankProgramData` / `dpsProgramData` / `supportProgramData`
- `tankResourcesData` / `dpsResourcesData` / `supportResourcesData`

### 4. **Rank System**
Edit: `scripts/config.js` → `RANK_CONFIG`

```javascript
export const RANK_CONFIG = {
    tiers: ["Bronze", "Silver", "Gold", ...],  // Add/remove ranks
    divisions: [5, 4, 3, 2, 1],                 // Division numbers
    tierValues: { "Bronze": 0, "Silver": 5, ... } // Chart values
};
```

### 5. **Themes**
Edit: `scripts/config.js` → `THEME_CONFIG`

```javascript
export const THEME_CONFIG = {
    available: ['light', 'dark', 'your-theme', ...],
    default: 'light'
};
```

Then create CSS file: `styles/themes/your-theme.css`

### 6. **Resources & Links**
Edit: `scripts/config.js` → `DEFAULT_RESOURCES`

Or edit role-specific resources in:
- `scripts/program-data-tank.js`
- `scripts/program-data-dps.js`
- `scripts/program-data-support.js`

---

## File Structure Reference

```
/workspace
├── scripts/
│   ├── config.js                    ⭐ MAIN CONFIG FILE - Edit this first!
│   ├── app-state.js                 App state management
│   ├── program-data.js              Program data loader
│   ├── program-data-tank.js         Tank-specific content
│   ├── program-data-dps.js          DPS-specific content
│   ├── program-data-support.js      Support-specific content
│   ├── script.js                    Main app orchestrator
│   ├── main-navigation.js           Page navigation
│   ├── ui-render-*.js               UI rendering functions
│   └── ...                          Other utility modules
│
├── styles/
│   ├── themes/
│   │   ├── light.css                Theme files
│   │   ├── dark.css
│   │   └── ...                      Add new themes here
│   └── ...                          Other stylesheets
│
├── assets/
│   ├── logo.png                     App logo
│   ├── logo.svg
│   └── icons.svg                    Icon definitions
│
└── index.html                       Main HTML file
```

---

## Common Tasks

### Adding a New Week

1. Open `scripts/config.js`
2. Add to `PROGRAM_CONFIG.weeks`:
```javascript
7: {
    title: "New Week Title",
    focus: "Description of the week's focus"
}
```
3. Add corresponding tasks in role-specific files (e.g., `program-data-tank.js`)

### Adding Custom Tasks

Use task templates from `config.js`:
```javascript
import { TASK_TEMPLATES } from './config.js';

// In your program data file:
{
    title: "Day 1: Assessment",
    tasks: [
        TASK_TEMPLATES.WARMUP_ROLE_SPECIFIC('Tank'),
        TASK_TEMPLATES.GAMEPLAY_COMPETITIVE("3-4", "Focus on positioning"),
        TASK_TEMPLATES.VOD_REVIEW_FULL(15, "Analyze deaths")
    ]
}
```

### Creating a New Theme

1. Add theme name to `THEME_CONFIG.available` in `config.js`
2. Create `styles/themes/your-theme-name.css`
3. Define CSS variables:
```css
.your-theme-name-mode {
    --current-bg-primary: #your-color;
    --current-text-color: #your-text;
    /* ... other variables */
}
```

### Modifying Rank Tiers

1. Edit `RANK_CONFIG` in `config.js`:
```javascript
export const RANK_CONFIG = {
    tiers: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Champion", "Top500"],
    tierValues: {
        "Bronze": 0,
        "Silver": 5,
        // ... add "Top500": 40
    }
}
```

### Adding Resources

In role-specific resource files:
```javascript
export const tankResourcesData = {
    youtubersCoaches: [
        {
            name: "Your Channel",
            url: "https://youtube.com/...",
            description: "What they teach"
        }
    ],
    toolsWebsites: [...],
    communitiesDiscords: [...]
};
```

---

## Data Structure Examples

### Task Object
```javascript
{
    id: "w1d1t1",           // Unique ID: week{N}day{N}task{N}
    text: "Task title",     // Display text
    focus: "Task focus"     // Description/focus area
}
```

### Week Data Structure
```javascript
{
    1: {  // Week number
        title: "Week Title",
        focus: "Week focus description",
        days: {
            1: {  // Day number
                title: "Day Title",
                tasks: [/* array of task objects */]
            }
        }
    }
}
```

### Rank Entry
```javascript
{
    cycle: 1,                  // Cycle number
    week: 1,                   // Week number (0 for initial)
    type: "initial" | "daily", // Entry type
    tier: "Gold",              // Rank tier
    division: "3",             // Division (1-5)
    rankString: "Gold 3",      // Display string
    dateLogged: "2024-01-15",  // ISO date
    role: "dps" | "tank" | "support"
}
```

---

## Best Practices

### 1. Use Configuration First
Always check `config.js` before hardcoding values elsewhere.

### 2. Follow Naming Conventions
- Task IDs: `w{week}d{day}t{task}` (e.g., `w1d1t1`)
- Cycle prefixes: `c{cycle}-` (e.g., `c1-w1d1t1`)
- CSS classes: `role-{role}` (e.g., `role-tank`)

### 3. Test Changes
After making changes:
1. Clear browser localStorage or use incognito mode
2. Test all affected features
3. Check console for errors

### 4. Backup Before Major Changes
Use the app's built-in export feature:
- Settings → Export Data (JSON)

### 5. Version Control
Increment `STORAGE_KEY_VERSION` in `config.js` when making breaking changes:
```javascript
STORAGE_KEY_VERSION: 'v10'  // Was 'v9'
```

---

## Troubleshooting

### Changes Not Appearing?
1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear localStorage
3. Check browser console for errors

### Data Lost After Update?
Check if `STORAGE_KEY_VERSION` changed. If so, old data uses different key.

### Tasks Not Filtering by Role?
Ensure task content includes role-specific keywords (see `role-task-filter.js`)

---

## Advanced: Adding New Features

### New Page Type
1. Add to `index.html` navigation
2. Create render function in `scripts/ui-render-*.js`
3. Add case to switch in `main-navigation.js`

### New State Properties
1. Add to `appState` object in `app-state.js`
2. Ensure persistence in `loadState()` merge logic

### New Modal Types
1. Add modal HTML to `index.html`
2. Create initialization in `ui-modals.js`
3. Call init from `script.js`

---

## Contact & Support

For questions or issues:
- Check existing code patterns
- Review console errors
- Use browser DevTools to inspect state
