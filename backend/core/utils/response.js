/**
 * Standard JSON response utility
 * Provides consistent response format across all API endpoints
 */

const Response = function(res, options = {}) {
  const {
    success = true,
    data = null,
    message = 'Success',
    statusCode = 200,
    errors = null
  } = options;
  
  return res.status(statusCode).json({
    success,
    message,
    data,
    errors,
    timestamp: new Date().toISOString()
  });
};

// Helper methods
Response.success = function(res, data = null, message = 'Success', statusCode = 200) {
  return Response(res, { success: true, data, message, statusCode });
};

Response.error = function(res, message = 'Internal server error', statusCode = 500, errors = null) {
  return Response(res, { success: false, data: null, message, statusCode, errors });
};

Response.created = function(res, data, message = 'Resource created successfully') {
  return Response(res, { success: true, data, message, statusCode: 201 });
};

Response.badRequest = function(res, message = 'Bad request', errors = null) {
  return Response(res, { success: false, data: null, message, statusCode: 400, errors });
};

Response.unauthorized = function(res, message = 'Unauthorized') {
  return Response(res, { success: false, data: null, message, statusCode: 401 });
};

Response.forbidden = function(res, message = 'Forbidden') {
  return Response(res, { success: false, data: null, message, statusCode: 403 });
};

Response.notFound = function(res, message = 'Resource not found') {
  return Response(res, { success: false, data: null, message, statusCode: 404 });
};

Response.conflict = function(res, message = 'Resource conflict') {
  return Response(res, { success: false, data: null, message, statusCode: 409 });
};

module.exports = Response;
