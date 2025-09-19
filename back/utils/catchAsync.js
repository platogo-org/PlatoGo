// Utility to wrap async route handlers and pass errors to Express
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
