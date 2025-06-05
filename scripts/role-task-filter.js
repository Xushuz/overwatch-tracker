// scripts/role-task-filter.js
// Role-based task filtering system for Overwatch tracker

import { getAppState } from './app-state.js';

/**
 * Determines which roles a task applies to based on its content
 * @param {Object} task - The task object with id, text, focus properties
 * @returns {Array} Array of role strings ('Tank', 'Damage', 'Support')
 */
export function getTaskRoles(task) {
    const text = task.text.toLowerCase();
    const focus = (task.focus || '').toLowerCase();
    const content = `${text} ${focus}`;
    
    const roles = [];
    
    // Tank-specific indicators
    const tankKeywords = [
        'tank', 'reinhardt', 'winston', 'orisa', 'sigma', 'roadhog', 'wrecking ball', 'zarya', 
        'dva', 'd.va', 'junker queen', 'doomfist', 'ramattra', 'mauga',
        'shield', 'barrier', 'space creation', 'main tank', 'off tank',
        'frontline', 'engage', 'peel for supports', 'bubble', 'defense matrix',
        'hook', 'charge', 'slam', 'shield bash', 'fortify', 'kinetic grasp'
    ];
    
    // Damage-specific indicators  
    const damageKeywords = [
        'dps', 'damage', 'sojourn', 'ashe', 'widowmaker', 'cassidy', 'tracer', 'genji',
        'soldier', 'mccree', 'reaper', 'pharah', 'junkrat', 'torbjorn', 'bastion',
        'hanzo', 'mei', 'echo', 'sombra', 'symmetra', 'venture',
        'aim trainer', 'hitscan', 'projectile', 'flanker', 'sniper',
        'railgun', 'quick scope', 'dynamite', 'widow', 'headshots',
        'high ground', 'off-angles', 'dueling', 'tracking', 'flick',
        'target acquisition', 'eliminations', 'picks', 'pressure'
    ];
    
    // Support-specific indicators
    const supportKeywords = [
        'support', 'mercy', 'ana', 'moira', 'lucio', 'zenyatta', 'baptiste', 
        'brigitte', 'kiriko', 'lifeweaver', 'illari', 'venture',
        'healing', 'utility', 'sleep dart', 'nano boost', 'resurrection',
        'damage boost', 'speed boost', 'discord orb', 'harmony orb',
        'immortality field', 'lamp', 'rally', 'beat', 'beat drop',
        'positioning safety', 'cooldown management', 'triage', 'prioritize healing',
        'enable team', 'peel', 'call outs', 'enemy positioning'
    ];
    
    // Check for role-specific content
    if (tankKeywords.some(keyword => content.includes(keyword))) {
        roles.push('Tank');
    }
    
    if (damageKeywords.some(keyword => content.includes(keyword))) {
        roles.push('Damage');
    }
    
    if (supportKeywords.some(keyword => content.includes(keyword))) {
        roles.push('Support');
    }
    
    // Universal tasks (apply to all roles if no specific role detected)
    const universalKeywords = [
        'warm-up routine', 'competitive matches', 'vod review', 'replay', 
        'communication', 'comms', 'team coordination', 'game sense',
        'awareness', 'decision making', 'ult tracking', 'cooldown tracking',
        'positioning', 'mental prep', 'tournament', 'scrim', 'practice',
        'learning', 'educational content', 'community', 'rest day',
        'reflection', 'self-assessment', 'planning', 'notes'
    ];
    
    // If no specific role found but contains universal keywords, apply to all roles
    if (roles.length === 0) {
        if (universalKeywords.some(keyword => content.includes(keyword))) {
            roles.push('Tank', 'Damage', 'Support');
        } else {
            // Default fallback - if we can't categorize it, make it universal
            roles.push('Tank', 'Damage', 'Support');
        }
    }
    
    return roles;
}

/**
 * Checks if a task should be shown based on user's selected roles
 * @param {Object} task - The task object
 * @param {Array} selectedRoles - User's selected roles array
 * @returns {boolean} True if task should be shown
 */
export function shouldShowTask(task, selectedRoles) {
    // If no roles selected, show all tasks (fallback)
    if (!selectedRoles || selectedRoles.length === 0) {
        return true;
    }
    
    const taskRoles = getTaskRoles(task);
    
    // Show task if it applies to any of the user's selected roles
    return taskRoles.some(role => selectedRoles.includes(role));
}

/**
 * Filters an array of tasks based on user's selected roles
 * @param {Array} tasks - Array of task objects
 * @param {Array} selectedRoles - User's selected roles array (optional, will use app state if not provided)
 * @returns {Array} Filtered array of tasks
 */
export function filterTasksByRole(tasks, selectedRoles = null) {
    if (!selectedRoles) {
        const appState = getAppState();
        selectedRoles = appState.selectedRoles || [];
    }
    
    // If no roles selected, show all tasks
    if (selectedRoles.length === 0) {
        return tasks;
    }
    
    return tasks.filter(task => shouldShowTask(task, selectedRoles));
}

/**
 * Gets role-appropriate task alternatives for better variety
 * @param {Object} task - The original task
 * @param {Array} selectedRoles - User's selected roles
 * @returns {Object} Modified task with role-appropriate content
 */
export function adaptTaskForRoles(task, selectedRoles) {
    if (!selectedRoles || selectedRoles.length === 0) {
        return task;
    }
    
    // Create a copy to avoid modifying the original
    const adaptedTask = { ...task };
    
    // Role-specific adaptations for common tasks
    const text = task.text.toLowerCase();
    
    // Adapt hero-specific practice
    if (text.includes('hero-specific practice')) {
        const heroSuggestions = [];
        if (selectedRoles.includes('Tank')) {
            heroSuggestions.push('Tank: Shield management, positioning, space creation');
        }
        if (selectedRoles.includes('Damage')) {
            heroSuggestions.push('DPS: Aim drills, target prioritization, positioning');
        }
        if (selectedRoles.includes('Support')) {
            heroSuggestions.push('Support: Positioning safety, cooldown management, target prioritization');
        }
        
        adaptedTask.focus = heroSuggestions.join('. ');
    }
    
    // Adapt positioning focus
    if (text.includes('positioning') && task.focus) {
        const originalFocus = task.focus;
        const roleAdaptations = [];
        
        if (selectedRoles.includes('Tank')) {
            roleAdaptations.push('Tank: Lead positioning, create space, shield angles');
        }
        if (selectedRoles.includes('Damage')) {
            roleAdaptations.push('DPS: High ground, off-angles, escape routes');
        }
        if (selectedRoles.includes('Support')) {
            roleAdaptations.push('Support: Safe positioning, cover usage, sightlines to team');
        }
        
        if (roleAdaptations.length > 0) {
            adaptedTask.focus = `${originalFocus} Role focus: ${roleAdaptations.join('. ')}`;
        }
    }
    
    return adaptedTask;
}

/**
 * Provides role-specific tips for warmup routines
 * @param {Array} selectedRoles - User's selected roles
 * @returns {String} Role-specific warmup suggestions
 */
export function getRoleWarmupTips(selectedRoles) {
    if (!selectedRoles || selectedRoles.length === 0) {
        return 'General warmup: Aim trainer, quick play, practice range';
    }
    
    const tips = [];
    
    if (selectedRoles.includes('Tank')) {
        tips.push('Tank: Practice shield timing, space creation, ability rotations');
    }
    
    if (selectedRoles.includes('Damage')) {
        tips.push('DPS: Aim trainer, target switching, movement patterns');
    }
    
    if (selectedRoles.includes('Support')) {
        tips.push('Support: Positioning drills, target prioritization, escape routes');
    }
    
    return tips.join(' | ');
}
