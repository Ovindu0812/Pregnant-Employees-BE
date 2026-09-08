const { createAnonymousClient, getAdminClient } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { profileToApi } = require('../utils/mappers');
const { success } = require('../utils/response');

const sessionToApi = (session) => session && ({
  accessToken: session.access_token,
  refreshToken: session.refresh_token,
  expiresAt: session.expires_at,
  tokenType: session.token_type,
});

const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.validatedBody;
  const { data, error } = await createAnonymousClient().auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone: phone || null } },
  });

  if (error) {
    console.error('Supabase signup error:', {
      message: error.message,
      status: error.status,
      code: error.code,
    });
    if (/rate limit|email.*rate/i.test(error.message) || Number(error.status) === 429 || error.code === 'over_email_send_rate_limit') {
      throw new ApiError(
        429,
        'Email service is temporarily rate-limited. Please try again in a few minutes.',
      );
    }

    if (/already|registered|exists/i.test(error.message)) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    throw new ApiError(400, error.message);
  }
  if (!data.user) throw new ApiError(500, 'Account could not be created.');
  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // The database trigger in supabase/schema.sql creates this row atomically from auth.users.
  const { data: profile, error: profileError } = await getAdminClient()
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  if (profileError) {
    console.error('Profile lookup after signup failed:', {
      message: profileError.message,
      code: profileError.code,
      status: profileError.status,
    });
    throw new ApiError(500, 'Account was created but its profile is unavailable. Verify the auth.users profile trigger.');
  }

  return success(res, 201, {
    message: data.session ? 'Registration successful.' : 'Registration successful. Check your email to confirm the account.',
    user: profileToApi(profile),
    session: sessionToApi(data.session),
  });
});

const login = asyncHandler(async (req, res) => {
  const { data, error } = await createAnonymousClient().auth.signInWithPassword(req.validatedBody);
  if (error || !data.session) throw new ApiError(401, 'Invalid email or password.');

  const { data: profile, error: profileError } = await getAdminClient()
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  if (profileError) throw new ApiError(403, 'User profile is unavailable.');

  return success(res, 200, { user: profileToApi(profile), session: sessionToApi(data.session) });
});

const refresh = asyncHandler(async (req, res) => {
  const { data, error } = await createAnonymousClient().auth.refreshSession({
    refresh_token: req.validatedBody.refreshToken,
  });
  if (error || !data.session || !data.user) {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }

  const { data: profile, error: profileError } = await getAdminClient()
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  if (profileError || !profile) throw new ApiError(403, 'User profile is unavailable.');

  return success(res, 200, { user: profileToApi(profile), session: sessionToApi(data.session) });
});

const logout = asyncHandler(async (req, res) => {
  // Revoke refresh tokens using the already-verified JWT; no password is handled here.
  const { error } = await getAdminClient().auth.admin.signOut(req.accessToken, 'global');
  if (error) throw new ApiError(400, 'Unable to log out this session.');
  return success(res, 200, { message: 'Logged out successfully.' });
});

const me = asyncHandler(async (req, res) => success(res, 200, {
  user: profileToApi(req.profile),
}));

module.exports = { register, login, refresh, logout, me };
