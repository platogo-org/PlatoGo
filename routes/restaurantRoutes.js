const express = require("express");

const restaurantRouter = express.Router();
const authController = require("./../controllers/authController");
const restaurantController = require("./../controllers/restaurantController");

restaurantRouter.use(authController.protect);

restaurantRouter
  .route("/")
  .get(restaurantController.getAllRestaurants)
  .post(restaurantController.createRestaurant);

restaurantRouter
  .route("/:id")
  .get(restaurantController.getRestaurant)
  .patch(restaurantController.updateRestaurant)
  .delete(restaurantController.deleteRestaurant);

module.exports = restaurantRouter;
