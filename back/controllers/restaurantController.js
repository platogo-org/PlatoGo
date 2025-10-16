// Import Restaurant model and generic handler factory
const Restaurant = require("./../models/restaurantModel");
const factory = require("./handlerFactory");

// Controller to create a new restaurant
exports.createRestaurant = factory.createOne(Restaurant);

// Controller to get all restaurants
exports.getAllRestaurants = factory.getAll(Restaurant);

// Controller to get a single restaurant by ID
exports.getRestaurant = factory.getOne(Restaurant);

// Controller to update a restaurant by ID
exports.updateRestaurant = factory.updateOne(Restaurant);

// Controller to delete a restaurant by ID
exports.deleteRestaurant = factory.deleteOne(Restaurant);
