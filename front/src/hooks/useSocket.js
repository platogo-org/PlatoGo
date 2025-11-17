import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

// Usar window.SOCKET_URL (inyectado en runtime) o fallback a localhost
const SOCKET_URL = window.SOCKET_URL || "http://localhost:4000";

/**
 * Hook personalizado para manejar conexiones WebSocket con reconexión automática
 * @param {Object} options - Opciones de configuración
 * @param {string} options.restaurantId - ID del restaurante para unirse al canal específico
 * @param {string} options.waiterId - ID del mesero para unirse al canal específico
 * @param {boolean} options.isKitchen - Si es true, se une al canal de cocina
 * @param {Object} options.eventHandlers - Objeto con manejadores de eventos {eventName: handler}
 * @returns {Object} - {socket, connected, error, reconnecting}
 */
export const useSocket = ({
  restaurantId,
  waiterId,
  isKitchen = false,
  eventHandlers = {},
}) => {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  // Inicializar socket
  useEffect(() => {
    console.log("🔌 Inicializando conexión WebSocket a:", SOCKET_URL);
    console.log("🔧 Configuración:", {
      restaurantId,
      waiterId,
      isKitchen,
      hasEventHandlers: Object.keys(eventHandlers).length,
    });

    const socketInstance = io(SOCKET_URL, {
      // Usar polling primero, luego intentar upgrade a websocket
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
      timeout: 20000,
      autoConnect: true,
      // Permitir upgrade a WebSocket si está disponible
      upgrade: true,
    });

    socketRef.current = socketInstance;

    // Evento: Conexión exitosa
    socketInstance.on("connect", () => {
      console.log("✅ Socket conectado, ID:", socketInstance.id);
      setConnected(true);
      setReconnecting(false);
      setError(null);
      reconnectAttemptsRef.current = 0;

      // Unirse a canales específicos según configuración
      if (restaurantId) {
        socketInstance.emit("joinRestaurant", restaurantId);
        console.log(`📡 Uniéndose al canal del restaurante: ${restaurantId}`);
      }

      if (isKitchen && restaurantId) {
        socketInstance.emit("joinKitchen", restaurantId);
        console.log(`🍳 Uniéndose al canal de cocina: ${restaurantId}`);
      }

      if (waiterId) {
        socketInstance.emit("joinWaiter", waiterId);
        console.log(`👤 Uniéndose al canal del mesero: ${waiterId}`);
      }
    });

    // Evento: Desconexión
    socketInstance.on("disconnect", (reason) => {
      console.log(`❌ Socket desconectado. Razón: ${reason}`);
      setConnected(false);

      if (reason === "io server disconnect") {
        // El servidor forzó la desconexión, reconectar manualmente
        socketInstance.connect();
      }
    });

    // Evento: Intentando reconectar
    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Intento de reconexión #${attemptNumber}...`);
      setReconnecting(true);
      reconnectAttemptsRef.current = attemptNumber;
    });

    // Evento: Reconexión exitosa
    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconexión exitosa después de ${attemptNumber} intentos`);
      setConnected(true);
      setReconnecting(false);
      setError(null);
      reconnectAttemptsRef.current = 0;
    });

    // Evento: Error de reconexión
    socketInstance.on("reconnect_error", (err) => {
      console.error("❌ Error al reconectar:", err.message);
      setError(`Error de reconexión: ${err.message}`);
    });

    // Evento: Falló la reconexión después de todos los intentos
    socketInstance.on("reconnect_failed", () => {
      console.error("❌ Reconexión fallida después de todos los intentos");
      setError("No se pudo reconectar al servidor");
      setReconnecting(false);
    });

    // Evento: Error de conexión
    socketInstance.on("connect_error", (err) => {
      console.error("❌ Error de conexión:", err.message);
      setError(`Error de conexión: ${err.message}`);
      setConnected(false);
    });

    // Evento: Error general
    socketInstance.on("error", (err) => {
      console.error("❌ Error en socket:", err);
      setError(`Error: ${err.message || err}`);
    });

    // Heartbeat personalizado (cada 30 segundos)
    const heartbeatInterval = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit("heartbeat");
      }
    }, 30000);

    // Registrar event handlers personalizados
    console.log("📋 Registrando event handlers:", Object.keys(eventHandlers));
    Object.entries(eventHandlers).forEach(([eventName, handler]) => {
      socketInstance.on(eventName, (data) => {
        console.log(`📨 ¡EVENTO RECIBIDO! ${eventName}`, data);
        handler(data);
      });
      console.log(`✅ Handler registrado para: ${eventName}`);
    });

    // Cleanup
    return () => {
      console.log("🧹 Limpiando conexión socket...");
      clearInterval(heartbeatInterval);

      // Remover event handlers personalizados
      Object.keys(eventHandlers).forEach((eventName) => {
        socketInstance.off(eventName);
      });

      socketInstance.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, waiterId, isKitchen]); // Dependencias principales, eventHandlers se maneja en efecto separado

  // Re-registrar event handlers cuando cambien
  useEffect(() => {
    const socketInstance = socketRef.current;
    if (!socketInstance) return;

    // Limpiar handlers anteriores
    Object.keys(eventHandlers).forEach((eventName) => {
      socketInstance.off(eventName);
    });

    // Registrar nuevos handlers
    Object.entries(eventHandlers).forEach(([eventName, handler]) => {
      socketInstance.on(eventName, handler);
    });

    return () => {
      Object.keys(eventHandlers).forEach((eventName) => {
        socketInstance.off(eventName);
      });
    };
  }, [eventHandlers]);

  // Método para emitir eventos
  const emit = useCallback((eventName, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(eventName, data);
      console.log(`📤 Evento emitido: ${eventName}`, data);
    } else {
      console.warn("⚠️ No se puede emitir evento, socket no conectado");
    }
  }, []);

  // Método para reconectar manualmente
  const reconnect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      console.log("🔄 Reconectando manualmente...");
      socketRef.current.connect();
    }
  }, []);

  return {
    socket: socketRef.current,
    connected,
    reconnecting,
    error,
    emit,
    reconnect,
    reconnectAttempts: reconnectAttemptsRef.current,
  };
};

export default useSocket;
