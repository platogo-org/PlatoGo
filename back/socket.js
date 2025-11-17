// Módulo para manejar socket.io
let io = null;

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      // Configuración para reconexión automática y keepAlive
      pingTimeout: 60000, // Tiempo máximo sin recibir pong antes de cerrar conexión
      pingInterval: 25000, // Intervalo de envío de ping
      connectTimeout: 45000, // Timeout de conexión inicial
      transports: ["polling", "websocket"], // Priorizar polling, fallback a websocket
    });

    io.on("connection", (socket) => {
      console.log("✅ Nuevo cliente conectado a WebSocket, ID:", socket.id);

      // Emitir evento de prueba inmediatamente
      socket.emit("testConnection", {
        message: "Conexión establecida correctamente",
        socketId: socket.id,
        timestamp: Date.now(),
      });
      console.log("📤 Evento testConnection emitido a", socket.id);

      // Unirse a un room específico del restaurante
      socket.on("joinRestaurant", (restaurantId) => {
        if (restaurantId) {
          socket.join(`restaurant_${restaurantId}`);
          console.log(
            `Socket ${socket.id} se unió al restaurante ${restaurantId}`
          );
          socket.emit("joinedRestaurant", {
            restaurantId,
            message: "Successfully joined restaurant channel",
          });
        }
      });

      // Unirse a un room específico de cocina
      socket.on("joinKitchen", (restaurantId) => {
        if (restaurantId) {
          socket.join(`kitchen_${restaurantId}`);
          console.log(
            `Socket ${socket.id} se unió a la cocina del restaurante ${restaurantId}`
          );
          socket.emit("joinedKitchen", {
            restaurantId,
            message: "Successfully joined kitchen channel",
          });
        }
      });

      // Unirse a un room específico de mesero
      socket.on("joinWaiter", (waiterId) => {
        if (waiterId) {
          socket.join(`waiter_${waiterId}`);
          console.log(
            `Socket ${socket.id} se unió al canal del mesero ${waiterId}`
          );
          socket.emit("joinedWaiter", {
            waiterId,
            message: "Successfully joined waiter channel",
          });
        }
      });

      // Manejar errores de conexión
      socket.on("error", (error) => {
        console.error("❌ Error en socket:", socket.id, error);
      });

      // Heartbeat personalizado (opcional, además del ping/pong automático)
      socket.on("heartbeat", () => {
        socket.emit("heartbeat-response", { timestamp: Date.now() });
      });

      socket.on("disconnect", (reason) => {
        console.log(
          `❌ Cliente desconectado, ID: ${socket.id}, Razón: ${reason}`
        );
      });

      // Reconexión exitosa
      socket.on("reconnect", (attemptNumber) => {
        console.log(
          `🔄 Cliente reconectado, ID: ${socket.id}, Intentos: ${attemptNumber}`
        );
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

  // Emitir evento a un restaurante específico
  emitToRestaurant: (restaurantId, event, data) => {
    if (!io) {
      throw new Error("Socket.io no ha sido inicializado");
    }
    io.to(`restaurant_${restaurantId}`).emit(event, data);
    console.log(`📡 Evento '${event}' emitido al restaurante ${restaurantId}`);
  },

  // Emitir evento a cocina específica
  emitToKitchen: (restaurantId, event, data) => {
    if (!io) {
      throw new Error("Socket.io no ha sido inicializado");
    }
    io.to(`kitchen_${restaurantId}`).emit(event, data);
    console.log(
      `🍳 Evento '${event}' emitido a cocina del restaurante ${restaurantId}`
    );
  },

  // Emitir evento a mesero específico
  emitToWaiter: (waiterId, event, data) => {
    if (!io) {
      throw new Error("Socket.io no ha sido inicializado");
    }
    io.to(`waiter_${waiterId}`).emit(event, data);
    console.log(`👤 Evento '${event}' emitido al mesero ${waiterId}`);
  },
};
