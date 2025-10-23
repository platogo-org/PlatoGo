# Sistema de Actualización en Tiempo Real con WebSocket

Este documento explica el sistema de actualización en tiempo real implementado con Socket.io para PlatoGo.

## 🎯 Características Implementadas

1. **Canal WebSocket activo entre cliente, mesero y cocina**

   - Conexión bidireccional en tiempo real
   - Canales específicos por restaurante, cocina y mesero
   - Arquitectura pub/sub para eventos dirigidos

2. **Actualización en tiempo real de estados y pedidos**

   - Cambios de estado de mesas (libre, ocupada, cuenta)
   - Transferencia de mesas entre meseros
   - Actualización de estado de pedidos (pending → preparing → ready → delivered)
   - Notificaciones instantáneas a todos los usuarios relevantes

3. **Reconexión automática ante pérdida de conexión**
   - Intentos automáticos de reconexión (hasta 10 intentos)
   - Heartbeat/ping-pong para mantener conexión activa
   - Feedback visual del estado de conexión
   - Manejo robusto de errores de red

## 🏗️ Arquitectura

### Backend (Node.js + Socket.io)

#### Archivo: `back/socket.js`

El módulo principal que maneja todas las conexiones WebSocket:

**Características:**

- Configuración de CORS para permitir conexiones del frontend
- Timeouts y configuración de reconexión
- Rooms/Canales específicos por contexto:
  - `restaurant_{id}`: Canal del restaurante (admin, meseros)
  - `kitchen_{id}`: Canal de cocina
  - `waiter_{id}`: Canal específico de cada mesero

**Métodos principales:**

```javascript
// Emitir evento a un restaurante específico
socketIO.emitToRestaurant(restaurantId, "eventName", data);

// Emitir evento a cocina específica
socketIO.emitToKitchen(restaurantId, "eventName", data);

// Emitir evento a mesero específico
socketIO.emitToWaiter(waiterId, "eventName", data);
```

### Frontend (React + Socket.io-client)

#### Hook personalizado: `front/src/hooks/useSocket.js`

Un hook de React reutilizable que encapsula toda la lógica de WebSocket:

**Características:**

- Reconexión automática con estrategia exponential backoff
- Manejo de estado de conexión (connected, reconnecting, error)
- Event handlers dinámicos y configurables
- Heartbeat personalizado adicional
- Unión automática a canales según rol

**Uso:**

```javascript
const { connected, reconnecting, error, emit, reconnect } = useSocket({
  restaurantId: "123",
  waiterId: "456",
  isKitchen: false,
  eventHandlers: {
    orderStatusChanged: (order) => {
      console.log("Orden actualizada:", order);
    },
  },
});
```

## 📡 Eventos WebSocket

### Eventos del Cliente (Emitidos por Frontend)

| Evento           | Descripción                     | Payload        |
| ---------------- | ------------------------------- | -------------- |
| `joinRestaurant` | Unirse al canal del restaurante | `restaurantId` |
| `joinKitchen`    | Unirse al canal de cocina       | `restaurantId` |
| `joinWaiter`     | Unirse al canal del mesero      | `waiterId`     |
| `heartbeat`      | Ping personalizado              | -              |

### Eventos del Servidor (Emitidos por Backend)

| Evento                  | Descripción                          | Payload                              | Destinatarios                      |
| ----------------------- | ------------------------------------ | ------------------------------------ | ---------------------------------- |
| `orderToKitchen`        | Nueva orden enviada a cocina         | `order`                              | Cocina del restaurante             |
| `orderStatusChanged`    | Estado de orden actualizado          | `order`                              | Restaurante + Mesero asignado      |
| `orderStatusUpdated`    | Actualización desde cocina           | `order`                              | Cocina + Restaurante + Mesero      |
| `mesaTransferida`       | Mesa transferida a otro mesero       | `{ mesaId, from, to, supervisor }`   | Restaurante + Meseros involucrados |
| `mesaEstadoActualizado` | Estado de mesa cambiado              | `{ mesaId, estado, assignedWaiter }` | Restaurante + Mesero asignado      |
| `joinedRestaurant`      | Confirmación de unión a restaurante  | `{ restaurantId, message }`          | Cliente que se une                 |
| `joinedKitchen`         | Confirmación de unión a cocina       | `{ restaurantId, message }`          | Cliente que se une                 |
| `joinedWaiter`          | Confirmación de unión a canal mesero | `{ waiterId, message }`              | Cliente que se une                 |

## 🔄 Flujos de Actualización en Tiempo Real

### 1. Envío de Orden a Cocina

```
Mesero → Backend → Socket.io → Cocina
```

**Proceso:**

1. Mesero envía orden: `POST /api/v1/orders/send-to-kitchen`
2. Backend actualiza estado a "preparing"
3. Backend emite `orderToKitchen` al canal de cocina
4. Backend emite `orderStatusChanged` al canal del restaurante
5. Cocina recibe notificación en tiempo real
6. Meseros del restaurante ven actualización

### 2. Actualización de Estado de Orden desde Cocina

```
Cocina → Backend → Socket.io → Mesero
```

**Proceso:**

1. Cocina actualiza estado: `PATCH /api/v1/orders/:orderId/status`
2. Backend actualiza estado en BD
3. Backend emite eventos a:
   - `orderStatusUpdated` → Cocina
   - `orderStatusChanged` → Restaurante
   - `orderStatusChanged` → Mesero asignado
4. Todos reciben actualización instantánea

### 3. Transferencia de Mesa

```
Admin → Backend → Socket.io → Meseros
```

**Proceso:**

1. Admin transfiere mesa: `PATCH /api/v1/table/:id/assign`
2. Backend actualiza asignación en BD
3. Backend emite `mesaTransferida` a:
   - Canal del restaurante
   - Mesero anterior (si existe)
   - Nuevo mesero
4. Todos ven actualización en tiempo real

### 4. Cambio de Estado de Mesa

```
Mesero → Backend → Socket.io → Restaurante
```

**Proceso:**

1. Mesero cambia estado: `PATCH /api/v1/table/:id/state`
2. Backend valida permisos y actualiza BD
3. Backend emite `mesaEstadoActualizado` a:
   - Canal del restaurante
   - Mesero asignado
4. Dashboard del restaurante se actualiza

## 💻 Componentes Frontend

### 1. KitchenDashboard (`front/src/pages/KitchenDashboard.js`)

**Funcionalidades:**

- Recibe órdenes en tiempo real desde meseros
- Actualiza estado de órdenes (preparing → ready → delivered)
- Muestra indicador de conexión con reconexión automática
- Interfaz visual con colores según estado

**Eventos que escucha:**

- `orderToKitchen`: Nueva orden recibida
- `orderStatusUpdated`: Actualización de estado
- `joinedKitchen`: Confirmación de conexión

### 2. WaiterDashboard (`front/src/components/WaiterDashboard.js`)

**Funcionalidades:**

- Ve sus mesas asignadas en tiempo real
- Recibe notificaciones de transferencias de mesas
- Actualiza estado de mesas (libre, ocupada, cuenta)
- Ve estado de sus órdenes en tiempo real
- Indicador de conexión con reconexión automática

**Eventos que escucha:**

- `mesaTransferida`: Mesa transferida
- `mesaEstadoActualizado`: Estado de mesa cambiado
- `orderStatusChanged`: Estado de orden actualizado
- `joinedRestaurant`: Confirmación de conexión a restaurante
- `joinedWaiter`: Confirmación de conexión a canal personal

### 3. RestaurantAdminDashboard (`front/src/components/RestaurantAdminDashboard.js`)

**Funcionalidades:**

- Ve todas las mesas del restaurante
- Puede transferir mesas entre meseros
- Recibe notificaciones de todos los cambios
- Administra categorías y productos

**Eventos que escucha:**

- `mesaTransferida`: Mesa transferida
- `joinedRestaurant`: Confirmación de conexión

## 🛠️ Configuración

### Backend

**Variables de entorno (config.env):**

```env
PORT=3000
```

**Inicialización en `server.js`:**

```javascript
const socketIO = require("./socket");
socketIO.init(server);
```

### Frontend

**Variables de entorno (.env):**

```env
REACT_APP_SOCKET_URL=http://localhost:3000
```

**Uso en componentes:**

```javascript
import useSocket from "../hooks/useSocket";

const MyComponent = () => {
  const eventHandlers = useMemo(
    () => ({
      myEvent: (data) => {
        console.log("Evento recibido:", data);
      },
    }),
    []
  );

  const { connected, reconnecting, error } = useSocket({
    restaurantId: "123",
    eventHandlers,
  });

  return <div>{connected ? "Conectado" : "Desconectado"}</div>;
};
```
