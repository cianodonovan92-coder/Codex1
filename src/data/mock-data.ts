import { Difficulty, Scenario } from "@/lib/types";

export const scenarioCatalog: Scenario[] = [
  {
    id: "mf-press-01",
    title: "Central Press Escape",
    description: "Receive on the half-turn as two defenders collapse the center lane.",
    pressureLevel: "Chaos",
    estimatedDecisionTime: "2.4s",
    sport: "football/soccer",
    role: "midfielder",
    actions: [
      {
        id: "safe-left",
        label: "Safe pass left",
        risk: "Low",
        successRate: 92,
        expectedValue: 54,
        coachNote: "Stabilizes possession but limits attacking leverage."
      },
      {
        id: "line-break",
        label: "Line-breaking pass forward",
        risk: "High",
        successRate: 67,
        expectedValue: 91,
        eliteRecommended: true,
        coachNote: "Best option when body shape and timing align with the runner."
      },
      {
        id: "dribble-turn",
        label: "Dribble turn",
        risk: "Moderate",
        successRate: 73,
        expectedValue: 68,
        coachNote: "Useful if nearest defender over-commits."
      },
      {
        id: "switch-play",
        label: "Switch play",
        risk: "Moderate",
        successRate: 81,
        expectedValue: 74,
        coachNote: "Good release valve with delayed defensive recovery."
      }
    ]
  },
  {
    id: "mf-build-02",
    title: "Final Third Entry",
    description: "Progress from midfield into Zone 14 while the backline holds compact shape.",
    pressureLevel: "Match Intensity",
    estimatedDecisionTime: "3.1s",
    sport: "football/soccer",
    role: "midfielder",
    actions: []
  },
  {
    id: "mf-transition-03",
    title: "Counter Control",
    description: "Manage transition after turnover with runners ahead and pressure behind.",
    pressureLevel: "Match Intensity",
    estimatedDecisionTime: "2.8s",
    sport: "football/soccer",
    role: "midfielder",
    actions: []
  }
];

export const difficultyWeights: Record<Difficulty, number> = {
  easy: 0.85,
  medium: 1,
  elite: 1.15
};

export const playerProfile = {
  name: "Alex Mercer",
  team: "Academy First Team",
  role: "Midfielder",
  age: 21,
  dominantFoot: "Right",
  sessionsThisMonth: 14
};

export const historicalMetrics = [
  { session: "S1", reaction: 2.9, quality: 71, hesitation: 44, pressure: 63 },
  { session: "S2", reaction: 2.7, quality: 75, hesitation: 39, pressure: 67 },
  { session: "S3", reaction: 2.5, quality: 79, hesitation: 36, pressure: 71 },
  { session: "S4", reaction: 2.3, quality: 84, hesitation: 29, pressure: 77 },
  { session: "S5", reaction: 2.2, quality: 86, hesitation: 26, pressure: 82 }
];

export const recommendations = [
  "Introduce 3v2 transition constraints to reward early scanning before receiving.",
  "Run one-touch progression drills with blindside triggers to reduce hesitation under back pressure.",
  "Increase elite repetitions where forward lane closes late, reinforcing high-value pass selection."
];
