// Script para importar usuarios de ejemplo a MongoDB
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const User = require("../models/userModel");
require("dotenv").config({ path: path.join(__dirname, "../config.env") });

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});

const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sampleUsers.json"), "utf-8")
);

const importData = async () => {
  try {
    await User.create(users);
    console.log("Usuarios importados correctamente!");
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log("Usuarios eliminados!");
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
  console.log("Usa --import para cargar o --delete para borrar los usuarios.");
  process.exit();
}
