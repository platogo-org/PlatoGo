// Script para importar platillos de ejemplo a MongoDB
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Product = require("../models/productModel");
require("dotenv").config({ path: path.join(__dirname, "../config.env") });

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});

const dishes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sampleDishes.json"), "utf-8")
);

const importData = async () => {
  try {
    await Product.create(dishes);
    console.log("Platillos importados correctamente!");
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Product.deleteMany();
    console.log("Platillos eliminados!");
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
  console.log("Usa --import para cargar o --delete para borrar los platillos.");
  process.exit();
}
