// Prototype research rules only. They are not a clinically validated model and
// must be revised using research evidence and qualified expert review.
const SCORE_WEIGHTS = Object.freeze({
  prolongedStanding: 1,
  heavyLifting: 2,
  chemicalExposure: 2,
  workplaceStress: 1,
  repetitiveMovement: 1,
  nightShift: 1,
  environmentalHazards: 2,
  veryLongWorkingHours: 1,
});

const classifyScore = (score) => {
  if (score <= 2) return 'LOW';
  if (score <= 5) return 'MEDIUM';
  return 'HIGH';
};

const calculateRisk = (input) => {
  const scores = {
    physical:
      (input.prolongedStanding ? SCORE_WEIGHTS.prolongedStanding : 0)
      + (input.heavyLifting ? SCORE_WEIGHTS.heavyLifting : 0),
    ergonomic:
      (input.repetitiveMovement ? SCORE_WEIGHTS.repetitiveMovement : 0)
      + (input.workingHours > 8 ? SCORE_WEIGHTS.veryLongWorkingHours : 0),
    environmental:
      (input.chemicalExposure ? SCORE_WEIGHTS.chemicalExposure : 0)
      + (input.environmentalHazards ? SCORE_WEIGHTS.environmentalHazards : 0),
    psychological:
      (input.workplaceStress ? SCORE_WEIGHTS.workplaceStress : 0)
      + (input.nightShift ? SCORE_WEIGHTS.nightShift : 0),
  };
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return {
    scores,
    totalScore,
    riskLevel: classifyScore(totalScore),
    categories: Object.fromEntries(
      Object.entries(scores).map(([category, score]) => [category, classifyScore(score)]),
    ),
  };
};

module.exports = { SCORE_WEIGHTS, classifyScore, calculateRisk };
