// Import mongoose for schema and model creation
const mongoose = require("mongoose");

// Define Order schema
const orderSchema = new mongoose.Schema(
  {
    // orderId personalizado ya no es requerido ni único
    orderId: {
      type: String,
      trim: true,
    },
    productos: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true, // Reference to Product
        },
        quantity: {
          type: Number,
          required: true,
          min: 1, // Minimum quantity is 1
        },
        price: {
          type: Number,
          required: true,
          min: 0, // Minimum price is 0
        },
      },
    ],
    estado: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ], // Possible order states
      default: "pending",
    },
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: "Restaurant",
      required: [true, "An order must belong to a restaurant"], // Reference to Restaurant
    },
    // customer eliminado, la orden ya no requiere usuario
    subtotal: {
      type: Number,
      min: 0, // Subtotal before taxes and tips
      default: 0,
    },
    tax: {
      type: Number,
      min: 0, // Tax amount
      default: 0,
    },
    tip: {
      type: Number,
      default: 0, // Tip amount, editable before order closure
      min: 0,
    },
    table: {
      type: mongoose.Schema.ObjectId,
      ref: "Table",
      required: [true, "An order must be associated with a table"], // Reference to Table
    },
    assignedWaiter: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // Asumiendo que el mesero es un User
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to calculate total dynamically
orderSchema.virtual("total").get(function () {
  return this.subtotal + this.tax + this.tip;
});

// Indexes for efficient queries
orderSchema.index({ restaurant: 1, estado: 1 });
orderSchema.index({ table: 1, estado: 1 });
orderSchema.index({ customer: 1 });

// Middleware to automatically populate references on find queries
// COMENTADO TEMPORALMENTE - puede causar problemas con save()
// orderSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "restaurant",
//     select: "nombre direccion",
//   }).populate({
//     path: "productos.product",
//     select: "nombre costo",
//   });
//   next();
// });

// Middleware to automatically calculate total before saving
orderSchema.pre("save", function (next) {
  if (this.productos && this.productos.length > 0) {
    this.total = this.productos.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }
  next();
});

// Create and export Order model
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
