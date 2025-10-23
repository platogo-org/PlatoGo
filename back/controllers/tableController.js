const Table = require("../models/tableModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const socketIO = require("../socket");

// Asignar o transferir mesa entre meseros (solo supervisor)
exports.assignOrTransferTable = catchAsync(async (req, res, next) => {
  const { waiterId } = req.body;
  const table = await Table.findById(req.params.id);
  if (!table) return next(new AppError("Mesa no encontrada", 404));

  // Solo supervisor puede asignar/transferir
  if (!req.user || req.user.role !== "restaurant-admin") {
    return next(
      new AppError("Solo el supervisor puede asignar o transferir mesas", 403)
    );
  }

  const fromWaiter = table.assignedWaiter;
  table.assignedWaiter = waiterId;
  table.transferHistory.push({
    from: fromWaiter,
    to: waiterId,
    supervisor: req.user._id,
    timestamp: new Date(),
  });
  await table.save();

  const transferData = {
    mesaId: table._id,
    from: fromWaiter,
    to: waiterId,
    supervisor: req.user._id,
    timestamp: new Date(),
  };

  // Emitir evento WebSocket de transferencia usando canales específicos
  if (table.restaurant) {
    socketIO.emitToRestaurant(
      table.restaurant,
      "mesaTransferida",
      transferData
    );
    // Notificar al mesero anterior si existe
    if (fromWaiter) {
      socketIO.emitToWaiter(fromWaiter, "mesaTransferida", transferData);
    }
    // Notificar al nuevo mesero
    if (waiterId) {
      socketIO.emitToWaiter(waiterId, "mesaTransferida", transferData);
    }
  } else {
    // Fallback global
    const io = socketIO.getIO();
    io.emit("mesaTransferida", transferData);
  }

  res.status(200).json({
    status: "success",
    data: { table },
  });
});

// Cambiar estado de la mesa solo por el mesero asignado
exports.changeTableState = catchAsync(async (req, res, next) => {
  const { estado } = req.body;
  const table = await Table.findById(req.params.id);
  if (!table) return next(new AppError("Mesa no encontrada", 404));

  // Verificar que el usuario es el mesero asignado
  if (
    !req.user ||
    req.user.role !== "restaurant-waiter" ||
    String(table.assignedWaiter) !== String(req.user._id)
  ) {
    return next(
      new AppError(
        "Solo el mesero asignado puede cambiar el estado de la mesa",
        403
      )
    );
  }

  if (!["libre", "ocupada", "cuenta"].includes(estado)) {
    return next(new AppError("Estado inválido", 400));
  }

  table.estado = estado;
  await table.save();

  const stateData = {
    mesaId: table._id,
    estado,
    assignedWaiter: table.assignedWaiter,
    timestamp: new Date(),
  };

  // Emitir evento WebSocket usando canales específicos
  if (table.restaurant) {
    socketIO.emitToRestaurant(
      table.restaurant,
      "mesaEstadoActualizado",
      stateData
    );
    // Notificar al mesero asignado
    if (table.assignedWaiter) {
      socketIO.emitToWaiter(
        table.assignedWaiter,
        "mesaEstadoActualizado",
        stateData
      );
    }
  } else {
    // Fallback global
    const io = socketIO.getIO();
    io.emit("mesaEstadoActualizado", stateData);
  }

  res.status(200).json({
    status: "success",
    data: { table },
  });
});

exports.getAllTables = catchAsync(async (req, res, next) => {
  const tables = await Table.find().populate("restaurant");
  res.status(200).json({
    status: "success",
    results: tables.length,
    data: { tables },
  });
});

exports.getTable = catchAsync(async (req, res, next) => {
  const table = await Table.findById(req.params.id).populate("restaurant");
  if (!table) return next(new AppError("Mesa no encontrada", 404));
  res.status(200).json({
    status: "success",
    data: { table },
  });
});

exports.createTable = catchAsync(async (req, res, next) => {
  const { name, capacity, location, restaurant } = req.body;
  if (!name || !capacity || !location || !restaurant) {
    return next(new AppError("Todos los campos son obligatorios", 400));
  }
  const table = await Table.create({ name, capacity, location, restaurant });
  res.status(201).json({
    status: "success",
    data: { table },
  });
});

exports.updateTable = catchAsync(async (req, res, next) => {
  const { name, capacity, location, restaurant } = req.body;
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { name, capacity, location, restaurant },
    { new: true, runValidators: true }
  );
  if (!table) return next(new AppError("Mesa no encontrada", 404));
  res.status(200).json({
    status: "success",
    data: { table },
  });
});

exports.deleteTable = catchAsync(async (req, res, next) => {
  const table = await Table.findByIdAndDelete(req.params.id);
  if (!table) return next(new AppError("Mesa no encontrada", 404));
  res.status(204).json({ status: "success", data: null });
});
