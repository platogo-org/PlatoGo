const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    productos: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
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
      ],
      default: "pending",
    },
    // Referencia al restaurante
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: "Restaurant",
      required: [true, "An order must belong to a restaurant"],
    },
    // Referencia al cliente
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "An order must have a customer"],
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    notas: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index para búsquedas eficientes
orderSchema.index({ restaurant: 1, estado: 1 });
orderSchema.index({ customer: 1 });

// Middleware para populate automático
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "customer",
    select: "name email",
  })
    .populate({
      path: "restaurant",
      select: "nombre direccion",
    })
    .populate({
      path: "productos.product",
      select: "nombre costo",
    });
  next();
});

// Middleware para calcular el total automáticamente
orderSchema.pre("save", function (next) {
  if (this.productos && this.productos.length > 0) {
    this.total = this.productos.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
