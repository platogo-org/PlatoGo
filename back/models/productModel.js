const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "A product must have a name"],
      trim: true,
    },
    ingredientes: [
      {
        type: String,
        trim: true,
      },
    ],
    costo: {
      type: Number,
      required: [true, "A product must have a price"],
      min: [0, "Price must be greater than 0"],
    },
    // Referencia al restaurante
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: "Restaurant",
      required: [true, "A product must belong to a restaurant"],
    },
    // Referencias a categorías
    categorias: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index compuesto para búsquedas eficientes
productSchema.index({ restaurant: 1, active: 1 });
productSchema.index({ categorias: 1 });
productSchema.index({ nombre: 1, restaurant: 1 }, { unique: true });

// Only return active products by default
productSchema.pre(/^find/, function(next) {
  if (!this.getFilter().hasOwnProperty('active')) {
    this.where({ active: { $ne: false } });
  }
  next();
});

// Middleware para populate automático
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

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
