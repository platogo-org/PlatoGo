// Script para poblar la base de datos con datos de ejemplo correctamente vinculados
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Restaurant = require("../models/restaurantModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
require("dotenv").config({ path: path.join(__dirname, "../config.env") });

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const sampleRestaurants = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sampleRestaurants.json"), "utf-8")
);
const sampleUsers = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sampleUsers.json"), "utf-8")
);
const sampleCategories = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sampleCategories.json"), "utf-8")
);
const sampleDishes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sampleDishes.json"), "utf-8")
);
const sampleOrders = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sampleOrders.json"), "utf-8")
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});

async function importAll() {
  try {
    // Limpia las colecciones
    await Order.deleteMany();
    await Product.deleteMany();
    await Restaurant.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    // Crea usuarios demo
    const users = await User.create(sampleUsers);

    // Crea restaurantes y vincula un owner (usuario) a cada uno
    const restaurants = await Restaurant.create(
      sampleRestaurants.map((rest, i) => ({
        ...rest,
        usuario: users[i % users.length]._id,
      }))
    );

    // Crea categorías
    const categories = await Category.create(sampleCategories);

    // Asigna restaurantes y categorías a los platillos
    const restaurantIds = restaurants.map((r) => r._id);
    const categoryIds = categories.map((c) => c._id);

    // Distribuye platillos entre restaurantes y categorías
    const dishesWithLinks = sampleDishes.map((dish, i) => {
      const restIdx = i % restaurantIds.length;
      const catIdx = i % categoryIds.length;
      return {
        ...dish,
        restaurant: restaurantIds[restIdx],
        categorias: [categoryIds[catIdx]],
        ingredientes: dish.ingredientes || [],
        active: true,
      };
    });
    const products = await Product.create(dishesWithLinks);

    // Crea órdenes de ejemplo con productos y restaurantes válidos y asigna un usuario existente como customer
    const ordersWithLinks = sampleOrders.map((order, i) => {
      // Selecciona productos aleatorios para la orden
      const prods = [products[i % products.length]];
      return {
        ...order,
        productos: prods.map((p) => ({
          product: p._id,
          quantity: 1,
          price: p.costo,
        })),
        restaurant: prods[0].restaurant,
        customer: users[i % users.length]._id,
        total: prods.reduce((sum, p) => sum + p.costo, 0),
      };
    });
    await Order.create(ordersWithLinks);

    console.log("¡Datos de ejemplo importados y vinculados correctamente!");
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

if (process.argv[2] === "--import") {
  importAll();
} else {
  console.log(
    "Usa --import para poblar la base de datos con datos vinculados."
  );
  process.exit();
}
