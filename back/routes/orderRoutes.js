const express = require("express");

const orderRouter = express.Router();
const authController = require("./../controllers/authController");
const orderController = require("./../controllers/orderController");
const { ensureRestaurantOwnership } = require("./../utils/authorization");

orderRouter.use(authController.protect);

orderRouter
  .route("/")
  .get(orderController.getAllOrders)
  .post(ensureRestaurantOwnership, orderController.createOrder);

orderRouter
  .route("/:id")
  .get(orderController.getOrder)
  .patch(ensureRestaurantOwnership, orderController.updateOrder)
  .delete(ensureRestaurantOwnership, orderController.deleteOrder);

module.exports = orderRouter;
