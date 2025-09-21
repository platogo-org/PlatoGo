// Import Order model and generic handler factory
const Order = require("./../models/orderModel");
const factory = require("./handlerFactory");

// Controller to create a new order
exports.createOrder = factory.createOne(Order);

// Controller to get all orders
exports.getAllOrders = factory.getAll(Order);

// Controller to get a single order by ID
exports.getOrder = factory.getOne(Order);

// Controller to update an order by ID
exports.updateOrder = factory.updateOne(Order);

// Controller to delete an order by ID
exports.deleteOrder = factory.deleteOne(Order);
