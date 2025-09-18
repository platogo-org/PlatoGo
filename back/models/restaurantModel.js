const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "A restaurant must have a name"],
      trim: true,
    },
    direccion: {
      type: String,
      required: [true, "A restaurant must have an address"],
      trim: true,
    },
    horario: {
      type: Date,
      required: [true, "A restaurant must have a schedule"],
    },
    datosfacturacion: {
      type: String,
      default: null,
      trim: true,
    },
    // Referencia al usuario propietario
    usuario: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A restaurant must have an owner"],
    },
    // Referencias virtuales a productos y pedidos
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

// Virtual populate para productos
restaurantSchema.virtual("productos", {
  ref: "Product",
  foreignField: "restaurant",
  localField: "_id",
});

// Virtual populate para pedidos
restaurantSchema.virtual("pedidos", {
  ref: "Order",
  foreignField: "restaurant",
  localField: "_id",
});

// Middleware para populate automático del usuario
restaurantSchema.pre(/^find/, function (next) {
  this.populate({
    path: "usuario",
    select: "name email role",
  });
  next();
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
