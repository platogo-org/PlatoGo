// Load environment variables from config.env
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// Import express app and mongoose
const app = require("./app");
const mongoose = require("mongoose");

// Handle uncaught exceptions (synchronous errors outside Express)
process.on("uncaughtException", (err) => {
  console.log("UNHANDLED EXCEPTION. Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// Build MongoDB connection string
const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// Connect to MongoDB database
mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});

// Start server on specified port. If process not found default is 3000
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Integrar socket.io
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:4000",
      "http://localhost",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado a WebSocket");
});

// Exportar io para usar en controladores
module.exports.io = io;

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION. Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
