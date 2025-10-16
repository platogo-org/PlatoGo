// Import AppError for custom error handling
const AppError = require("../utils/appError");
const Restaurant = require("../models/RestaurantModel");

/**
 * Middleware to ensure the authenticated user is the owner of the restaurant (for restaurant-admin)
 * Super admins bypass ownership checks
 * Only restaurant-admins can pass ownership checks
 * Checks restaurant context from params or body
 */
exports.ensureRestaurantOwnership = async (req, res, next) => {
  // Expect req.user to be set by authController.protect
  if (!req.user)
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );

  // Super admins bypass ownership checks
  if (req.user.role === "super-admin") return next();

  // Only restaurant-admins can pass ownership checks
  if (req.user.role !== "restaurant-admin") {
    return next(
      new AppError("You do not have permission to perform this action", 403)
    );
  }

  // For routes that include a restaurant id param, compare it.
  const restaurantId =
    req.params.restaurantId ||
    (req.body && req.body.restaurant) ||
    req.params.id;
  // If there's no restaurant context, deny
  if (!restaurantId && req.user.restaurant == null) {
    return next(
      new AppError("No restaurant context to validate ownership", 400)
    );
  }

  const targetRestaurantId = restaurantId || req.user.restaurant;

  // If the user's restaurant doesn't match the target restaurant, deny
  if (
    !req.user.restaurant ||
    String(req.user.restaurant) !== String(targetRestaurantId)
  ) {
    return next(
      new AppError("You can only manage resources for your own restaurant", 403)
    );
  }

  next();
};
