// Import Category model and generic handler factory
const Category = require("./../models/categoryModel");
const factory = require("./handlerFactory");

// Controller to create a new category
exports.createCategory = factory.createOne(Category);

// Controller to get all categories
exports.getAllCategories = factory.getAll(Category);

// Controller to get a single category by ID
exports.getCategory = factory.getOne(Category);

// Controller to update a category by ID
exports.updateCategory = factory.updateOne(Category);

// Controller to delete a category by ID
exports.deleteCategory = factory.deleteOne(Category);
