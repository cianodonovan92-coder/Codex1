import { difficultyWeights } from "@/data/mock-data";
import { Difficulty, ScenarioAction, SessionResult } from "@/lib/types";

export function evaluateDecision(params: {
  scenarioId: string;
  action: ScenarioAction;
  decisionMs: number;
  hesitationMs: number;
  difficulty: Difficulty;
}): SessionResult {
  const { action, decisionMs, hesitationMs, difficulty, scenarioId } = params;
  const speedScore = Math.max(20, 100 - decisionMs / 32);
  const hesitationPenalty = hesitationMs / 20;
  const riskModifier = action.risk === "High" ? 12 : action.risk === "Moderate" ? 6 : 0;
  const baseQuality = action.expectedValue * 0.7 + action.successRate * 0.3;
  const weighted = (baseQuality + speedScore + riskModifier - hesitationPenalty) / 2;
  const qualityScore = Math.min(98, Math.round(weighted * difficultyWeights[difficulty]));
  const pressureScore = Math.max(40, Math.round(qualityScore - hesitationPenalty / 2 + riskModifier));

  const feedback =
    action.eliteRecommended && decisionMs < 2600
      ? "Elite tempo and intent. You exploited the highest value lane before pressure converged."
      : action.risk === "Low"
        ? "Secure execution, but higher-value progression windows were available."
        : "Strong intent. Keep scanning one phase earlier to boost execution certainty.";

  return {
    scenarioId,
    actionId: action.id,
    decisionMs,
    hesitationMs,
    qualityScore,
    pressureScore,
    expectedValueCaptured: Math.round((action.expectedValue * (action.successRate / 100)) / 10),
    feedback
  };
}
