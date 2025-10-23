// Módulo para manejar socket.io
let io = null;

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
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
      console.log("Nuevo cliente conectado a WebSocket, ID:", socket.id);

      socket.on("disconnect", () => {
        console.log("Cliente desconectado, ID:", socket.id);
      });
    });

    console.log("Socket.io inicializado correctamente");
    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io no ha sido inicializado");
    }
    return io;
  },
};
