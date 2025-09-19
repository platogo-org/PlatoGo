// Import required modules and controllers
const express = require("express");
const restaurantRouter = express.Router();
const authController = require("./../controllers/authController");
const restaurantController = require("./../controllers/restaurantController");

// Protect all restaurant routes (require authentication)
restaurantRouter.use(authController.protect);

// Route for getting all restaurants and creating a new restaurant (Super Admin only)
restaurantRouter
  .route("/")
  .get(authController.ensureSuperAdmin, restaurantController.getAllRestaurants)
  .post(authController.ensureSuperAdmin, restaurantController.createRestaurant);

// Route for getting, updating, and deleting a restaurant by ID (Super Admin only for update/delete)
restaurantRouter
  .route("/:id")
  .get(restaurantController.getRestaurant)
  .patch(authController.ensureSuperAdmin, restaurantController.updateRestaurant)
  .delete(
    authController.ensureSuperAdmin,
    restaurantController.deleteRestaurant
  );

// Export restaurant router
module.exports = restaurantRouter;
