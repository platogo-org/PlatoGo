// Import mongoose for schema and model creation
const mongoose = require("mongoose");

// Define Product schema
const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "A product must have a name"], // Product name is required
      trim: true,
    },
    ingredientes: [
      {
        type: String,
        trim: true, // List of ingredients
      },
    ],
    costo: {
      type: Number,
      required: [true, "A product must have a price"], // Product price is required
      min: [0, "Price must be greater than 0"],
    },
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: "Restaurant",
      required: [true, "A product must belong to a restaurant"], // Reference to Restaurant
    },
    categorias: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Category", // Reference to Category
      },
    ],
    active: {
      type: Boolean,
      default: true, // Product is active by default
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
productSchema.index({ restaurant: 1, active: 1 });
productSchema.index({ categorias: 1 });

// Middleware to automatically populate references on find queries
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "restaurant",
    select: "nombre direccion",
  }).populate({
    path: "categorias",
    select: "nombre",
  });
  next();
});

// Create and export Product model
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
