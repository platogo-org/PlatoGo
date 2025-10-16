// Script para importar restaurantes de ejemplo a MongoDB
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Restaurant = require("../models/restaurantModel");
require("dotenv").config({ path: path.join(__dirname, "../config.env") });

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});

const restaurants = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sampleRestaurants.json"), "utf-8")
);

const importData = async () => {
  try {
    await Restaurant.create(restaurants);
    console.log("Restaurantes importados correctamente!");
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Restaurant.deleteMany();
    console.log("Restaurantes eliminados!");
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
    "Usa --import para cargar o --delete para borrar los restaurantes."
  );
  process.exit();
}
