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
    availableModifiers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Modifier",
      },
    ],
    defaultModifiers: [
      {
        modifier: {
          type: mongoose.Schema.ObjectId,
          ref: "Modifier",
        },
        included: {
          type: Boolean,
          default: true,
        },
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
productSchema.index({ nombre: 1, restaurant: 1 }, { unique: true });

// Only return active products by default
productSchema.pre(/^find/, function (next) {
  if (!this.getFilter().hasOwnProperty("active")) {
    this.where({ active: { $ne: false } });
  }
  next();
});

// Only return active products by default
productSchema.pre(/^find/, function(next) {
  if (!this.getFilter().hasOwnProperty('active')) {
    this.where({ active: { $ne: false } });
  }
  next();
});

// Middleware to automatically populate references on find queries
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "restaurant",
    select: "nombre direccion",
  }).populate({
    path: "categorias",
    select: "nombre",
  }).populate({
    path: "availableModifiers",
    select: 'name type priceAdjustment'
  }).populate({
    path: "defaultModifiers.modifier",
    select: 'name type priceAdjustment'
  });
  next();
});

// Method to calculate final price with modifiers
productSchema.methods.calculatePrice = function(selectedModifiers = []) {
  let finalPrice = this.costo;

  // Add price adjustments from selected modifiers
  selectedModifiers.forEach(modifierId => {
    const modifier = this.availableModifiers.id(modifierId);
    if (modifier) {
      finalPrice += modifier.priceAdjustment;
    }
  });

  // Add price adjustments from default modifiers that are included
  this.defaultModifiers.forEach(defaultMod => {
    if (defaultMod.included) {
      finalPrice += defaultMod.modifier.priceAdjustment;
    }
  });

  return finalPrice;
};

// Virtual property to get base price with default modifiers
productSchema.virtual('basePrice').get(function() {
  return this.calculatePrice();
});

// Create and export Product model
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
