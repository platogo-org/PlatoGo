// Import Order model and generic handler factory
const Order = require("./../models/orderModel");
const Product = require("./../models/productModel");
const factory = require("./handlerFactory");
const socketIO = require("../socket");
const catchAsync = require("../utils/catchAsync");

// Controller to create a new order with real-time event emission
exports.createOrder = catchAsync(async (req, res, next) => {
  console.log("📝 Creando nueva orden...");

  // Validar disponibilidad de productos antes de crear la orden
  if (req.body.productos && req.body.productos.length > 0) {
    for (const item of req.body.productos) {
      const product = await Product.findById(item.product);

      if (!product) {
        console.log(`❌ Producto no encontrado: ${item.product}`);

        // Emitir evento de producto no disponible
        const io = socketIO.getIO();
        io.emit("producto_no_disponible", {
          productId: item.product,
          message: "Producto no encontrado",
          timestamp: new Date(),
        });

        return res.status(404).json({
          status: "fail",
          message: `Producto ${item.product} no encontrado`,
        });
      }

      // Verificar si el producto está disponible (si tiene ese campo)
      if (product.disponible === false) {
        console.log(`❌ Producto no disponible: ${product.nombre}`);

        // Emitir evento de producto no disponible a todos los clientes
        const io = socketIO.getIO();
        const productData = {
          productId: product._id,
          nombre: product.nombre,
          message: `El producto ${product.nombre} no está disponible`,
          timestamp: new Date(),
        };

        io.emit("producto_no_disponible", productData);

        // También emitir al restaurante específico si está disponible
        if (req.body.restaurant) {
          socketIO.emitToRestaurant(
            req.body.restaurant,
            "producto_no_disponible",
            productData
          );
        }

        return res.status(400).json({
          status: "fail",
          message: `El producto ${product.nombre} no está disponible`,
          data: productData,
        });
      }
    }
  }

  // Crear la orden
  const newOrder = await Order.create(req.body);
  console.log(`✅ Orden creada: ${newOrder._id}`);

  // Poblar datos para el evento
  const orderPopulated = await Order.findById(newOrder._id)
    .populate({
      path: "productos.product",
      select: "nombre costo",
    })
    .populate({
      path: "restaurant",
      select: "nombre",
    });

  const orderObj = orderPopulated.toObject();
  console.log(`📡 Emitiendo evento pedido_nuevo para orden ${newOrder._id}`);

  // Emitir evento de nuevo pedido
  const io = socketIO.getIO();

  // Emitir globalmente
  io.emit("pedido_nuevo", orderObj);

  // Emitir al restaurante específico si existe
  if (orderPopulated.restaurant) {
    socketIO.emitToRestaurant(
      orderPopulated.restaurant._id,
      "pedido_nuevo",
      orderObj
    );
  }

  console.log("✅ Evento pedido_nuevo emitido");

  res.status(201).json({
    status: "success",
    data: {
      data: orderPopulated,
    },
  });
});

// Controller to get all orders
exports.getAllOrders = factory.getAll(Order);

// Controller to get a single order by ID (con populate manual)
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: "restaurant",
        select: "nombre direccion",
      })
      .populate({
        path: "productos.product",
        select: "nombre costo",
      });

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        data: order,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Controller to update an order by ID with real-time event emission
exports.updateOrder = catchAsync(async (req, res, next) => {
  console.log(`📝 Actualizando orden ${req.params.id}...`);

  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate({
      path: "productos.product",
      select: "nombre costo",
    })
    .populate({
      path: "restaurant",
      select: "nombre",
    });

  if (!order) {
    return res.status(404).json({
      status: "fail",
      message: "Order not found",
    });
  }

  console.log(`✅ Orden actualizada: ${order._id}`);

  const orderObj = order.toObject();
  console.log(`📡 Emitiendo evento pedido_actualizado`);

  // Emitir evento de pedido actualizado
  const io = socketIO.getIO();

  // Emitir globalmente
  io.emit("pedido_actualizado", orderObj);

  // Emitir al restaurante específico
  if (order.restaurant) {
    socketIO.emitToRestaurant(
      order.restaurant._id,
      "pedido_actualizado",
      orderObj
    );
  }

  console.log("✅ Evento pedido_actualizado emitido");

  res.status(200).json({
    status: "success",
    data: {
      data: order,
    },
  });
});

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
  console.log("asdasdasds");
  try {
    const { orderId, productId, quantity } = req.body;

    // Obtener el precio del producto desde la base de datos
    const Product = require("../models/productModel");
    const productDoc = await Product.findById(productId);
    if (!productDoc) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }
    const price = productDoc.costo;

    // Buscar la orden por el _id estándar de MongoDB
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }
    console.log(order);

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

    // Buscar la orden por el _id estándar de MongoDB
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

// Calculate total, taxes, and tip for an order
exports.calculateOrderTotals = async (req, res, next) => {
  try {
    const { orderId, tip } = req.body;

    // Buscar la orden por el _id estándar de MongoDB
    console.log("ooo");
    const order = await Order.findById(orderId);
    console.log("ooostia");
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }

    // Calcular subtotal
    const subtotal = order.productos.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // Calcular tax (16% de subtotal)
    const tax = subtotal * 0.16;

    // Actualizar tip si se envía
    if (tip !== undefined) {
      order.tip = tip;
    }

    // Actualizar campos de la orden
    order.subtotal = subtotal;
    order.tax = tax;
    // Guardar el total en la orden
    order.total = subtotal + tax + (order.tip || 0);

    // Guardar la orden actualizada
    await order.save();

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// Send order to kitchen
exports.sendOrderToKitchen = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    // Buscar la orden por el _id estándar de MongoDB y poblar productos
    const order = await Order.findById(orderId).populate({
      path: "productos.product",
      select: "nombre costo",
    });
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }
    console.log(order);
    // Check if the order is already sent to the kitchen
    if (order.estado !== "pending") {
      return res.status(400).json({
        status: "fail",
        message: "Order is already in preparation or completed",
      });
    }

    // Update order status to 'preparing'
    order.estado = "preparing";

    // Guardar primero
    await order.save();
    console.log("Orden guardada, emitiendo evento...");

    // Emitir evento DESPUÉS de guardar exitosamente usando canales específicos
    const orderObj = order.toObject();
    console.log("Emitiendo eventos de orden enviada a cocina:", orderObj._id);
    console.log("Restaurant de la orden:", order.restaurant);

    // Obtener instancia de io
    const io = socketIO.getIO();

    // Emitir a la cocina del restaurante específico
    if (order.restaurant) {
      console.log(`📡 Emitiendo a canal kitchen_${order.restaurant}`);
      // Evento legacy (mantener compatibilidad)
      socketIO.emitToKitchen(order.restaurant, "orderToKitchen", orderObj);
      // Evento estandarizado requerido
      socketIO.emitToKitchen(
        order.restaurant,
        "pedido_enviado_a_cocina",
        orderObj
      );
      // También notificar al restaurante general
      socketIO.emitToRestaurant(
        order.restaurant,
        "orderStatusChanged",
        orderObj
      );
      socketIO.emitToRestaurant(
        order.restaurant,
        "pedido_actualizado",
        orderObj
      );
    }

    // SIEMPRE emitir globalmente como fallback
    console.log("📡 Emitiendo eventos globalmente");
    io.emit("orderToKitchen", orderObj); // Legacy
    io.emit("pedido_enviado_a_cocina", orderObj); // Estandarizado

    console.log("✅ Eventos emitidos correctamente");

    res.status(200).json({
      status: "success",
      message: "Order sent to kitchen",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// Update order status from kitchen
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { estado } = req.body;

    // Validar estados permitidos (deben coincidir con el modelo)
    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(estado)) {
      return res.status(400).json({
        status: "fail",
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(orderId).populate({
      path: "productos.product",
      select: "nombre costo",
    });

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }

    console.log(`🔄 Actualizando orden ${orderId}`);
    console.log(`   Estado anterior: ${order.estado}`);
    console.log(`   Estado nuevo: ${estado}`);

    // Actualizar estado
    order.estado = estado;

    // Validar que el estado realmente se estableció
    if (order.estado !== estado) {
      console.error(`❌ ERROR: El estado no se estableció correctamente!`);
      console.error(`   Esperado: ${estado}`);
      console.error(`   Actual: ${order.estado}`);
      return res.status(500).json({
        status: "error",
        message: "Failed to set order status",
      });
    }

    console.log(`💾 Guardando en BD...`);
    const savedOrder = await order.save();

    console.log(`✅ Orden guardada en BD con estado: ${savedOrder.estado}`);
    console.log(`📡 Restaurant de la orden: ${order.restaurant}`);

    const orderObj = order.toObject();

    // Obtener instancia de io
    const io = socketIO.getIO();

    // Emitir evento de actualización a todos los interesados
    if (order.restaurant) {
      // Notificar a la cocina
      console.log(
        `📡 Emitiendo orderStatusUpdated a kitchen_${order.restaurant}`
      );
      socketIO.emitToKitchen(order.restaurant, "orderStatusUpdated", orderObj);
      // Notificar al restaurante general (meseros, admin)
      socketIO.emitToRestaurant(
        order.restaurant,
        "orderStatusChanged",
        orderObj
      );
      // Si hay un mesero asignado, notificarle directamente
      if (order.waiter) {
        socketIO.emitToWaiter(order.waiter, "orderStatusChanged", orderObj);
      }
    }

    // SIEMPRE emitir globalmente como fallback
    console.log("📡 Emitiendo orderStatusUpdated globalmente");
    io.emit("orderStatusUpdated", orderObj);
    console.log("✅ Eventos emitidos correctamente");

    res.status(200).json({
      status: "success",
      message: "Order status updated",
      data: order,
    });
  } catch (err) {
    console.error("❌ ERROR al actualizar orden:", err);
    console.error("❌ Stack trace:", err.stack);
    next(err);
  }
};
