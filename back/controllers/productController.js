// Import Product model and generic handler factory
const Product = require("./../models/productModel");
const factory = require("./handlerFactory");

// Controller to create a new product
exports.createProduct = factory.createOne(Product);

// Controller to get all products
exports.getAllProducts = factory.getAll(Product);

// Controller to get a single product by ID
exports.getProduct = factory.getOne(Product);

// Controller to update a product by ID
exports.updateProduct = factory.updateOne(Product);

// Controller to delete a product by ID
exports.deleteProduct = factory.deleteOne(Product);
