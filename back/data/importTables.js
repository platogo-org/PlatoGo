const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config.env" });

// Import models
const Table = require("../models/tableModel");
const Restaurant = require("../models/restaurantModel");
const User = require("../models/userModel"); // Necesario para populate

// Connect to MongoDB
const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("✅ DB connection successful!"))
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
    console.log("\n⚠️  Verifica tu config.env:");
    console.log("   - DATABASE: URL correcta de MongoDB");
    console.log("   - DATABASE_PASSWORD: Contraseña correcta");
    process.exit(1);
  });

// Read JSON files
const tables = JSON.parse(
  fs.readFileSync(`${__dirname}/sampleTables.json`, "utf-8")
);

// Import data into DB
const importData = async () => {
  try {
    // Primero, obtener el primer restaurante de la base de datos
    const restaurant = await Restaurant.findOne();

    if (!restaurant) {
      console.log("❌ No se encontró ningún restaurante en la base de datos.");
      console.log("Por favor, crea un restaurante primero.");
      process.exit(1);
    }

    console.log(
      `✅ Usando restaurante: ${restaurant.nombre} (${restaurant._id})`
    );

    // Agregar el restaurant ID a cada mesa
    const tablesWithRestaurant = tables.map((table) => ({
      ...table,
      restaurant: restaurant._id,
    }));

    await Table.create(tablesWithRestaurant);
    console.log(`✅ ${tables.length} mesas importadas exitosamente!`);
    console.log("📊 Mesas creadas:");
    tablesWithRestaurant.forEach((table) => {
      console.log(
        `   - ${table.name} (Capacidad: ${table.capacity}, Ubicación: ${table.location})`
      );
    });
  } catch (err) {
    console.error("❌ Error importando mesas:", err);
  }
  process.exit();
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await Table.deleteMany();
    console.log("✅ Todas las mesas fueron eliminadas!");
  } catch (err) {
    console.error("❌ Error eliminando mesas:", err);
  }
  process.exit();
};

// Check command line arguments
if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else {
  console.log("❌ Comando no válido");
  console.log("Uso:");
  console.log("  node importTables.js --import   // Importar mesas");
  console.log("  node importTables.js --delete   // Eliminar todas las mesas");
  process.exit();
}
