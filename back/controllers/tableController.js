const Table = require("../models/tableModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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
