// Import required modules and controllers
const express = require("express");
const categoryRouter = express.Router();
const authController = require("./../controllers/authController");
const categoryController = require("./../controllers/categoryController");

// Protect all category routes (require authentication)
categoryRouter.use(authController.protect);

// Route for getting all categories and creating a new category
categoryRouter
  .route("/")
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);

// Route for getting, updating, and deleting a category by ID
categoryRouter
  .route("/:id")
  .get(categoryController.getCategory)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

// Export category router
module.exports = categoryRouter;
