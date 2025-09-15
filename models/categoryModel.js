const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "A category must have a name"],
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate para productos de esta categoría
categorySchema.virtual("productos", {
  ref: "Product",
  foreignField: "categorias",
  localField: "_id",
});

const Category = mongoose.model("Category", categorySchema);
