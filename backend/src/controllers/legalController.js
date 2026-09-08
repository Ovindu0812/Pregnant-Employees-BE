const { getPublicClient } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { constants } = require('../middleware/validationMiddleware');

const listLegal = asyncHandler(async (req, res) => {
  let query = getPublicClient().from('legal_information').select('*').eq('active', true).order('title');
  if (req.query.category) {
    if (!constants.LEGAL_CATEGORIES.includes(req.query.category)) throw new ApiError(400, 'Invalid category filter.');
    query = query.eq('category', req.query.category);
  }
  const { data, error } = await query;
  if (error) throw new ApiError(400, 'Legal information could not be loaded.');
  return success(res, 200, {
    legalInformation: data,
    notice: 'This is general legal information only, not professional legal advice. Verify content with authoritative Sri Lankan sources.',
  });
});

const getLegal = asyncHandler(async (req, res) => {
  const { data, error } = await getPublicClient()
    .from('legal_information')
    .select('*')
    .eq('id', req.params.id)
    .eq('active', true)
    .maybeSingle();
  if (error) throw new ApiError(400, 'Legal information could not be loaded.');
  if (!data) throw new ApiError(404, 'Legal information not found.');
  return success(res, 200, {
    legalInformation: data,
    notice: 'This is general legal information only, not professional legal advice.',
  });
});

module.exports = { listLegal, getLegal };
