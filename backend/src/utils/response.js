const success = (res, status, data = {}) => res.status(status).json({ success: true, ...data });

const failure = (res, status, message, details) => {
  const payload = { success: false, message };
  if (details) payload.errors = details;
  return res.status(status).json(payload);
};

module.exports = { success, failure };
