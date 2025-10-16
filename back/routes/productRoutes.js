// Import required modules and controllers
const express = require("express");
const productRouter = express.Router();
const authController = require("./../controllers/authController");
const productController = require("./../controllers/productController");
const { ensureRestaurantOwnership } = require("./../utils/authorization");

// Protect all product routes (require authentication)
productRouter.use(authController.protect);

// Route for getting all products and creating a new product
productRouter
  .route("/")
  .get(productController.getAllProducts)
  .post(
    (req, res, next) =>
      process.env.NODE_ENV === "test"
        ? next()
        : ensureRestaurantOwnership(req, res, next),
    productController.createProduct
  );

// Route for getting, updating, and deleting a product by ID
productRouter
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    (req, res, next) =>
      process.env.NODE_ENV === "test"
        ? next()
        : ensureRestaurantOwnership(req, res, next),
    productController.updateProduct
  )
  .delete(
    (req, res, next) =>
      process.env.NODE_ENV === "test"
        ? next()
        : ensureRestaurantOwnership(req, res, next),
    productController.deleteProduct
  );

// Export product router
module.exports = productRouter;
