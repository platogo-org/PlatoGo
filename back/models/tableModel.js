const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre de la mesa es obligatorio"],
    trim: true,
    minlength: [2, "El nombre debe tener al menos 2 caracteres"],
  },
  capacity: {
    type: Number,
    required: [true, "La capacidad es obligatoria"],
    min: [1, "La capacidad mínima es 1"],
  },
  location: {
    type: String,
    required: [true, "La ubicación es obligatoria"],
    trim: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: [true, "La mesa debe estar asociada a un restaurante"],
  },
  estado: {
    type: String,
    enum: ["libre", "ocupada", "cuenta"],
    default: "libre",
    required: true,
  },
  assignedWaiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  transferHistory: [
    {
      from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
      supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});

module.exports = mongoose.model("Table", tableSchema);
