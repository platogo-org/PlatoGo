// Script para importar órdenes de ejemplo a MongoDB
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Order = require("../models/orderModel");
require("dotenv").config({ path: path.join(__dirname, "../config.env") });

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});

const orders = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sampleOrders.json"), "utf-8")
);

const importData = async () => {
  try {
    await Order.create(orders);
    console.log("Órdenes importadas correctamente!");
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Order.deleteMany();
    console.log("Órdenes eliminadas!");
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else {
  console.log("Usa --import para cargar o --delete para borrar las órdenes.");
  process.exit();
}
