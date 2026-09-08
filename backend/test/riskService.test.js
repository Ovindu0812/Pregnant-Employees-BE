const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateRisk, classifyScore } = require('../src/services/riskService');
const { generateRecommendations } = require('../src/services/recommendationService');

const baseInput = {
  workingHours: 8,
  prolongedStanding: false,
  heavyLifting: false,
  chemicalExposure: false,
  workplaceStress: false,
  repetitiveMovement: false,
  nightShift: false,
  environmentalHazards: false,
};

test('classifies documented score boundaries', () => {
  assert.equal(classifyScore(0), 'LOW');
  assert.equal(classifyScore(2), 'LOW');
  assert.equal(classifyScore(3), 'MEDIUM');
  assert.equal(classifyScore(5), 'MEDIUM');
  assert.equal(classifyScore(6), 'HIGH');
});

test('calculates category and total scores transparently', () => {
  const result = calculateRisk({
    ...baseInput,
    workingHours: 9,
    prolongedStanding: true,
    heavyLifting: true,
    workplaceStress: true,
    repetitiveMovement: true,
  });
  assert.deepEqual(result.scores, { physical: 3, ergonomic: 2, environmental: 0, psychological: 1 });
  assert.equal(result.totalScore, 6);
  assert.equal(result.riskLevel, 'HIGH');
});

test('generates only rules relevant to detected inputs', () => {
  const recommendations = generateRecommendations({ ...baseInput, prolongedStanding: true });
  assert.equal(recommendations.length, 1);
  assert.equal(recommendations[0].category, 'physical');
});
