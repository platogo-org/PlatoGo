const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config.env" });

// Import models
const User = require("../models/userModel");
const Restaurant = require("../models/restaurantModel");

// Connect to MongoDB
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
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

// Create sample waiters
const createWaiters = async () => {
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

    // Verificar si ya existen meseros
    const existingWaiters = await User.find({
      role: "restaurant-waiter",
      restaurant: restaurant._id,
    });

    console.log(`📊 Meseros existentes: ${existingWaiters.length}`);

    if (existingWaiters.length > 0) {
      console.log("ℹ️ Ya existen meseros en este restaurante:");
      existingWaiters.forEach((waiter) => {
        console.log(`   - ${waiter.name} (${waiter.email})`);
      });
      console.log(
        "\n¿Deseas agregar más meseros de prueba? (Ctrl+C para cancelar)"
      );
    }

    // Crear meseros de prueba
    const sampleWaiters = [
      {
        name: "Carlos Mesero",
        email: "carlos@waiter.com",
        password: "test1234",
        passwordConfirm: "test1234",
        role: "restaurant-waiter",
        restaurant: restaurant._id,
      },
      {
        name: "Maria Mesera",
        email: "maria@waiter.com",
        password: "test1234",
        passwordConfirm: "test1234",
        role: "restaurant-waiter",
        restaurant: restaurant._id,
      },
      {
        name: "Juan Servidor",
        email: "juan@waiter.com",
        password: "test1234",
        passwordConfirm: "test1234",
        role: "restaurant-waiter",
        restaurant: restaurant._id,
      },
    ];

    console.log("\n📝 Creando meseros de prueba...");

    for (const waiterData of sampleWaiters) {
      try {
        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email: waiterData.email });
        if (existingUser) {
          console.log(`⚠️  Email ${waiterData.email} ya existe, saltando...`);
          continue;
        }

        const waiter = await User.create(waiterData);
        console.log(`✅ Mesero creado: ${waiter.name} (${waiter.email})`);
      } catch (err) {
        console.error(`❌ Error creando ${waiterData.name}:`, err.message);
      }
    }

    // Mostrar todos los meseros del restaurante
    const allWaiters = await User.find({
      role: "restaurant-waiter",
      restaurant: restaurant._id,
    });

    console.log("\n✅ Meseros totales en el restaurante:");
    allWaiters.forEach((waiter) => {
      console.log(`   - ${waiter.name} (${waiter.email})`);
    });
    console.log(`\n📊 Total: ${allWaiters.length} meseros`);
  } catch (err) {
    console.error("❌ Error:", err);
  }
  process.exit();
};

// Delete all waiters
const deleteWaiters = async () => {
  try {
    const restaurant = await Restaurant.findOne();
    if (!restaurant) {
      console.log("❌ No se encontró ningún restaurante.");
      process.exit(1);
    }

    const result = await User.deleteMany({
      role: "restaurant-waiter",
      restaurant: restaurant._id,
    });

    console.log(`✅ ${result.deletedCount} meseros fueron eliminados!`);
  } catch (err) {
    console.error("❌ Error eliminando meseros:", err);
  }
  process.exit();
};

// Check command line arguments
if (process.argv[2] === "--create") {
  createWaiters();
} else if (process.argv[2] === "--delete") {
  deleteWaiters();
} else {
  console.log("❌ Comando no válido");
  console.log("Uso:");
  console.log("  node createWaiters.js --create   // Crear meseros de prueba");
  console.log(
    "  node createWaiters.js --delete   // Eliminar todos los meseros"
  );
  process.exit();
}
