const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config.env" });

// Import models
const User = require("../models/userModel");
const Restaurant = require("../models/restaurantModel");

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
    process.exit(1);
  });

// Update waiters without restaurant
const updateWaiters = async () => {
  try {
    // Get the first restaurant
    const restaurant = await Restaurant.findOne();

    if (!restaurant) {
      console.log("❌ No se encontró ningún restaurante en la base de datos.");
      process.exit(1);
    }

    console.log(
      `✅ Usando restaurante: ${restaurant.nombre} (${restaurant._id})`
    );

    // Find all users without restaurant (admins and waiters)
    const users = await User.find({
      role: { $in: ["restaurant-admin", "restaurant-waiter"] },
      restaurant: null,
    });

    console.log(`📋 Encontrados ${users.length} usuarios sin restaurante`);

    if (users.length === 0) {
      console.log("✅ Todos los usuarios ya tienen restaurante asignado");
      process.exit(0);
    }

    // Update all users
    const result = await User.updateMany(
      {
        role: { $in: ["restaurant-admin", "restaurant-waiter"] },
        restaurant: null,
      },
      {
        $set: { restaurant: restaurant._id },
      }
    );

    console.log(`✅ ${result.modifiedCount} usuarios actualizados`);
    console.log("\n📊 Usuarios actualizados:");
    users.forEach((user) => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
  } catch (err) {
    console.error("❌ Error actualizando usuarios:", err);
  }
  process.exit();
};

// Run the update
updateWaiters();
