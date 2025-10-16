// Import required modules and controllers
const express = require("express");
const restaurantRouter = express.Router();
const authController = require("./../controllers/authController");
const restaurantController = require("./../controllers/restaurantController");

// Protect all restaurant routes (require authentication)
restaurantRouter.use(authController.protect);

// Allow both super-admin and restaurant-admin to access restaurant routes
const allowSuperAdminAndRestaurantAdmin = authController.restrictTo(
  "super-admin",
  "restaurant-admin"
);

// Route for getting all restaurants and creating a new restaurant (Super Admin only for create)
restaurantRouter
  .route("/")
  .get(
    allowSuperAdminAndRestaurantAdmin,
    restaurantController.getAllRestaurants
  )
  .post(authController.ensureSuperAdmin, restaurantController.createRestaurant);

// Route for getting, updating, and deleting a restaurant by ID
restaurantRouter
  .route("/:id")
  .get(allowSuperAdminAndRestaurantAdmin, restaurantController.getRestaurant)
  .patch(authController.ensureSuperAdmin, restaurantController.updateRestaurant)
  .delete(
    authController.ensureSuperAdmin,
    restaurantController.deleteRestaurant
  );

// Export restaurant router
module.exports = restaurantRouter;
