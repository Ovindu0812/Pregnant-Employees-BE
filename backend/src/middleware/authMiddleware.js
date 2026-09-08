const { getPublicClient, getAdminClient, createUserClient } = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const requireAuth = async (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return next(new ApiError(401, 'A valid bearer token is required.'));

  const accessToken = match[1].trim();
  const { data, error } = await getPublicClient().auth.getUser(accessToken);
  if (error || !data.user) return next(new ApiError(401, 'Invalid or expired access token.'));

  const { data: profile, error: profileError } = await getAdminClient()
    .from('profiles')
    .select('id, full_name, email, role, phone, occupation, workplace, created_at, updated_at')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) return next(new ApiError(403, 'User profile is unavailable.'));

  req.user = data.user;
  req.profile = profile;
  req.accessToken = accessToken;
  req.supabase = createUserClient(accessToken);
  return next();
};

module.exports = { requireAuth };
