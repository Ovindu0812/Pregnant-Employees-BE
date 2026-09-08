const test = require('node:test');
const assert = require('node:assert/strict');
const validation = require('../src/middleware/validationMiddleware');

const run = (middleware, body) => {
  const req = { body };
  let nextValue;
  middleware(req, {}, (value) => { nextValue = value; });
  return { body: req.validatedBody, error: nextValue };
};

test('registration normalizes email and rejects weak passwords', () => {
  const valid = run(validation.register, {
    fullName: ' Research User ',
    email: 'USER@EXAMPLE.COM',
    password: 'SecurePass123',
  });
  assert.equal(valid.error, undefined);
  assert.equal(valid.body.email, 'user@example.com');
  assert.equal(valid.body.fullName, 'Research User');

  const invalid = run(validation.register, {
    fullName: 'Research User',
    email: 'user@example.com',
    password: 'password',
  });
  assert.equal(invalid.error.statusCode, 400);
});

test('registration accepts an optional phone number and rejects invalid phone text', () => {
  const valid = run(validation.register, {
    fullName: 'Research User', email: 'user@example.com', phone: '+94 77 123 4567', password: 'SecurePass123',
  });
  assert.equal(valid.error, undefined);
  assert.equal(valid.body.phone, '+94 77 123 4567');

  const invalid = run(validation.register, {
    fullName: 'Research User', email: 'user@example.com', phone: 'not-a-phone', password: 'SecurePass123',
  });
  assert.equal(invalid.error.statusCode, 400);
});

test('refresh requires a non-empty refresh token', () => {
  const valid = run(validation.refresh, { refreshToken: ' refresh-token-value ' });
  assert.equal(valid.error, undefined);
  assert.equal(valid.body.refreshToken, 'refresh-token-value');

  const invalid = run(validation.refresh, {});
  assert.equal(invalid.error.statusCode, 400);
});

test('assessment requires booleans and bounded working hours', () => {
  const result = run(validation.assessment, {
    pregnancyStage: 'Second Trimester',
    occupation: 'Office Employee',
    workingHours: 25,
    prolongedStanding: false,
    heavyLifting: false,
    chemicalExposure: false,
    workplaceStress: false,
    repetitiveMovement: false,
    nightShift: false,
    environmentalHazards: false,
  });
  assert.equal(result.error.statusCode, 400);
});

test('profile updates discard unapproved fields including role', () => {
  const result = run(validation.profile, { full_name: 'Updated Name', role: 'admin' });
  assert.equal(result.error, undefined);
  assert.deepEqual(result.body, { full_name: 'Updated Name' });
});
