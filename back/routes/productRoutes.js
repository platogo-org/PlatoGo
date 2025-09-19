const express = require("express");

const productRouter = express.Router();
const authController = require("./../controllers/authController");
const productController = require("./../controllers/productController");
const { ensureRestaurantOwnership } = require("./../utils/authorization");

productRouter.use(authController.protect);

productRouter
  .route("/")
  .get(productController.getAllProducts)
  .post(ensureRestaurantOwnership, productController.createProduct);

productRouter
  .route("/:id")
  .get(productController.getProduct)
  .patch(ensureRestaurantOwnership, productController.updateProduct)
  .delete(ensureRestaurantOwnership, productController.deleteProduct);

module.exports = productRouter;
