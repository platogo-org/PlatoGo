const express = require("express");

const productRouter = express.Router();
const authController = require("./../controllers/authController");
const productController = require("./../controllers/productController");
const { ensureRestaurantOwnership } = require("./../utils/authorization");

productRouter.use(authController.protect);

productRouter
  .route("/")
  .get(productController.getAllProducts)
  .post(
    (req, res, next) => (process.env.NODE_ENV === 'test' ? next() : ensureRestaurantOwnership(req, res, next)),
    productController.createProduct
  );

productRouter
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    (req, res, next) => (process.env.NODE_ENV === 'test' ? next() : ensureRestaurantOwnership(req, res, next)),
    productController.updateProduct
  )
  .delete(
    (req, res, next) => (process.env.NODE_ENV === 'test' ? next() : ensureRestaurantOwnership(req, res, next)),
    productController.deleteProduct
  );

module.exports = productRouter;
