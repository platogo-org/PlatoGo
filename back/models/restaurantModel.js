// Import mongoose for schema and model creation
const mongoose = require("mongoose");

// Define Restaurant schema
const restaurantSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "A restaurant must have a name"], // Restaurant name is required
      trim: true,
    },
    direccion: {
      type: String,
      required: [true, "A restaurant must have an address"], // Address is required
      trim: true,
    },
    horario: {
      type: Date,
      required: [true, "A restaurant must have a schedule"], // Schedule is required
    },
    datosfacturacion: {
      type: String,
      default: null,
      trim: true, // Optional billing data
    },
    usuario: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A restaurant must have an owner"], // Reference to User (owner)
    },
    active: {
      type: Boolean,
      default: true, // Restaurant is active by default
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for products in this restaurant
restaurantSchema.virtual("productos", {
  ref: "Product",
  foreignField: "restaurant",
  localField: "_id",
});

// Virtual populate for orders in this restaurant
restaurantSchema.virtual("pedidos", {
  ref: "Order",
  foreignField: "restaurant",
  localField: "_id",
});

// Middleware to automatically populate owner (usuario) on find queries
restaurantSchema.pre(/^find/, function (next) {
  this.populate({
    path: "usuario",
    select: "name email role",
  });
  next();
});

// Create and export Restaurant model
const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
