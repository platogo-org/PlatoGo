const express = require("express");
const categoryRouter = express.Router();
const authController = require("./../controllers/authController");
const categoryController = require("./../controllers/categoryController");

categoryRouter.use(authController.protect);

categoryRouter
  .route("/")
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);

categoryRouter
  .route("/:id")
  .get(categoryController.getCategory)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = categoryRouter;
