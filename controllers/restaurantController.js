const Restaurant = require("./../models/RestaurantModel");
const factory = require("./handlerFactory");

exports.createRestaurant = factory.createOne(Restaurant);
exports.getAllRestaurants = factory.getAll(Restaurant);
exports.getRestaurant = factory.getOne(Restaurant);
exports.updateRestaurant = factory.updateOne(Restaurant);
exports.deleteRestaurant = factory.deleteOne(Restaurant);
