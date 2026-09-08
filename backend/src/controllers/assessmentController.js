const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { assessmentToApi } = require('../utils/mappers');
const { success } = require('../utils/response');
const { calculateRisk } = require('../services/riskService');
const { GENERAL_NOTICE, generateRecommendations } = require('../services/recommendationService');

const createAssessment = asyncHandler(async (req, res) => {
  const input = req.validatedBody;
  const result = calculateRisk(input);
  const row = {
    user_id: req.user.id,
    pregnancy_stage: input.pregnancyStage,
    occupation: input.occupation,
    working_hours: input.workingHours,
    prolonged_standing: input.prolongedStanding,
    heavy_lifting: input.heavyLifting,
    chemical_exposure: input.chemicalExposure,
    workplace_stress: input.workplaceStress,
    repetitive_movement: input.repetitiveMovement,
    night_shift: input.nightShift,
    environmental_hazards: input.environmentalHazards,
    physical_risk_score: result.scores.physical,
    ergonomic_risk_score: result.scores.ergonomic,
    environmental_risk_score: result.scores.environmental,
    psychological_risk_score: result.scores.psychological,
    total_score: result.totalScore,
    risk_level: result.riskLevel,
  };

  const { data, error } = await req.supabase.from('risk_assessments').insert(row).select('*').single();
  if (error) throw new ApiError(400, 'Assessment could not be saved.');

  const assessment = assessmentToApi(data);
  assessment.categories = result.categories;
  return success(res, 201, {
    assessment,
    recommendations: generateRecommendations(input),
    notice: GENERAL_NOTICE,
  });
});

const listAssessments = asyncHandler(async (req, res) => {
  const { data, error } = await req.supabase
    .from('risk_assessments')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) throw new ApiError(400, 'Assessments could not be loaded.');
  return success(res, 200, { assessments: data.map(assessmentToApi) });
});

const getAssessment = asyncHandler(async (req, res) => {
  let query = req.supabase.from('risk_assessments').select('*').eq('id', req.params.id);
  if (req.profile.role !== 'admin') query = query.eq('user_id', req.user.id);
  const { data, error } = await query.maybeSingle();
  if (error) throw new ApiError(400, 'Assessment could not be loaded.');
  if (!data) throw new ApiError(404, 'Assessment not found.');
  return success(res, 200, { assessment: assessmentToApi(data) });
});

module.exports = { createAssessment, listAssessments, getAssessment };
