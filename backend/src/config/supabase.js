const { createClient } = require('@supabase/supabase-js');

const requiredVariables = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const getSupabaseConfig = () => {
  const missing = requiredVariables.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
};

let publicClient;
let adminClient;

const clientOptions = {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
};

const createAnonymousClient = () => {
  const config = getSupabaseConfig();
  return createClient(config.url, config.anonKey, clientOptions);
};

const getPublicClient = () => {
  if (!publicClient) {
    publicClient = createAnonymousClient();
  }
  return publicClient;
};

// This client bypasses RLS. It must only be used after server-side authorization.
const getAdminClient = () => {
  if (!adminClient) {
    const config = getSupabaseConfig();
    adminClient = createClient(config.url, config.serviceRoleKey, clientOptions);
  }
  return adminClient;
};

const createUserClient = (accessToken) => {
  const config = getSupabaseConfig();
  return createClient(config.url, config.anonKey, {
    ...clientOptions,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
};

module.exports = { createAnonymousClient, getPublicClient, getAdminClient, createUserClient };
