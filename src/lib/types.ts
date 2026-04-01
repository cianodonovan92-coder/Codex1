export type Sport = "football/soccer" | "basketball" | "american football";
export type Role = "midfielder" | "point guard" | "quarterback";
export type Difficulty = "easy" | "medium" | "elite";

export type ActionId = "safe-left" | "line-break" | "dribble-turn" | "switch-play";

export interface ScenarioAction {
  id: ActionId;
  label: string;
  risk: "Low" | "Moderate" | "High";
  successRate: number;
  expectedValue: number;
  coachNote: string;
  eliteRecommended?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  pressureLevel: "Controlled" | "Match Intensity" | "Chaos";
  estimatedDecisionTime: string;
  sport: Sport;
  role: Role;
  actions: ScenarioAction[];
}

export interface SessionResult {
  scenarioId: string;
  actionId: ActionId;
  decisionMs: number;
  hesitationMs: number;
  qualityScore: number;
  pressureScore: number;
  expectedValueCaptured: number;
  feedback: string;
}
