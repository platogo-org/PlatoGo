import { useEffect, useMemo, useCallback } from "react";
import useSocket from "./useSocket";

/**
 * Hook personalizado para sincronización en tiempo real de todos los módulos
 * Implementa todos los eventos requeridos por la tarea:
 * - mesa_actualizada
 * - pedido_nuevo
 * - pedido_actualizado
 * - pedido_enviado_a_cocina
 * - producto_no_disponible
 *
 * @param {Object} options - Opciones de configuración
 * @param {string} options.restaurantId - ID del restaurante
 * @param {string} options.waiterId - ID del mesero (opcional)
 * @param {boolean} options.isKitchen - Si es componente de cocina
 * @param {Function} options.onMesaActualizada - Callback cuando se actualiza una mesa
 * @param {Function} options.onPedidoNuevo - Callback cuando se crea un pedido nuevo
 * @param {Function} options.onPedidoActualizado - Callback cuando se actualiza un pedido
 * @param {Function} options.onPedidoEnviadoACocina - Callback cuando se envía pedido a cocina
 * @param {Function} options.onProductoNoDisponible - Callback cuando un producto no está disponible
 * @returns {Object} - {connected, reconnecting, error, emit}
 */
export const useRealtimeSync = ({
  restaurantId,
  waiterId,
  isKitchen = false,
  onMesaActualizada,
  onPedidoNuevo,
  onPedidoActualizado,
  onPedidoEnviadoACocina,
  onProductoNoDisponible,
}) => {
  // Manejadores de eventos WebSocket estandarizados
  const eventHandlers = useMemo(() => {
    const handlers = {};

    // Evento: Mesa actualizada (incluye transferencias y cambios de estado)
    if (onMesaActualizada) {
      handlers.mesa_actualizada = (data) => {
        console.log("📡 [mesa_actualizada] Evento recibido:", data);
        onMesaActualizada(data);
      };
    }

    // Evento: Nuevo pedido creado
    if (onPedidoNuevo) {
      handlers.pedido_nuevo = (data) => {
        console.log("📡 [pedido_nuevo] Evento recibido:", data);
        onPedidoNuevo(data);
      };
    }

    // Evento: Pedido actualizado
    if (onPedidoActualizado) {
      handlers.pedido_actualizado = (data) => {
        console.log("📡 [pedido_actualizado] Evento recibido:", data);
        onPedidoActualizado(data);
      };
    }

    // Evento: Pedido enviado a cocina
    if (onPedidoEnviadoACocina) {
      handlers.pedido_enviado_a_cocina = (data) => {
        console.log("📡 [pedido_enviado_a_cocina] Evento recibido:", data);
        onPedidoEnviadoACocina(data);
      };
    }

    // Evento: Producto no disponible
    if (onProductoNoDisponible) {
      handlers.producto_no_disponible = (data) => {
        console.log("📡 [producto_no_disponible] Evento recibido:", data);
        onProductoNoDisponible(data);
      };
    }

    // Eventos legacy (mantener compatibilidad con código existente)
    // Estos mapean a los nuevos eventos
    if (onMesaActualizada) {
      handlers.mesaTransferida = (data) => {
        console.log("📡 [mesaTransferida] Legacy event -> mesa_actualizada");
        onMesaActualizada({ ...data, tipo: "transferencia" });
      };
      handlers.mesaEstadoActualizado = (data) => {
        console.log(
          "📡 [mesaEstadoActualizado] Legacy event -> mesa_actualizada"
        );
        onMesaActualizada({ ...data, tipo: "cambio_estado" });
      };
    }

    if (onPedidoEnviadoACocina) {
      handlers.orderToKitchen = (data) => {
        console.log(
          "📡 [orderToKitchen] Legacy event -> pedido_enviado_a_cocina"
        );
        onPedidoEnviadoACocina(data);
      };
    }

    if (onPedidoActualizado) {
      handlers.orderStatusUpdated = (data) => {
        console.log(
          "📡 [orderStatusUpdated] Legacy event -> pedido_actualizado"
        );
        onPedidoActualizado(data);
      };
      handlers.orderStatusChanged = (data) => {
        console.log(
          "📡 [orderStatusChanged] Legacy event -> pedido_actualizado"
        );
        onPedidoActualizado(data);
      };
    }

    return handlers;
  }, [
    onMesaActualizada,
    onPedidoNuevo,
    onPedidoActualizado,
    onPedidoEnviadoACocina,
    onProductoNoDisponible,
  ]);

  // Usar el hook de socket con los handlers configurados
  const { connected, reconnecting, error, emit, reconnect } = useSocket({
    restaurantId,
    waiterId,
    isKitchen,
    eventHandlers,
  });

  // Log de eventos suscritos
  useEffect(() => {
    console.log("🔔 Eventos suscritos:", Object.keys(eventHandlers));
  }, [eventHandlers]);

  // Helpers para emitir eventos desde el frontend si es necesario
  const emitMesaActualizada = useCallback(
    (data) => {
      emit("mesa_actualizada", data);
    },
    [emit]
  );

  const emitPedidoNuevo = useCallback(
    (data) => {
      emit("pedido_nuevo", data);
    },
    [emit]
  );

  const emitPedidoActualizado = useCallback(
    (data) => {
      emit("pedido_actualizado", data);
    },
    [emit]
  );

  return {
    connected,
    reconnecting,
    error,
    emit,
    reconnect,
    // Métodos específicos para emitir eventos
    emitMesaActualizada,
    emitPedidoNuevo,
    emitPedidoActualizado,
  };
};

export default useRealtimeSync;
