/**
 * Standard JSON response utility
 * Provides consistent response format across all API endpoints
 */

const statusMessages = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  301: 'Moved Permanently',
  302: 'Found',
  304: 'Not Modified',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  410: 'Gone',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout'
};

const Response = function(res, options = {}) {
  const {
    success = true,
    data = null,
    message,
    statusCode = 200,
    errors = null
  } = options;

  const finalMessage = message || statusMessages[statusCode] || (success ? 'Success' : 'Error');

  return res.status(statusCode).json({
    success,
    message: finalMessage,
    data,
    errors,
    timestamp: new Date().toISOString()
  });
};

module.exports = Response;
