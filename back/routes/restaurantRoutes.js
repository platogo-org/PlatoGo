const express = require("express");

const restaurantRouter = express.Router();
const authController = require("./../controllers/authController");
const restaurantController = require("./../controllers/restaurantController");

restaurantRouter.use(authController.protect);

restaurantRouter
  .route("/")
  .get(authController.ensureSuperAdmin, restaurantController.getAllRestaurants)
  .post(authController.ensureSuperAdmin, restaurantController.createRestaurant);

restaurantRouter
  .route("/:id")
  .get(restaurantController.getRestaurant)
  .patch(authController.ensureSuperAdmin, restaurantController.updateRestaurant)
  .delete(authController.ensureSuperAdmin, restaurantController.deleteRestaurant);

module.exports = restaurantRouter;
