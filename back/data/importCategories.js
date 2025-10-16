// Script para importar categorías de ejemplo a MongoDB
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Category = require("../models/categoryModel");
require("dotenv").config({ path: path.join(__dirname, "../config.env") });

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});

const categories = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sampleCategories.json"), "utf-8")
);

const importData = async () => {
  try {
    await Category.create(categories);
    console.log("Categorías importadas correctamente!");
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Category.deleteMany();
    console.log("Categorías eliminadas!");
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
  console.log(
    "Usa --import para cargar o --delete para borrar las categorías."
  );
  process.exit();
}
