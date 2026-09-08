const ApiError = require('../utils/ApiError');
const { failure } = require('../utils/response');

const notFound = (req, res) => failure(res, 404, 'Route not found.');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = statusCode === 500 ? 'An unexpected server error occurred.' : err.message;
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body contains invalid JSON.';
  } else if (err.type === 'entity.too.large') {
    statusCode = 400;
    message = 'Request body is too large.';
  }

  if (process.env.NODE_ENV !== 'production') {
    // Never log request bodies here because they may contain passwords or private data.
    console.error(err);
  }

  return failure(res, statusCode, message, err instanceof ApiError ? err.details : undefined);
};

module.exports = { notFound, errorHandler };
