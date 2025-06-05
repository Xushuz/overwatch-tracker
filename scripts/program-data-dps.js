// DPS-specific training program data (generalized for all DPS heroes)

export const dpsProgramData = {
    1: {
        title: "DPS Fundamentals & Positioning Mastery",
        focus: "Establish a baseline of your play and master the fundamentals of DPS positioning (High Ground, Angles, Cover, Range).",
        days: {
            1: {
                title: "Day 1: Assessment & Baseline",
                tasks: [
                    { id: "w1d1t1", text: "Warm-up: Aim Trainer (10 mins)", focus: "Track scores (accuracy, reaction time) for your hero type." },
                    { id: "w1d1t2", text: "Warm-up: Hero-specific Practice (5 mins)", focus: "Hitscan: tracking, flick shots. Projectile: prediction, arc timing. Beam: tracking, range management." },
                    { id: "w1d1t3", text: "Warm-up: Deathmatch or Aim Duel (5–10 mins)", focus: "Live-fire mindset, optimal damage combos for your hero." },
                    { id: "w1d1t4", text: "Gameplay: 3–4 Competitive Matches (Benchmark)", focus: "Play normally. Apply basic positioning (high ground, cover). Track eliminations and damage per game." },
                    { id: "w1d1t5", text: "Self-Review: Watch one replay (10 mins)", focus: "Catch positioning errors and missed damage opportunities from today's games." }
                ]
            },
            2: {
                title: "Day 2: Cover Usage & Safe Positioning",
                tasks: [
                    { id: "w1d2t1", text: "Warm-up Routine" },
                    { id: "w1d2t2", text: "Gameplay: Matches (Focus on Cover)", focus: "Prioritize staying alive by using cover between engagements. Minimize unnecessary risk." },
                    { id: "w1d2t3", text: "Learning: Watch 'DPS Positioning Guide'", focus: "Note at least 3 actionable positioning tips for your hero type." }
                ]
            },
            3: {
                title: "Day 3: High Ground Control & Off-Angles",
                tasks: [
                    { id: "w1d3t1", text: "Warm-up Routine (Try different aim drill)" },
                    { id: "w1d3t2", text: "Gameplay: Matches (High Ground/Off-Angles)", focus: "Consciously take high ground and off-angles. Communicate your position to team." },
                    { id: "w1d3t3", text: "Quick Review: One Teamfight Death", focus: "Was your positioning a factor? Could better angles have prevented it?" }
                ]
            },
            4: {
                title: "Day 4: Deep Self-Review (Positioning Analysis)",
                tasks: [
                    { id: "w1d4t1", text: "Warm-up Routine" },
                    { id: "w1d4t2", text: "VOD Review: Full Replay (Positioning Focus)", focus: "Review one full replay. Identify 3+ instances of poor positioning and think of better alternatives." }
                ]
            },
            5: {
                title: "Day 5: Apply Positioning Corrections",
                tasks: [
                    { id: "w1d5t1", text: "Warm-up Routine" },
                    { id: "w1d5t2", text: "Gameplay: Matches (Focus on Corrections)", focus: "Don't repeat positioning mistakes identified yesterday. Practice new positioning habits." }
                ]
            },
            6: {
                title: "Day 6: Lighter Day / Reinforce Concepts",
                tasks: [
                    { id: "w1d6t1", text: "Warm-up Routine" },
                    { id: "w1d6t2", text: "Practice/Learning: Deathmatch or Pro VODs", focus: "Practice aim/movement tech or watch pro VODs for positioning inspiration." }
                ]
            }
        }
    },
    2: {
        title: "Game Sense, Target Priority & Decision-Making",
        focus: "Improve understanding of target priority, ultimate economies, and making smart damage decisions mid-fight.",
        days: {
            1: {
                title: "Day 1: Ultimate Tracking & Economy",
                tasks: [
                    { id: "w2d1t1", text: "Warm-up Routine" },
                    { id: "w2d1t2", text: "Gameplay: Matches (Focus Ult Tracking)", focus: "Track enemy ultimates. Communicate predictions. Play around ultimate advantages." }
                ]
            },
            2: {
                title: "Day 2: Target Priority & Focus Fire",
                tasks: [
                    { id: "w2d2t1", text: "Warm-up Routine" },
                    { id: "w2d2t2", text: "Gameplay: Matches (Target Priority)", focus: "Focus fire priority targets: low health enemies, supports out of position, key threats." }
                ]
            },
            3: {
                title: "Day 3: Cooldown Tracking & Engagement Timing",
                tasks: [
                    { id: "w2d3t1", text: "Warm-up Routine" },
                    { id: "w2d3t2", text: "Gameplay: Matches (Cooldown Focus)", focus: "Track enemy defensive cooldowns. Time your aggression around them." },
                    { id: "w2d3t3", text: "Quick Review: One Death Analysis", focus: "Did you die to a cooldown you should have tracked?" }
                ]
            },
            4: {
                title: "Day 4: Mid-Week Game Sense Review",
                tasks: [
                    { id: "w2d4t1", text: "Warm-up Routine" },
                    { id: "w2d4t2", text: "VOD Review: Replay (Game Sense Focus)", focus: "Check for tunnel vision, missed opportunities, poor target selection. Compare to pro DPS play." }
                ]
            },
            5: {
                title: "Day 5: Implement Lessons - Broad Awareness",
                tasks: [
                    { id: "w2d5t1", text: "Warm-up Routine" },
                    { id: "w2d5t2", text: "Gameplay: Matches (Full Awareness)", focus: "Check scoreboard, killfeed, look for flanks. Track ultimates. Understand win conditions." }
                ]
            },
            6: {
                title: "Day 6: Knowledge Reinforcement",
                tasks: [
                    { id: "w2d6t1", text: "Warm-up Routine" },
                    { id: "w2d6t2", text: "Learning: Educational Content", focus: "Study hero matchups, damage thresholds, and optimal engagement ranges." },
                    { id: "w2d6t3", text: "Self-Assessment: Performance Journal", focus: "Track damage/game, eliminations/game, deaths/game trends." }
                ]
            }
        }
    },
    3: {
        title: "Communication and Team Coordination",
        focus: "Practice effective callouts, coordinating plays, and becoming a better team player as DPS.",
        days: {
            1: {
                title: "Day 1: DPS Callout Focus",
                tasks: [
                    { id: "w3d1t1", text: "Warm-up Routine" },
                    { id: "w3d1t2", text: "Gameplay: Ranked (Vocal Comms)", focus: "Call low health enemies, flanker positions, and your damage focus targets." }
                ]
            },
            2: {
                title: "Day 2: Team Play Coordination",
                tasks: [
                    { id: "w3d2t1", text: "Warm-up Routine" },
                    { id: "w3d2t2", text: "Gameplay: Coordinated Engagements", focus: "Coordinate with tank engagements. Follow up on team callouts and focus fire." }
                ]
            },
            3: {
                title: "Day 3: Ultimate Coordination Focus",
                tasks: [
                    { id: "w3d3t1", text: "Warm-up Routine" },
                    { id: "w3d3t2", text: "Gameplay: Matches (Ult Coordination)", focus: "Coordinate DPS ultimates with team setups. Call your ultimate plans." }
                ]
            },
            4: {
                title: "Day 4: Communication Review",
                tasks: [
                    { id: "w3d4t1", text: "Warm-up Routine" },
                    { id: "w3d4t2", text: "Self-Review: Communication Analysis", focus: "Evaluate your callouts: useful information, clear communication, good timing?" }
                ]
            },
            5: {
                title: "Day 5: Apply Communication Feedback",
                tasks: [
                    { id: "w3d5t1", text: "Warm-up Routine" },
                    { id: "w3d5t2", text: "Gameplay: Matches (Apply Feedback)", focus: "Improve specific communication areas identified. Practice duo/trio coordination." }
                ]
            },
            6: {
                title: "Day 6: Community & Team Building",
                tasks: [
                    { id: "w3d6t1", text: "Warm-up Routine" },
                    { id: "w3d6t2", text: "Community Engagement", focus: "Find scrim partners, join DPS Discord communities, practice with consistent teammates." }
                ]
            }
        }
    },
    4: {
        title: "Advanced DPS Techniques & Hero Mastery",
        focus: "Refine advanced techniques for your hero pool and apply everything in higher-level competitive play.",
        days: {
            1: {
                title: "Day 1: Hero-Specific Optimization",
                tasks: [
                    { id: "w4d1t1", text: "Warm-up Routine" },
                    { id: "w4d1t2", text: "Practice: Advanced Mechanics (15 mins)", focus: "Hitscan: flick accuracy, tracking smoothness. Projectile: prediction, lead timing. Beam: range optimization." },
                    { id: "w4d1t3", text: "Gameplay: Ranked (Apply Advanced Tech)", focus: "Consciously apply advanced techniques with your main heroes." }
                ]
            },
            2: {
                title: "Day 2: Hero Pool Diversification",
                tasks: [
                    { id: "w4d2t1", text: "Warm-up Routine" },
                    { id: "w4d2t2", text: "Gameplay: Matches on Secondary Heroes", focus: "Play backup DPS heroes. Focus on fundamentals and team coordination." }
                ]
            },
            3: {
                title: "Day 3: High-Level Practice",
                tasks: [
                    { id: "w4d3t1", text: "Warm-up Routine" },
                    { id: "w4d3t2", text: "Gameplay: Scrim or High-Level Practice", focus: "Arrange scrims or high-level customs. Heavy communication and teamwork focus." }
                ]
            },
            4: {
                title: "Day 4: Performance Analysis",
                tasks: [
                    { id: "w4d4t1", text: "Warm-up Routine" },
                    { id: "w4d4t2", text: "VOD Review: High-Level Games", focus: "Review scrims or high-level matches. Identify areas punished at higher skill levels." }
                ]
            },
            5: {
                title: "Day 5: Weakness-Focused Practice",
                tasks: [
                    { id: "w4d5t1", text: "Warm-up Routine" },
                    { id: "w4d5t2", text: "Targeted Practice: Custom Games/Deathmatch", focus: "Focus on specific mechanical or positioning weaknesses identified." },
                    { id: "w4d5t3", text: "Gameplay: Comp (Full Skill Integration)", focus: "Bring together all learned skills: aim, positioning, communication, game sense." }
                ]
            },
            6: {
                title: "Day 6: Recovery & Strategy",
                tasks: [
                    { id: "w4d6t1", text: "Warm-up Routine (Light)" },
                    { id: "w4d6t2", text: "Learning/Relaxation: Theory or Fun Modes", focus: "Study meta strategies, watch tournament VODs, or play relaxed modes." }
                ]
            }
        }
    },
    5: {
        title: "Competitive Preparation & Team Synergy",
        focus: "Build team synergy, learn tournament strategies, and prepare for competitive team play.",
        days: {
            1: {
                title: "Day 1: Team Strategy & Combos",
                tasks: [
                    { id: "w5d1t1", text: "Warm-up Routine" },
                    { id: "w5d1t2", text: "Team Practice: Ultimate Combos", focus: "Practice DPS ultimate combinations with team setups and tank/support ultimates." }
                ]
            },
            2: {
                title: "Day 2: Adapt to Team Rhythm",
                tasks: [
                    { id: "w5d2t1", text: "Warm-up Routine" },
                    { id: "w5d2t2", text: "Team Practice: Team-Focused Play", focus: "Adapt individual DPS style to complement team's pace and strategy." }
                ]
            },
            3: {
                title: "Day 3: Tournament Simulation",
                tasks: [
                    { id: "w5d3t1", text: "Team Warm-up (Optional)" },
                    { id: "w5d3t2", text: "Team Practice: Match Simulation", focus: "Simulate tournament conditions with proper map drafts and format." }
                ]
            },
            4: {
                title: "Day 4: Strategic Problem Solving",
                tasks: [
                    { id: "w5d4t1", text: "Warm-up Routine" },
                    { id: "w5d4t2", text: "Targeted Practice: Specific Scenarios", focus: "Address team weaknesses: anti-dive, dealing with specific enemy comps, map-specific strategies." }
                ]
            },
            5: {
                title: "Day 5: Mental Preparation",
                tasks: [
                    { id: "w5d5t1", text: "Warm-up Routine (Light)" },
                    { id: "w5d5t2", text: "Light Practice: Stay Sharp", focus: "Light practice to maintain form while focusing on mental preparation." },
                    { id: "w5d5t3", text: "Review/Prep: Strategy Notes", focus: "Review team strategies and enemy team information." }
                ]
            },
            6: {
                title: "Day 6: Rest & Visualization",
                tasks: [
                    { id: "w5d6t1", text: "Warm-up Routine (Brief)" },
                    { id: "w5d6t2", text: "Mental Prep: Success Visualization", focus: "Visualize successful plays and team coordination scenarios." },
                    { id: "w5d6t3", text: "Logistics: Competition Preparation", focus: "Ensure all technical and logistical aspects are ready for competition." }
                ]
            }
        }
    },
    6: {
        title: "Tournament Execution & Continuous Development",
        focus: "Perform in competitive matches and plan for continued improvement as a DPS player.",
        days: {
            1: {
                title: "Day 1: Competition Day",
                tasks: [
                    { id: "w6d1t1", text: "Competition Warm-up", focus: "Proper warm-up routine optimized for peak DPS performance." },
                    { id: "w6d1t2", text: "Tournament Match", focus: "Execute all trained skills: positioning, communication, mechanics, game sense." },
                    { id: "w6d1t3", text: "Post-Match: Team Debrief", focus: "Quick analysis of DPS performance and team coordination." }
                ]
            },
            2: {
                title: "Day 2: Performance Analysis",
                tasks: [
                    { id: "w6d2t1", text: "Warm-up Routine" },
                    { id: "w6d2t2", text: "VOD Review: Tournament Performance", focus: "Detailed analysis of DPS performance in competitive setting." },
                    { id: "w6d2t3", text: "Improvement Planning", focus: "Identify specific DPS improvement areas for next training cycle." }
                ]
            },
            3: {
                title: "Day 3: Skill Refinement",
                tasks: [
                    { id: "w6d3t1", text: "Warm-up Routine" },
                    { id: "w6d3t2", text: "Targeted Practice", focus: "Work on specific weaknesses identified in tournament analysis." }
                ]
            },
            4: {
                title: "Day 4: Advanced Learning",
                tasks: [
                    { id: "w6d4t1", text: "Warm-up Routine" },
                    { id: "w6d4t2", text: "Learning: Meta & Advanced Concepts", focus: "Study DPS meta developments, advanced techniques, professional play analysis." }
                ]
            },
            5: {
                title: "Day 5: Goal Setting & Planning",
                tasks: [
                    { id: "w6d5t1", text: "Warm-up Routine" },
                    { id: "w6d5t2", text: "Self-Reflection: Progress Review", focus: "Compare current performance to initial goals and identify growth areas." },
                    { id: "w6d5t3", text: "Planning: Next Training Phase", focus: "Outline next training cycle with specific DPS improvement goals." }
                ]
            },
            6: {
                title: "Day 6: Flexible Practice & Community",
                tasks: [
                    { id: "w6d6t1", text: "Warm-up Routine (as needed)" },
                    { id: "w6d6t2", text: "Flexible Activity: Match/Review/Rest", focus: "Adapt based on schedule: additional matches, deep review, or recovery." },
                    { id: "w6d6t3", text: "Community: Knowledge Sharing", focus: "Share experiences with DPS community and maintain competitive network." }
                ]
            }
        }
    }
};

export const dpsResourcesData = {
    youtubersCoaches: [
        { name: "Spilo (DPS Coaching)", url: "https://www.youtube.com/@CoachSpilo", note: "DPS positioning and decision-making." },
        { name: "ioStux (Hero Guides)", url: "https://www.youtube.com/@ioStux", note: "In-depth DPS hero guides and mechanics." },
        { name: "KarQ (DPS Tips)", url: "https://www.youtube.com/@KarQ", note: "Quick tips and hero matchup guides." },
        { name: "Wanted (Hitscan DPS)", url: "https://www.twitch.tv/wantedow", note: "High-level hitscan DPS gameplay." },
        { name: "Danteh (Projectile DPS)", url: "https://www.twitch.tv/danteh", note: "Professional projectile DPS gameplay." },
        { name: "Kevster (Flex DPS)", url: "https://www.twitch.tv/kevster", note: "OWL flex DPS player insights." }
    ],
    communitiesDiscords: [
        { name: "DPS Mains Discord", url: "#", note: "Community for DPS players to discuss strategies and find teams." },
        { name: "Overwatch University Discord", url: "https://discord.gg/overwatchuniversity", note: "DPS-specific channels for improvement." },
        { name: "Competitive DPS LFG", url: "#", note: "Find teams looking for DPS players." }
    ],
    toolsWebsites: [
        { name: "KovaaK's FPS Aim Trainer", url: "https://store.steampowered.com/app/824270/KovaaKs_FPS_Aim_Trainer/", note: "Professional aim training for hitscan DPS." },
        { name: "Aim Lab", url: "https://store.steampowered.com/app/714010/Aim_Lab/", note: "Free aim trainer with Overwatch-specific scenarios." },
        { name: "DPS Workshop Codes", url: "#", note: "Workshop codes for DPS-specific practice scenarios." },
        { name: "Damage Calculator Tools", url: "#", note: "Tools to calculate optimal damage combos and breakpoints." }
    ]
};

export function getTotalDaysInWeek(weekNumber) {
    const weekData = dpsProgramData[weekNumber];
    return (weekData && weekData.days) ? Object.keys(weekData.days).length : 0;
}
