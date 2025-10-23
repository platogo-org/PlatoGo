# Scripts de Datos de Prueba

Este directorio contiene scripts para crear datos de prueba en la base de datos.

## 📋 Scripts Disponibles

### 1. Crear Mesas (`importTables.js`)

Crea 10 mesas de prueba en el restaurante.

**Uso:**

```bash
# Desde la carpeta /back
cd back

# Importar mesas
node data/importTables.js --import

# Eliminar todas las mesas
node data/importTables.js --delete
```

**Mesas creadas:**

- Mesa 1-10 con capacidades variadas (2, 4, 6, 8 personas)
- Todas en estado "libre"
- Asignadas automáticamente al primer restaurante encontrado

---

### 2. Crear Meseros (`createWaiters.js`)

Crea 3 meseros de prueba en el restaurante.

**Uso:**

```bash
# Desde la carpeta /back
cd back

# Crear meseros
node data/createWaiters.js --create

# Eliminar todos los meseros
node data/createWaiters.js --delete
```

**Meseros creados:**

1. **Carlos Mesero**

   - Email: `carlos@waiter.com`
   - Password: `test1234`

2. **Maria Mesera**

   - Email: `maria@waiter.com`
   - Password: `test1234`

3. **Juan Servidor**
   - Email: `juan@waiter.com`
   - Password: `test1234`

---

## 🚀 Flujo Completo de Prueba

### Paso 1: Crear datos de prueba

```bash
cd back

# Crear meseros
node data/createWaiters.js --create

# Crear mesas
node data/importTables.js --import
```

### Paso 2: Probar la funcionalidad

1. **Login como Restaurant Admin**

   - Ve al dashboard de admin
   - Verás la sección "Asignar Mesa a Mesero"

2. **Asignar mesas**

   - Selecciona una mesa del dropdown
   - Selecciona un mesero (Carlos, Maria o Juan)
   - Click en "Asignar Mesa"

3. **Login como Mesero**
   - Email: `carlos@waiter.com` (o maria/juan)
   - Password: `test1234`
   - Ve al dashboard del mesero
   - **Deberías ver las mesas asignadas** en "Mis Mesas Asignadas"

---

## ⚠️ Requisitos Previos

Antes de ejecutar estos scripts, asegúrate de:

1. ✅ Tener al menos **1 restaurante** en la base de datos
2. ✅ Tener la configuración correcta en `config.env`:
   ```
   DATABASE=mongodb+srv://...
   DATABASE_PASSWORD=tu_password
   ```

---

## 🔧 Troubleshooting

### Error: "No se encontró ningún restaurante"

**Solución:** Crea un restaurante primero usando:

```bash
node data/importRestaurants.js --import
```

### Error: "Email ya existe"

**Solución:** Los meseros ya fueron creados. Puedes:

- Usar los existentes
- Eliminarlos con `--delete` y volver a crearlos
- Modificar los emails en `createWaiters.js`

### Las mesas no aparecen en el admin dashboard

**Solución:**

1. Verifica que el backend esté corriendo
2. Abre la consola del navegador (F12)
3. Busca mensajes de error
4. Verifica que el token sea válido

---

## 📊 Verificar Datos

Puedes verificar los datos creados directamente en MongoDB Compass o usando:

```javascript
// En MongoDB shell o Compass
db.tables.find({ restaurant: ObjectId("tu_restaurant_id") });
db.users.find({ role: "restaurant-waiter" });
```

---

## 🧹 Limpiar Datos

Para eliminar todos los datos de prueba:

```bash
cd back

# Eliminar meseros
node data/createWaiters.js --delete

# Eliminar mesas
node data/importTables.js --delete
```
