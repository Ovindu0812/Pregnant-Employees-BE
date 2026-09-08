const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { profileToApi } = require('../utils/mappers');
const { success } = require('../utils/response');

const getMe = asyncHandler(async (req, res) => success(res, 200, {
  profile: profileToApi(req.profile),
}));

const updateMe = asyncHandler(async (req, res) => {
  const { data, error } = await req.supabase
    .from('profiles')
    .update(req.validatedBody)
    .eq('id', req.user.id)
    .select('*')
    .single();
  if (error) throw new ApiError(400, 'Profile could not be updated.');
  return success(res, 200, { profile: profileToApi(data) });
});

module.exports = { getMe, updateMe };
