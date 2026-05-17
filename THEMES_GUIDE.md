# Theme Management Guide

## Overview
All 16 themes have been consolidated into a single file: `styles/all-themes.css`

This reduces file clutter and makes theme management much easier.

## Available Themes
1. **arctic** - Cool arctic blue theme
2. **cosmic** - Deep space purple theme
3. **cyberpunk** - Neon pink and cyan futuristic theme
4. **dark-red** - Dark theme with red accents
5. **dark** - Classic dark mode with orange accents
6. **forest-night** - Dark forest green theme
7. **forest** - Light forest green theme
8. **grayscale** - Monochrome gray theme
9. **lavender** - Soft purple theme
10. **light** - Default Google-style light theme
11. **neon** - Bright neon accent theme
12. **oceanic** - Ocean blue theme
13. **pink** - Pink dreamy theme
14. **retro** - Vintage retro style
15. **sunset** - Warm sunset colors
16. **volcano** - Fiery orange and red theme

## How to Add a New Theme

### Step 1: Open `styles/all-themes.css`

### Step 2: Find the end of the file and add your new theme

Copy an existing theme block as a template, then modify:

```css
/* theme: your-theme-name.css */

:root {
    /* Your Theme Variables */
    --bg-color-yourtheme: #YOUR_BG_COLOR; 
    --bg-color-yourtheme-rgb: R, G, B;
    --text-color-yourtheme: #YOUR_TEXT_COLOR; 
    --text-color-yourtheme-rgb: R, G, B;
    /* ... continue with all variables ... */
}

body.yourtheme-mode {
    --current-bg-color: var(--bg-color-yourtheme);
    --current-bg-color-rgb: var(--bg-color-yourtheme-rgb);
    /* ... map all variables ... */
}

/* Add any custom animations or effects here */
body.yourtheme-mode h1,
body.yourtheme-mode h2,
body.yourtheme-mode h3 {
    /* Custom heading styles */
}
```

### Step 3: Add your theme to the theme selector

Open `scripts/config.js` and find the `THEME_OPTIONS` array. Add your new theme:

```javascript
const THEME_OPTIONS = [
    // ... existing themes ...
    { value: 'yourtheme', label: 'Your Theme Name' }
];
```

## How to Modify an Existing Theme

1. Open `styles/all-themes.css`
2. Search for `/* theme: theme-name.css */` (e.g., `/* theme: dark.css */`)
3. Modify the CSS variables or add custom effects within that theme's section
4. Save the file - changes take effect immediately on page reload

## File Structure

```
/workspace/styles/
├── main.css              # Main stylesheet that imports everything
├── all-themes.css        # ALL 16 themes in one file (234KB)
├── base.css              # Base styles and default variables
├── dashboard.css         # Dashboard-specific styles
├── ...                   # Other component styles
```

## Benefits of This Approach

✅ **Single file** - All themes in one place, easy to find and edit
✅ **No redundant files** - Removed the entire `/themes/` subdirectory
✅ **Better performance** - One HTTP request instead of 16 separate files
✅ **Easy to maintain** - Copy/paste themes, consistent structure
✅ **Clear organization** - Each theme marked with clear comments

## Tips

- Use Ctrl+F (or Cmd+F) to quickly find a specific theme by searching "theme: name.css"
- When creating a new theme, copy the `light.css` or `dark.css` structure as they are well-documented
- Test your theme changes by selecting it in the Settings page
- RGB values are required for transparency effects (rgba usage)
