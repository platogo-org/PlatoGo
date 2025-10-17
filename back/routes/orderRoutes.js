// Import required modules and controllers
const express = require("express");
const orderRouter = express.Router();
const authController = require("./../controllers/authController");
const orderController = require("./../controllers/orderController");
const { ensureRestaurantOwnership } = require("./../utils/authorization");

// Protect all order routes (require authentication)
orderRouter.use(authController.protect);

// Route for getting all orders and creating a new order
orderRouter
  .route("/")
  .get(orderController.getAllOrders)
  .post(ensureRestaurantOwnership, orderController.createOrder);

// Route for getting, updating, and deleting an order by ID
orderRouter
  .route("/:id")
  .get(orderController.getOrder)
  .patch(ensureRestaurantOwnership, orderController.updateOrder)
  .delete(ensureRestaurantOwnership, orderController.deleteOrder);

// Ruta de prueba para obtener todos los pedidos sin middleware adicional
orderRouter.get("/test", orderController.testGetAllOrders);

// Export order router
module.exports = orderRouter;
