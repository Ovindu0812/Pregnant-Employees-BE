const assessmentToApi = (row) => ({
  id: row.id,
  userId: row.user_id,
  pregnancyStage: row.pregnancy_stage,
  occupation: row.occupation,
  workingHours: row.working_hours,
  prolongedStanding: row.prolonged_standing,
  heavyLifting: row.heavy_lifting,
  chemicalExposure: row.chemical_exposure,
  workplaceStress: row.workplace_stress,
  repetitiveMovement: row.repetitive_movement,
  nightShift: row.night_shift,
  environmentalHazards: row.environmental_hazards,
  scores: {
    physical: row.physical_risk_score,
    ergonomic: row.ergonomic_risk_score,
    environmental: row.environmental_risk_score,
    psychological: row.psychological_risk_score,
  },
  totalScore: row.total_score,
  riskLevel: row.risk_level,
  createdAt: row.created_at,
});

const profileToApi = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  phone: row.phone,
  occupation: row.occupation,
  workplace: row.workplace,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

module.exports = { assessmentToApi, profileToApi };
