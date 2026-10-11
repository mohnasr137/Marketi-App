// JWT Error handling middleware helper
const jwtErrorHandler = (err, req, res, next) => {
  if (err.name === "UnauthorizedError" || err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing authorization token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "TokenExpired",
      message: "Authorization token has expired. Please log in again.",
    });
  }

  return next(err);
};

module.exports = jwtErrorHandler;
