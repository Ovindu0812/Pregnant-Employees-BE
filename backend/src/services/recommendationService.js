const GENERAL_NOTICE =
  'These prototype recommendations provide general workplace information only. They are not medical diagnosis, treatment, or professional legal advice.';

const RULES = [
  ['prolongedStanding', 'physical', 'Consider reducing prolonged standing where appropriate and requesting suitable workplace adjustments.'],
  ['heavyLifting', 'physical', 'Avoid unnecessary heavy lifting and discuss safer task arrangements with the relevant workplace professional.'],
  ['chemicalExposure', 'environmental', 'Review chemical safety information and discuss exposure controls or alternative duties with the appropriate workplace safety contact.'],
  ['workplaceStress', 'psychological', 'Consider discussing workload, breaks, and available workplace support arrangements.'],
  ['repetitiveMovement', 'ergonomic', 'Consider regular task changes, suitable breaks, and an ergonomic review of repetitive work.'],
  ['nightShift', 'psychological', 'Consider discussing shift patterns and suitable scheduling adjustments with the employer.'],
  ['environmentalHazards', 'environmental', 'Report identified environmental hazards and request a workplace safety review before continuing affected tasks.'],
];

const generateRecommendations = (input) => {
  const recommendations = RULES.filter(([field]) => input[field]).map(([, category, description]) => ({
    category,
    description,
  }));

  if (input.workingHours > 8) {
    recommendations.push({
      category: 'ergonomic',
      description: 'Consider discussing working hours, adequate rest breaks, and task scheduling with the employer.',
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      category: 'general',
      description: 'Continue monitoring workplace conditions and report new concerns through appropriate workplace channels.',
    });
  }

  return recommendations;
};

module.exports = { GENERAL_NOTICE, generateRecommendations };
