const { getPublicClient } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { constants } = require('../middleware/validationMiddleware');
const { GENERAL_NOTICE } = require('../services/recommendationService');

const listRecommendations = asyncHandler(async (req, res) => {
  let query = getPublicClient().from('recommendations').select('*').eq('active', true).order('category');
  if (req.query.riskLevel) {
    const level = String(req.query.riskLevel).toUpperCase();
    if (!constants.RISK_LEVELS.includes(level)) throw new ApiError(400, 'Invalid riskLevel filter.');
    query = query.eq('risk_level', level);
  }
  if (req.query.category) query = query.eq('category', String(req.query.category).slice(0, 80));
  const { data, error } = await query;
  if (error) throw new ApiError(400, 'Recommendations could not be loaded.');
  return success(res, 200, { recommendations: data, notice: GENERAL_NOTICE });
});

const getRecommendation = asyncHandler(async (req, res) => {
  const { data, error } = await getPublicClient()
    .from('recommendations').select('*').eq('id', req.params.id).eq('active', true).maybeSingle();
  if (error) throw new ApiError(400, 'Recommendation could not be loaded.');
  if (!data) throw new ApiError(404, 'Recommendation not found.');
  return success(res, 200, { recommendation: data, notice: GENERAL_NOTICE });
});

module.exports = { listRecommendations, getRecommendation };
