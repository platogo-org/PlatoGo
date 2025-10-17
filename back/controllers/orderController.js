// Import Order model and generic handler factory
const Order = require("./../models/orderModel");
const factory = require("./handlerFactory");

// Controller to create a new order -- All Documents will be returned no filter
exports.createOrder = factory.createOne(Order);

// Controller to get all orders
exports.getAllOrders = factory.getAll(Order);

// Controller to get a single order by ID
exports.getOrder = factory.getOne(Order);

// Controller to update an order by ID
exports.updateOrder = factory.updateOne(Order);

// Controller to delete an order by ID
exports.deleteOrder = factory.deleteOne(Order);

// Test controller to fetch and log all orders
exports.testGetAllOrders = async (req, res) => {
  try {
    console.log("Fetching all orders...");
    const orders = await Order.find();
    console.log("Orders fetched:", orders);
    res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({
      status: "error",
      message: "Error fetching orders",
    });
  }
};
