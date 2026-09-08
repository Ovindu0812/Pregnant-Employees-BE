const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const createFeedback = asyncHandler(async (req, res) => {
  const { data: assessment, error: assessmentError } = await req.supabase
    .from('risk_assessments')
    .select('id')
    .eq('id', req.validatedBody.assessment_id)
    .eq('user_id', req.user.id)
    .maybeSingle();
  if (assessmentError) throw new ApiError(400, 'Assessment could not be verified.');
  if (!assessment) throw new ApiError(404, 'Assessment not found.');

  const { data, error } = await req.supabase
    .from('feedback')
    .insert({ ...req.validatedBody, user_id: req.user.id })
    .select('*')
    .single();
  if (error) {
    if (error.code === '23505') throw new ApiError(409, 'Feedback has already been submitted for this assessment.');
    throw new ApiError(400, 'Feedback could not be submitted.');
  }
  return success(res, 201, { feedback: data });
});

const listMyFeedback = asyncHandler(async (req, res) => {
  const { data, error } = await req.supabase
    .from('feedback')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) throw new ApiError(400, 'Feedback could not be loaded.');
  return success(res, 200, { feedback: data });
});

module.exports = { createFeedback, listMyFeedback };
