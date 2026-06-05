# Módulo 2 | Feature 5 — MongoDB y Jest

## Objetivo

Evolucionar la arquitectura del backend hacia un enfoque **políglota**, utilizando diferentes tipos de bases de datos según el tipo de problema a resolver.

Hasta ahora todo el sistema utilizaba PostgreSQL mediante Prisma. A partir de este sprint se introduce **MongoDB** para gestionar datos que requieren mayor flexibilidad.

Además se introducen **tests unitarios con Jest** para validar que la lógica de negocio funciona correctamente.

Aprendizajes:

- Qué es una arquitectura políglota
- Cuándo usar SQL vs NoSQL
- Cómo integrar MongoDB con Mongoose
- Cómo escribir tests unitarios con Jest
- Cómo registrar actividad de administración mediante logging

## Arquitectura políglota

| Base de datos | Uso |
|---------------|-----|
| PostgreSQL (Supabase) | Core transaccional — Usuarios, Autenticación, Productos |
| MongoDB Atlas | Datos flexibles — Reviews, Wishlist, Logs |

**PostgreSQL** se mantiene para datos que requieren consistencia, relaciones e integridad transaccional.

**MongoDB** se introduce para datos que cambian de estructura, crecen rápidamente y no necesitan relaciones complejas.

## Tech / Dependencias

- Node.js 18+
- Express
- Prisma ORM
- PostgreSQL (Supabase)
- MongoDB Atlas
- Mongoose
- Jest

Nuevas dependencias:

```bash
npm install mongoose jest
```

## Variables de entorno

```env
DATABASE_URL="postgresql://..."
MONGO_URI="mongodb+srv://USUARIO:PASSWORD@cluster.mongodb.net/nombre_db"
JWT_SECRET="super_secret_key"
PORT=3000
```

> Si MongoDB falla, el servidor **no debe arrancar**.

## Configuración de MongoDB Atlas

1. Crear cuenta en MongoDB Atlas
2. Crear cluster gratuito
3. Crear base de datos
4. Copiar el Connection String y añadirlo a `.env` como `MONGO_URI`

## Estructura del proyecto

```
src/
├── config/
│   ├── env.js
│   ├── prismaClient.js
│   └── mongo.js
├── models/
│   ├── review.model.js
│   ├── wishlist.model.js
│   └── adminLog.model.js
├── controllers/
├── services/
├── routes/
├── middlewares/
│   ├── adminLogger.js
│   ├── authenticate.js
│   ├── requireRole.js
│   ├── errorHandler.js
│   └── notFound.js
├── app.js
└── server.js

tests/
└── unit/
```

## Modelos MongoDB

### Review

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `productId` | String | ID del producto (coincide con PostgreSQL) |
| `userId` | String | ID del usuario |
| `rating` | Number (1-5) | Valoración |
| `comment` | String | Comentario |
| `createdAt` | Date | Fecha creación |
| `updatedAt` | Date | Fecha actualización |

### Wishlist

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | String | Usuario |
| `productIds` | [String] | Productos guardados |
| `updatedAt` | Date | Última actualización |

> Cada usuario tiene **un único documento** de wishlist.

### Admin Logs

| Campo | Tipo |
|-------|------|
| `adminId` | String |
| `action` | String |
| `resource` | String |
| `timestamp` | Date |

## Services por base de datos

| Servicio | Base de datos |
|----------|---------------|
| `products.service` | PostgreSQL (Prisma) |
| `reviews.service` | MongoDB |
| `wishlist.service` | MongoDB |

## Endpoints

### Reviews

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/products/:id/reviews` | No | Listar reviews |
| POST | `/api/products/:id/reviews` | Sí | Crear review |

### Wishlist

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/wishlist` | Sí | Ver wishlist |
| POST | `/api/wishlist/:productId` | Sí | Añadir o eliminar producto |

## Qué hay que implementar

### 1. Conectar MongoDB — `src/config/mongo.js`

Inicializar la conexión con Mongoose. Si falla, el servidor no arranca.

### 2. Crear modelos MongoDB — `src/models/`

- `review.model.js`
- `wishlist.model.js`
- `adminLog.model.js`

### 3. Crear servicios Mongo — `src/services/`

- `reviews.service.js`
- `wishlist.service.js`
- `adminLog.service.js`

### 4. Crear endpoints

```
GET  /api/products/:id/reviews
POST /api/products/:id/reviews
GET  /api/wishlist
POST /api/wishlist/:productId
```

### 5. Implementar admin logger — `src/middlewares/adminLogger.js`

Middleware que registra acciones de administradores en MongoDB.

## Testing con Jest

Los tests se centran en los **servicios**, no en los endpoints HTTP. No necesitan base de datos real — usan mocks y datos simulados.

### Configuración Jest (ESM)

En `package.json`:

```json
"test": "node --experimental-vm-modules node_modules/.bin/jest --runInBand"
```

### Ejecutar tests

```bash
npm test
```

### Qué se testea

Los tests se encuentran en `tests/unit/`:

| Servicio | Test |
|----------|------|
| `auth.service` | Hash y comparación de contraseñas |
| `wishlist.service` | Toggle add/remove |
| `reviews.service` | Validación de rating |

## Pistas

1. **MongoDB es flexible** — no requiere esquema rígido, pero Mongoose permite añadir validaciones
2. **Reviews dependen de productos** — el campo `productId` debe coincidir con el ID del producto en PostgreSQL
3. **Toggle wishlist** — añadir producto si no existe, eliminarlo si ya existe
4. **Mongo debe conectar antes de arrancar** — si falla, el servidor no debe arrancar
5. **Tests sin base de datos real** — usar mocks y datos simulados

## Checks de autoevaluación

- [ ] MongoDB conecta correctamente
- [ ] `GET /api/products/:id/reviews` devuelve reviews
- [ ] `POST /api/products/:id/reviews` crea una review
- [ ] `GET /api/wishlist` devuelve favoritos del usuario
- [ ] `POST /api/wishlist/:productId` hace toggle correctamente
- [ ] `npm test` ejecuta y pasa

## Ejemplos cURL

```bash
# Ver reviews
curl http://localhost:3000/api/products/<PRODUCT_ID>/reviews

# Crear review
curl -X POST http://localhost:3000/api/products/<PRODUCT_ID>/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"rating":5,"comment":"Excelente producto!"}'

# Ver wishlist
curl http://localhost:3000/api/wishlist \
  -H "Authorization: Bearer $TOKEN"

# Toggle producto en wishlist
curl -X POST http://localhost:3000/api/wishlist/<PRODUCT_ID> \
  -H "Authorization: Bearer $TOKEN"
```

## Notas

- Reviews y Wishlist se almacenan en **MongoDB**.
- Products y Users se almacenan en **PostgreSQL**.
- Los tests **no necesitan base de datos real**.
- El servidor debe fallar explícitamente si MongoDB no conecta.
- La arquitectura sigue siendo: `routes → controllers → services → database`.
