const { getAdminClient } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { assessmentToApi, profileToApi } = require('../utils/mappers');
const { success } = require('../utils/response');

const count = async (table, filter) => {
  let query = getAdminClient().from(table).select('*', { count: 'exact', head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count: value, error } = await query;
  if (error) throw error;
  return value || 0;
};

const dashboard = asyncHandler(async (req, res) => {
  try {
    const [totalUsers, totalAssessments, lowRiskCount, mediumRiskCount, highRiskCount, totalFeedback] = await Promise.all([
      count('profiles'),
      count('risk_assessments'),
      count('risk_assessments', { column: 'risk_level', value: 'LOW' }),
      count('risk_assessments', { column: 'risk_level', value: 'MEDIUM' }),
      count('risk_assessments', { column: 'risk_level', value: 'HIGH' }),
      count('feedback'),
    ]);
    return success(res, 200, { dashboard: { totalUsers, totalAssessments, lowRiskCount, mediumRiskCount, highRiskCount, totalFeedback } });
  } catch {
    throw new ApiError(500, 'Dashboard data could not be loaded.');
  }
});

const listUsers = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient().from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw new ApiError(400, 'Users could not be loaded.');
  return success(res, 200, { users: data.map(profileToApi) });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient()
    .from('profiles').update(req.validatedBody).eq('id', req.params.id).select('*').maybeSingle();
  if (error) throw new ApiError(400, 'User role could not be updated.');
  if (!data) throw new ApiError(404, 'User not found.');
  return success(res, 200, { user: profileToApi(data) });
});

const listAssessments = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient().from('risk_assessments').select('*').order('created_at', { ascending: false });
  if (error) throw new ApiError(400, 'Assessments could not be loaded.');
  return success(res, 200, { assessments: data.map(assessmentToApi) });
});

const listFeedback = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient().from('feedback').select('*').order('created_at', { ascending: false });
  if (error) throw new ApiError(400, 'Feedback could not be loaded.');
  return success(res, 200, { feedback: data });
});

const listLegal = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient().from('legal_information').select('*').order('updated_at', { ascending: false });
  if (error) throw new ApiError(400, 'Legal information could not be loaded.');
  return success(res, 200, { legalInformation: data });
});

const listRecommendations = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient().from('recommendations').select('*').order('created_at', { ascending: false });
  if (error) throw new ApiError(400, 'Recommendations could not be loaded.');
  return success(res, 200, { recommendations: data });
});

const createRecommendation = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient().from('recommendations').insert(req.validatedBody).select('*').single();
  if (error) throw new ApiError(400, 'Recommendation could not be created.');
  return success(res, 201, { recommendation: data });
});

const updateRecommendation = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient()
    .from('recommendations').update(req.validatedBody).eq('id', req.params.id).select('*').maybeSingle();
  if (error) throw new ApiError(400, 'Recommendation could not be updated.');
  if (!data) throw new ApiError(404, 'Recommendation not found.');
  return success(res, 200, { recommendation: data });
});

const deleteRecommendation = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient().from('recommendations').delete().eq('id', req.params.id).select('id').maybeSingle();
  if (error) throw new ApiError(400, 'Recommendation could not be deleted.');
  if (!data) throw new ApiError(404, 'Recommendation not found.');
  return success(res, 200, { message: 'Recommendation deleted.' });
});

const createLegal = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient().from('legal_information').insert(req.validatedBody).select('*').single();
  if (error) throw new ApiError(400, 'Legal information could not be created.');
  return success(res, 201, { legalInformation: data });
});

const updateLegal = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient()
    .from('legal_information').update(req.validatedBody).eq('id', req.params.id).select('*').maybeSingle();
  if (error) throw new ApiError(400, 'Legal information could not be updated.');
  if (!data) throw new ApiError(404, 'Legal information not found.');
  return success(res, 200, { legalInformation: data });
});

const deleteLegal = asyncHandler(async (req, res) => {
  const { data, error } = await getAdminClient().from('legal_information').delete().eq('id', req.params.id).select('id').maybeSingle();
  if (error) throw new ApiError(400, 'Legal information could not be deleted.');
  if (!data) throw new ApiError(404, 'Legal information not found.');
  return success(res, 200, { message: 'Legal information deleted.' });
});

module.exports = {
  dashboard,
  listUsers,
  updateUserRole,
  listAssessments,
  listFeedback,
  listLegal,
  listRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
  createLegal,
  updateLegal,
  deleteLegal,
};
