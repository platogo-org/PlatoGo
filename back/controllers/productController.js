const Product = require("../models/productModel");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

// List (keep factory) -- All Documents will be returned no filter
exports.getAllProducts = factory.getAll(Product);

// Create with explicit validation & duplicate key handling
exports.createProduct = async (req, res, next) => {
  try {
    const { nombre, costo, restaurant } = req.body;
    if (!nombre || costo == null || !restaurant) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Missing required fields: nombre, costo, restaurant",
        });
    }
    if (typeof costo !== "number" || costo < 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid costo value" });
    }
    const doc = await Product.create(req.body);
    return res.status(201).json({ status: "success", data: { data: doc } });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({
          status: "fail",
          message:
            "Duplicate product for this restaurant (nombre + restaurant must be unique)",
        });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ status: "fail", message: err.message });
    }
    return next(err);
  }
};

// Get one with 404 handling
exports.getProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid ID format", 400));
    }
    const doc = await Product.findById(req.params.id);
    if (!doc) {
      return res
        .status(404)
        .json({ status: "fail", message: "No document found with that ID" });
    }
    return res.status(200).json({ status: "success", data: { data: doc } });
  } catch (err) {
    if (err.name === "CastError")
      return next(new AppError("Invalid ID format", 400));
    return next(err);
  }
};

// Update with runValidators and proper 404 handling
exports.updateProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid ID format", 400));
    }
    if (req.body.costo != null) {
      if (typeof req.body.costo !== "number" || req.body.costo < 0) {
        return res
          .status(400)
          .json({ status: "fail", message: "Invalid costo value" });
      }
    }
    const doc = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return res
        .status(404)
        .json({ status: "fail", message: "No document found with that ID" });
    }
    return res.status(200).json({ status: "success", data: { data: doc } });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ status: "fail", message: err.message });
    }
    if (err.name === "CastError")
      return next(new AppError("Invalid ID format", 400));
    return next(err);
  }
};

// Soft delete: mark product inactive
exports.deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid ID format" });
    }
    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!doc) {
      return res
        .status(404)
        .json({ status: "fail", message: "No document found with that ID" });
    }
    return res.status(204).send();
  } catch (err) {
    return res
      .status(500)
      .json({
        status: "error",
        message: "Internal error",
        detail: err.message,
      });
  }
};
