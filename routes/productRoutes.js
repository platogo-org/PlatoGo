const express = require("express");

const productRouter = express.Router();
const authController = require("./../controllers/authController");
const productController = require("./../controllers/productController");

productRouter.use(authController.protect);

productRouter
  .route("/")
  .get(productController.getAllProducts)
  .post(productController.createProduct);

productRouter
  .route("/:id")
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = productRouter;
