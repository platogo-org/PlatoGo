const express = require("express");

const orderRouter = express.Router();
const authController = require("./../controllers/authController");
const orderController = require("./../controllers/orderController");

orderRouter.use(authController.protect);

orderRouter
  .route("/")
  .get(orderController.getAllOrders)
  .post(orderController.createOrder);

orderRouter
  .route("/:id")
  .get(orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

module.exports = orderRouter;
