/**
 * Standard JSON response utility
 * Provides consistent response format across all API endpoints
 */

class Response {
  /**
   * Main response method with named parameters
   * @param {Object} res - Express response object
   * @param {Object} options - Response options
   * @param {Boolean} options.success - Success status (default: true)
   * @param {Object} options.data - Response data
   * @param {String} options.message - Response message
   * @param {Number} options.statusCode - HTTP status code (default: 200)
   * @param {Object} options.errors - Validation errors or additional error details
   */
  static send(res, options = {}) {
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
  }

  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @param {String} message - Success message
   * @param {Number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return this.send(res, true, data, message, statusCode);
  }

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {Number} statusCode - HTTP status code (default: 500)
   * @param {Object} errors - Validation errors or additional error details
   */
  static error(res, message = 'Internal server error', statusCode = 500, errors = null) {
    return this.send(res, false, null, message, statusCode, errors);
  }

  /**
   * Created response (201)
   * @param {Object} res - Express response object
   * @param {Object} data - Created resource data
   * @param {String} message - Success message
   */
  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * Bad request response (400)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {Object} errors - Validation errors
   */
  static badRequest(res, message = 'Bad request', errors = null) {
    return this.error(res, message, 400, errors);
  }

  /**
   * Unauthorized response (401)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden response (403)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Not found response (404)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * Conflict response (409)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static conflict(res, message = 'Resource conflict') {
    return this.error(res, message, 409);
  }
}

module.exports = Response;
