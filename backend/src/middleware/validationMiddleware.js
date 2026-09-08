const ApiError = require('../utils/ApiError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];
const LEGAL_CATEGORIES = ['maternity', 'workplace-safety', 'working-conditions', 'employment-rights'];

const textValue = (value, name, { required = false, max = 5000 } = {}) => {
  if (value === undefined || value === null) {
    if (required) throw new ApiError(400, `${name} is required.`);
    return undefined;
  }
  if (typeof value !== 'string') throw new ApiError(400, `${name} must be text.`);
  const result = value.trim();
  if (required && !result) throw new ApiError(400, `${name} is required.`);
  if (result.length > max) throw new ApiError(400, `${name} must not exceed ${max} characters.`);
  return result;
};

const booleanValue = (value, name, required = false) => {
  if (value === undefined && !required) return undefined;
  if (typeof value !== 'boolean') throw new ApiError(400, `${name} must be true or false.`);
  return value;
};

const validate = (normalizer) => (req, res, next) => {
  try {
    req.validatedBody = normalizer(req.body || {});
    next();
  } catch (error) {
    next(error);
  }
};

const validateUuidParam = (name = 'id') => (req, res, next) => {
  if (!UUID_PATTERN.test(req.params[name] || '')) return next(new ApiError(400, `Invalid ${name}.`));
  return next();
};

const register = validate((body) => {
  const fullName = textValue(body.fullName, 'fullName', { required: true, max: 120 });
  const email = textValue(body.email, 'email', { required: true, max: 254 }).toLowerCase();
  const phone = textValue(body.phone, 'phone', { max: 30 });
  const password = body.password;
  if (!EMAIL_PATTERN.test(email)) throw new ApiError(400, 'A valid email is required.');
  if (phone && !/^[+0-9()\s-]+$/.test(phone)) throw new ApiError(400, 'Phone number contains invalid characters.');
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    throw new ApiError(400, 'Password must contain between 8 and 72 characters.');
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new ApiError(400, 'Password must contain at least one letter and one number.');
  }
  return { fullName, email, phone: phone || null, password };
});

const login = validate((body) => {
  const email = textValue(body.email, 'email', { required: true, max: 254 }).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new ApiError(400, 'A valid email is required.');
  if (typeof body.password !== 'string' || !body.password) throw new ApiError(400, 'password is required.');
  return { email, password: body.password };
});

const refresh = validate((body) => {
  const refreshToken = textValue(body.refreshToken, 'refreshToken', { required: true, max: 4096 });
  return { refreshToken };
});

const profile = validate((body) => {
  const result = {
    full_name: textValue(body.full_name, 'full_name', { max: 120 }),
    phone: textValue(body.phone, 'phone', { max: 30 }),
    occupation: textValue(body.occupation, 'occupation', { max: 120 }),
    workplace: textValue(body.workplace, 'workplace', { max: 160 }),
  };
  Object.keys(result).forEach((key) => result[key] === undefined && delete result[key]);
  if (Object.keys(result).length === 0) throw new ApiError(400, 'Provide at least one editable profile field.');
  return result;
});

const assessment = validate((body) => {
  const workingHours = Number(body.workingHours);
  if (!Number.isFinite(workingHours) || workingHours < 0 || workingHours > 24) {
    throw new ApiError(400, 'workingHours must be a number between 0 and 24.');
  }
  return {
    pregnancyStage: textValue(body.pregnancyStage, 'pregnancyStage', { required: true, max: 80 }),
    occupation: textValue(body.occupation, 'occupation', { required: true, max: 120 }),
    workingHours,
    prolongedStanding: booleanValue(body.prolongedStanding, 'prolongedStanding', true),
    heavyLifting: booleanValue(body.heavyLifting, 'heavyLifting', true),
    chemicalExposure: booleanValue(body.chemicalExposure, 'chemicalExposure', true),
    workplaceStress: booleanValue(body.workplaceStress, 'workplaceStress', true),
    repetitiveMovement: booleanValue(body.repetitiveMovement, 'repetitiveMovement', true),
    nightShift: booleanValue(body.nightShift, 'nightShift', true),
    environmentalHazards: booleanValue(body.environmentalHazards, 'environmentalHazards', true),
  };
});

const feedback = validate((body) => {
  if (!UUID_PATTERN.test(body.assessmentId || '')) throw new ApiError(400, 'A valid assessmentId is required.');
  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
    throw new ApiError(400, 'rating must be an integer from 1 to 5.');
  }
  return {
    assessment_id: body.assessmentId,
    rating: body.rating,
    comment: textValue(body.comment, 'comment', { max: 2000 }) || null,
  };
});

const legal = validate((body) => {
  const category = textValue(body.category, 'category', { required: true, max: 80 });
  if (!LEGAL_CATEGORIES.includes(category)) throw new ApiError(400, 'Invalid legal information category.');
  return {
    title: textValue(body.title, 'title', { required: true, max: 200 }),
    category,
    summary: textValue(body.summary, 'summary', { required: true, max: 1000 }),
    content: textValue(body.content, 'content', { required: true, max: 20000 }),
    source_reference: textValue(body.sourceReference, 'sourceReference', { max: 1000 }) || null,
    active: body.active === undefined ? true : booleanValue(body.active, 'active', true),
  };
});

const recommendation = validate((body) => {
  const riskLevel = textValue(body.riskLevel, 'riskLevel', { required: true }).toUpperCase();
  if (!RISK_LEVELS.includes(riskLevel)) throw new ApiError(400, 'riskLevel must be LOW, MEDIUM, or HIGH.');
  return {
    category: textValue(body.category, 'category', { required: true, max: 80 }),
    risk_level: riskLevel,
    title: textValue(body.title, 'title', { required: true, max: 200 }),
    description: textValue(body.description, 'description', { required: true, max: 5000 }),
    active: body.active === undefined ? true : booleanValue(body.active, 'active', true),
  };
});

const userRole = validate((body) => {
  if (!['user', 'admin'].includes(body.role)) throw new ApiError(400, 'role must be user or admin.');
  return { role: body.role };
});

module.exports = {
  validateUuidParam,
  register,
  login,
  refresh,
  profile,
  assessment,
  feedback,
  legal,
  recommendation,
  userRole,
  constants: { EMAIL_PATTERN, UUID_PATTERN, RISK_LEVELS, LEGAL_CATEGORIES },
};
