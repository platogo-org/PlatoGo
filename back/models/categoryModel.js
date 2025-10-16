// Import mongoose for schema and model creation
const mongoose = require("mongoose");

// Define Category schema
const categorySchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "A category must have a name"], // Category name is required
      trim: true,
      unique: true, // Name must be unique
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for products in this category
categorySchema.virtual("productos", {
  ref: "Product",
  foreignField: "categorias",
  localField: "_id",
});

// Create and export Category model
const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
