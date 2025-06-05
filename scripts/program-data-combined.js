// program-data-combined.js - Dynamic role-based program data loader

import { tankProgramData, tankResourcesData } from './program-data-tank.js';
import { dpsProgramData, dpsResourcesData } from './program-data-dps.js';
import { supportProgramData, supportResourcesData } from './program-data-support.js';
import { getAppState } from './app-state.js';

// Function to get the appropriate program data based on selected roles
export function getProgramData() {
    const { selectedRoles } = getAppState();
    
    // If no roles selected or multiple roles, return combined/generalized data
    if (!selectedRoles || selectedRoles.length === 0) {
        return getDefaultProgramData();
    }
    
    // If single role selected, return role-specific data
    if (selectedRoles.length === 1) {
        const role = selectedRoles[0];
        switch (role) {
            case 'Tank':
                return tankProgramData;
            case 'Damage':
                return dpsProgramData;
            case 'Support':
                return supportProgramData;
            default:
                return getDefaultProgramData();
        }
    }
    
    // Multiple roles selected - return combined data
    return getCombinedProgramData(selectedRoles);
}

// Function to get the appropriate resources data based on selected roles
export function getResourcesData() {
    const { selectedRoles } = getAppState();
    
    if (!selectedRoles || selectedRoles.length === 0) {
        return getDefaultResourcesData();
    }
    
    if (selectedRoles.length === 1) {
        const role = selectedRoles[0];
        switch (role) {
            case 'Tank':
                return tankResourcesData;
            case 'Damage':
                return dpsResourcesData;
            case 'Support':
                return supportResourcesData;
            default:
                return getDefaultResourcesData();
        }
    }
    
    // Multiple roles - combine resources
    return getCombinedResourcesData(selectedRoles);
}

function getDefaultProgramData() {
    return {
        1: { 
            title: "Fundamentals & Assessment",
            focus: "Establish a baseline of your play and master the fundamentals of positioning and game sense.",
            days: {
                1: { 
                    title: "Day 1: Assessment",
                    tasks: [
                        { id: "w1d1t1", text: "Warm-up: Role-specific Practice (10 mins)", focus: "Practice aim, movement, or mechanics relevant to your role." }, 
                        { id: "w1d1t2", text: "Warm-up: Hero-specific Practice (5 mins)", focus: "Focus on your main heroes' core mechanics and combos." },
                        { id: "w1d1t3", text: "Warm-up: Live Practice (5–10 mins)", focus: "Deathmatch, aim duels, or movement practice for your role." },
                        { id: "w1d1t4", text: "Gameplay: 3–4 Competitive Matches (Benchmark)", focus: "Play normally. Focus on fundamentals for your role. Track key performance metrics." },
                        { id: "w1d1t5", text: "Self-Review: Watch one replay (10 mins)", focus: "Identify mistakes and improvement areas from today's games." }
                    ]
                },
                2: { 
                    title: "Day 2: Core Concepts & Learning",
                    tasks: [
                        { id: "w1d2t1", text: "Warm-up Routine" },
                        { id: "w1d2t2", text: "Gameplay: Matches (Focus on Fundamentals)", focus: "Prioritize staying alive and playing your role effectively." },
                        { id: "w1d2t3", text: "Learning: Watch Educational Content", focus: "Study guides relevant to your role. Note 3 actionable tips." }
                    ]
                },
                3: { 
                    title: "Day 3: Positioning & Map Awareness",
                    tasks: [
                        { id: "w1d3t1", text: "Warm-up Routine" },
                        { id: "w1d3t2", text: "Gameplay: Matches (Positioning Focus)", focus: "Focus on optimal positioning for your role on different maps." },
                        { id: "w1d3t3", text: "Quick Review: Positioning Analysis", focus: "Review one death - could better positioning have prevented it?" }
                    ]
                },
                4: { 
                    title: "Day 4: Deep Self-Review",
                    tasks: [
                        { id: "w1d4t1", text: "Warm-up Routine" },
                        { id: "w1d4t2", text: "VOD Review: Full Replay Analysis", focus: "Review one full replay. Identify 3+ improvement areas for your role." }
                    ]
                },
                5: { 
                    title: "Day 5: Apply Corrections",
                    tasks: [
                        { id: "w1d5t1", text: "Warm-up Routine" },
                        { id: "w1d5t2", text: "Gameplay: Matches (Focus on Corrections)", focus: "Don't repeat mistakes identified yesterday." }
                    ]
                },
                6: { 
                    title: "Day 6: Lighter Day / Reinforce Concepts",
                    tasks: [
                        { id: "w1d6t1", text: "Warm-up Routine" },
                        { id: "w1d6t2", text: "Practice/Learning: Workshop or Pro VODs", focus: "Practice mechanics or watch educational content." }
                    ]
                }
            }
        },
        2: {
            title: "Game Sense & Decision-Making", 
            focus: "Improve understanding of game flow, decision-making, and team coordination.",
            days: {
                1: { title: "Day 1: Game Flow Understanding", tasks: [
                    { id: "w2d1t1", text: "Warm-up Routine" },
                    { id: "w2d1t2", text: "Gameplay: Matches (Focus Game Flow)", focus: "Understand when to engage, disengage, and reset for your role." }
                ]},
                2: { title: "Day 2: Decision Making", tasks: [
                    { id: "w2d2t1", text: "Warm-up Routine" },
                    { id: "w2d2t2", text: "Gameplay: Matches (Decision Focus)", focus: "Make deliberate decisions based on game state and role responsibilities." }
                ]},
                3: { title: "Day 3: Team Coordination", tasks: [
                    { id: "w2d3t1", text: "Warm-up Routine" },
                    { id: "w2d3t2", text: "Gameplay: Matches (Team Focus)", focus: "Coordinate with teammates and fulfill your role's team function." }
                ]},
                4: { title: "Day 4: Mid-Week Review", tasks: [
                    { id: "w2d4t1", text: "Warm-up Routine" },
                    { id: "w2d4t2", text: "VOD Review: Game Sense Analysis", focus: "Review decision-making and game sense from recent matches." }
                ]},
                5: { title: "Day 5: Implementation", tasks: [
                    { id: "w2d5t1", text: "Warm-up Routine" },
                    { id: "w2d5t2", text: "Gameplay: Matches (Apply Lessons)", focus: "Implement improved decision-making in live games." }
                ]},
                6: { title: "Day 6: Knowledge Building", tasks: [
                    { id: "w2d6t1", text: "Warm-up Routine" },
                    { id: "w2d6t2", text: "Learning: Advanced Concepts", focus: "Study advanced concepts relevant to your role." }
                ]}
            }
        },
        3: {
            title: "Communication & Team Coordination",
            focus: "Develop communication skills and team coordination abilities.",
            days: {
                1: { title: "Day 1: Communication Basics", tasks: [
                    { id: "w3d1t1", text: "Warm-up Routine" },
                    { id: "w3d1t2", text: "Gameplay: Matches (Communication Focus)", focus: "Practice clear, useful callouts for your role." }
                ]},
                2: { title: "Day 2: Team Coordination", tasks: [
                    { id: "w3d2t1", text: "Warm-up Routine" },
                    { id: "w3d2t2", text: "Gameplay: Matches (Team Play)", focus: "Coordinate plays and support teammates effectively." }
                ]},
                3: { title: "Day 3: Leadership Development", tasks: [
                    { id: "w3d3t1", text: "Warm-up Routine" },
                    { id: "w3d3t2", text: "Gameplay: Matches (Leadership)", focus: "Take initiative in communication and team coordination." }
                ]},
                4: { title: "Day 4: Communication Review", tasks: [
                    { id: "w3d4t1", text: "Warm-up Routine" },
                    { id: "w3d4t2", text: "Self-Review: Communication Analysis", focus: "Evaluate the effectiveness of your communication." }
                ]},
                5: { title: "Day 5: Apply Feedback", tasks: [
                    { id: "w3d5t1", text: "Warm-up Routine" },
                    { id: "w3d5t2", text: "Gameplay: Matches (Improved Communication)", focus: "Apply communication improvements identified." }
                ]},
                6: { title: "Day 6: Team Building", tasks: [
                    { id: "w3d6t1", text: "Warm-up Routine" },
                    { id: "w3d6t2", text: "Community: Team Building", focus: "Build relationships with consistent teammates." }
                ]}
            }
        },
        4: {
            title: "Advanced Techniques & Mastery",
            focus: "Refine advanced techniques and achieve mastery in your role.",
            days: {
                1: { title: "Day 1: Advanced Mechanics", tasks: [
                    { id: "w4d1t1", text: "Warm-up Routine" },
                    { id: "w4d1t2", text: "Practice: Advanced Techniques (15 mins)", focus: "Work on advanced mechanics specific to your role." },
                    { id: "w4d1t3", text: "Gameplay: Ranked (Apply Advanced Tech)", focus: "Implement advanced techniques in live games." }
                ]},
                2: { title: "Day 2: Hero Pool Expansion", tasks: [
                    { id: "w4d2t1", text: "Warm-up Routine" },
                    { id: "w4d2t2", text: "Gameplay: Secondary Heroes", focus: "Practice with backup heroes in your role." }
                ]},
                3: { title: "Day 3: High-Level Practice", tasks: [
                    { id: "w4d3t1", text: "Warm-up Routine" },
                    { id: "w4d3t2", text: "Gameplay: Scrims or High-Level Practice", focus: "Engage in high-level practice scenarios." }
                ]},
                4: { title: "Day 4: Performance Analysis", tasks: [
                    { id: "w4d4t1", text: "Warm-up Routine" },
                    { id: "w4d4t2", text: "VOD Review: High-Level Analysis", focus: "Analyze performance in challenging scenarios." }
                ]},
                5: { title: "Day 5: Targeted Improvement", tasks: [
                    { id: "w4d5t1", text: "Warm-up Routine" },
                    { id: "w4d5t2", text: "Targeted Practice: Weakness Focus", focus: "Focus on specific areas needing improvement." },
                    { id: "w4d5t3", text: "Gameplay: Full Integration", focus: "Combine all learned skills in competitive play." }
                ]},
                6: { title: "Day 6: Knowledge & Recovery", tasks: [
                    { id: "w4d6t1", text: "Warm-up Routine (Light)" },
                    { id: "w4d6t2", text: "Learning: Strategy Study", focus: "Study advanced strategies and meta developments." }
                ]}
            }
        },
        5: {
            title: "Competitive Preparation",
            focus: "Prepare for high-level competitive play and team coordination.",
            days: {
                1: { title: "Day 1: Team Strategy", tasks: [
                    { id: "w5d1t1", text: "Warm-up Routine" },
                    { id: "w5d1t2", text: "Team Practice: Strategy Development", focus: "Develop and practice team strategies." }
                ]},
                2: { title: "Day 2: Role Integration", tasks: [
                    { id: "w5d2t1", text: "Warm-up Routine" },
                    { id: "w5d2t2", text: "Team Practice: Role Coordination", focus: "Perfect your role within team compositions." }
                ]},
                3: { title: "Day 3: Tournament Simulation", tasks: [
                    { id: "w5d3t1", text: "Team Warm-up" },
                    { id: "w5d3t2", text: "Team Practice: Match Simulation", focus: "Simulate tournament conditions and pressure." }
                ]},
                4: { title: "Day 4: Problem Solving", tasks: [
                    { id: "w5d4t1", text: "Warm-up Routine" },
                    { id: "w5d4t2", text: "Targeted Practice: Scenario Training", focus: "Practice solutions to common competitive problems." }
                ]},
                5: { title: "Day 5: Mental Preparation", tasks: [
                    { id: "w5d5t1", text: "Warm-up Routine (Light)" },
                    { id: "w5d5t2", text: "Light Practice: Maintenance", focus: "Maintain skills while focusing on mental preparation." },
                    { id: "w5d5t3", text: "Review: Strategy Preparation", focus: "Review team strategies and prepare mentally." }
                ]},
                6: { title: "Day 6: Final Preparation", tasks: [
                    { id: "w5d6t1", text: "Warm-up Routine (Brief)" },
                    { id: "w5d6t2", text: "Mental Preparation: Visualization", focus: "Visualize success and prepare mentally for competition." },
                    { id: "w5d6t3", text: "Logistics: Competition Setup", focus: "Ensure all technical and logistical preparation is complete." }
                ]}
            }
        },
        6: {
            title: "Tournament Execution & Development",
            focus: "Execute in competitive settings and plan continued improvement.",
            days: {
                1: { title: "Day 1: Competition Day", tasks: [
                    { id: "w6d1t1", text: "Competition Warm-up", focus: "Execute proper warm-up routine for peak performance." },
                    { id: "w6d1t2", text: "Tournament Match", focus: "Execute all trained skills in competitive setting." },
                    { id: "w6d1t3", text: "Post-Match: Quick Analysis", focus: "Brief analysis of performance and key takeaways." }
                ]},
                2: { title: "Day 2: Performance Review", tasks: [
                    { id: "w6d2t1", text: "Warm-up Routine" },
                    { id: "w6d2t2", text: "VOD Review: Competition Analysis", focus: "Detailed analysis of competitive performance." },
                    { id: "w6d2t3", text: "Improvement Planning", focus: "Plan specific improvements for next training cycle." }
                ]},
                3: { title: "Day 3: Skill Refinement", tasks: [
                    { id: "w6d3t1", text: "Warm-up Routine" },
                    { id: "w6d3t2", text: "Targeted Practice: Weakness Focus", focus: "Address specific weaknesses identified in competition." }
                ]},
                4: { title: "Day 4: Knowledge Expansion", tasks: [
                    { id: "w6d4t1", text: "Warm-up Routine" },
                    { id: "w6d4t2", text: "Learning: Advanced Study", focus: "Study advanced concepts and meta developments." }
                ]},
                5: { title: "Day 5: Goal Setting", tasks: [
                    { id: "w6d5t1", text: "Warm-up Routine" },
                    { id: "w6d5t2", text: "Self-Reflection: Progress Review", focus: "Review progress and identify areas for continued growth." },
                    { id: "w6d5t3", text: "Planning: Next Phase", focus: "Plan next training cycle and competitive goals." }
                ]},
                6: { title: "Day 6: Flexibility & Community", tasks: [
                    { id: "w6d6t1", text: "Warm-up Routine (as needed)" },
                    { id: "w6d6t2", text: "Flexible Practice: Adapt to Needs", focus: "Adapt based on current needs and schedule." },
                    { id: "w6d6t3", text: "Community: Knowledge Sharing", focus: "Share knowledge and maintain competitive relationships." }
                ]}
            }
        }
    };
}

function getDefaultResourcesData() {
    return {
        youtubersCoaches: [
            { name: "Spilo (All Roles Coaching)", url: "https://www.youtube.com/@CoachSpilo", note: "General positioning and game sense coaching." },
            { name: "ioStux (Hero Guides)", url: "https://www.youtube.com/@ioStux", note: "In-depth hero guides for all roles." },
            { name: "KarQ (Tips for Every Hero)", url: "https://www.youtube.com/@KarQ", note: "Quick tips and hero interactions." },
            { name: "SVB (Analytical Content)", url: "https://www.youtube.com/@SVBOW", note: "Analytical content and meta discussions." },
            { name: "GameLeap (Advanced Guides)", url: "https://www.gameleap.com/overwatch", note: "Subscription-based advanced content." }
        ],
        communitiesDiscords: [
            { name: "r/CompetitiveOverwatch Discord", url: "https://discord.gg/competitiveoverwatch", note: "Hub for discussions and LFG." },
            { name: "Overwatch University Discord", url: "https://discord.gg/overwatchuniversity", note: "Advice, VOD reviews, LFG." },
            { name: "Overwatch Scrim Finder", url: "#", note: "Find scrim partners and practice teams." },
            { name: "FACEIT Overwatch Hub", url: "https://www.faceit.com/en", note: "FACEIT platform for leagues and PUGs." }
        ],
        toolsWebsites: [
            { name: "Overbuff", url: "https://www.overbuff.com/", note: "Stat tracking for public profiles." },
            { name: "Omnic.ai", url: "https://omnic.ai/", note: "AI-powered gameplay analysis." },
            { name: "KovaaK's FPS Aim Trainer", url: "https://store.steampowered.com/app/824270/KovaaKs_FPS_Aim_Trainer/", note: "Professional aim training." },
            { name: "Aim Lab", url: "https://store.steampowered.com/app/714010/Aim_Lab/", note: "Free aim trainer with Overwatch scenarios." }
        ]
    };
}

function getCombinedProgramData(selectedRoles) {
    // For multiple roles, merge the program data intelligently
    const roleProgramData = {
        'Tank': tankProgramData,
        'Damage': dpsProgramData,
        'Support': supportProgramData
    };
    
    // Start with default structure and merge role-specific content
    const combinedData = JSON.parse(JSON.stringify(getDefaultProgramData()));
    
    // For now, return default data but could be enhanced to merge specific tasks
    return combinedData;
}

function getCombinedResourcesData(selectedRoles) {
    const roleResourcesData = {
        'Tank': tankResourcesData,
        'Damage': dpsResourcesData,
        'Support': supportResourcesData
    };
    
    let combinedResources = JSON.parse(JSON.stringify(getDefaultResourcesData()));
    
    // Merge resources from selected roles
    selectedRoles.forEach(role => {
        if (roleResourcesData[role]) {
            const roleResources = roleResourcesData[role];
            
            // Merge youtubers/coaches
            combinedResources.youtubersCoaches = [
                ...combinedResources.youtubersCoaches,
                ...roleResources.youtubersCoaches
            ];
            
            // Merge communities
            if (roleResources.communitiesDiscords) {
                combinedResources.communitiesDiscords = [
                    ...combinedResources.communitiesDiscords,
                    ...roleResources.communitiesDiscords
                ];
            }
            
            // Merge tools
            if (roleResources.toolsWebsites) {
                combinedResources.toolsWebsites = [
                    ...combinedResources.toolsWebsites,
                    ...roleResources.toolsWebsites
                ];
            }
        }
    });
    
    // Remove duplicates based on URL
    combinedResources.youtubersCoaches = removeDuplicatesByUrl(combinedResources.youtubersCoaches);
    combinedResources.communitiesDiscords = removeDuplicatesByUrl(combinedResources.communitiesDiscords);
    combinedResources.toolsWebsites = removeDuplicatesByUrl(combinedResources.toolsWebsites);
    
    return combinedResources;
}

function removeDuplicatesByUrl(items) {
    const seen = new Set();
    return items.filter(item => {
        if (seen.has(item.url)) {
            return false;
        }
        seen.add(item.url);
        return true;
    });
}

export function getTotalDaysInWeek(weekNumber) {
    const programData = getProgramData();
    const weekData = programData[weekNumber];
    return (weekData && weekData.days) ? Object.keys(weekData.days).length : 0;
}
