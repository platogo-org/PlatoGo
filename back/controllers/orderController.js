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

// Add an item to an order
exports.addItemToOrder = async (req, res, next) => {
  try {
    const { orderId, productId, quantity, price } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }

    // Check if the product already exists in the order
    const existingItem = order.productos.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Update quantity if the product already exists
      existingItem.quantity += quantity;
    } else {
      // Add new product to the order
      order.productos.push({ product: productId, quantity, price });
    }

    // Save the updated order
    await order.save();

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// Edit an item in an order
exports.editItemInOrder = async (req, res, next) => {
  try {
    const { orderId, productId, quantity, notes } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }

    // Find the product in the order
    const item = order.productos.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found in order",
      });
    }

    // Update item details
    if (quantity !== undefined) item.quantity = quantity;
    if (notes !== undefined) item.notes = notes;

    // Save the updated order
    await order.save();

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};
