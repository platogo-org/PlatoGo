// Custom error class for application errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Set status based on error type
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Mark as operational error

    // Capture stack trace excluding constructor
    Error.captureStackTrace(this, this.constructor);
  }
}

// Export AppError class
module.exports = AppError;
