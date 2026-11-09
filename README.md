# TaskFlow - Gestor de tareas

## 1. Descripción del proyecto

TaskFlow es una aplicación web para organizar actividades personales, académicas o profesionales. Permite a los usuarios crear tareas, asignar fechas límite, establecer prioridades y consultar el progreso de sus actividades desde una interfaz sencilla.

## 2. Objetivos

- Centralizar la gestión de tareas en una sola plataforma.
- Facilitar la planificación de actividades diarias.
- Ayudar a los usuarios a cumplir sus fechas límite.
- Proporcionar una visión clara del progreso y las tareas pendientes.
- Mejorar la productividad mediante una organización sencilla y accesible.

## 3. Funcionalidades

- Registro e inicio de sesión de usuarios.
- Creación, edición y eliminación de tareas.
- Asignación de títulos, descripciones, prioridades y fechas límite.
- Clasificación de tareas por categorías o proyectos.
- Gestión de estados:
  - Pendiente
  - En progreso
  - Completada
- Filtrado de tareas por estado, prioridad o fecha.
- Visualización de tareas vencidas y próximas.
- Panel de control con resumen del progreso.
- Notificaciones o recordatorios de fechas límite.

## 4. Tecnologías utilizadas

La implementación puede utilizar las siguientes tecnologías:

- **Frontend:** HTML5, CSS3 y JavaScript con React.
- **Backend:** Node.js y Express.
- **Base de datos:** PostgreSQL.
- **Autenticación:** JSON Web Tokens (JWT).
- **Control de versiones:** Git y GitHub.
- **Pruebas de API:** Postman.

## 5. Requisitos funcionales

1. El sistema debe permitir registrar nuevos usuarios.
2. El sistema debe permitir iniciar y cerrar sesión.
3. Cada usuario debe poder crear tareas propias.
4. El usuario debe poder consultar, editar y eliminar sus tareas.
5. El usuario debe poder asignar una fecha límite y una prioridad.
6. El usuario debe poder cambiar el estado de sus tareas.
7. El sistema debe permitir filtrar y ordenar tareas.
8. El sistema debe identificar las tareas vencidas.
9. El sistema debe mostrar un resumen del progreso del usuario.
10. El sistema debe impedir que un usuario acceda a tareas de otra cuenta.

## 6. Requisitos no funcionales

- **Usabilidad:** la interfaz debe ser clara, intuitiva y responsive.
- **Rendimiento:** las operaciones principales deben responder rápidamente.
- **Seguridad:** las contraseñas deben almacenarse de forma segura y las rutas protegidas deben requerir autenticación.
- **Disponibilidad:** la aplicación debe estar disponible para los usuarios durante la mayor parte del tiempo.
- **Escalabilidad:** la arquitectura debe permitir agregar nuevas funciones sin afectar las existentes.
- **Mantenibilidad:** el código debe estar organizado, documentado y seguir convenciones consistentes.
- **Compatibilidad:** la aplicación debe funcionar en los navegadores modernos más utilizados.

## 7. Estructura de la base de datos

### Tabla `users`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único del usuario |
| `name` | VARCHAR(100) | Nombre del usuario |
| `email` | VARCHAR(150) | Correo electrónico único |
| `password_hash` | VARCHAR(255) | Contraseña cifrada |
| `created_at` | TIMESTAMP | Fecha de registro |

### Tabla `tasks`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único de la tarea |
| `user_id` | UUID | Usuario propietario de la tarea |
| `title` | VARCHAR(150) | Título de la tarea |
| `description` | TEXT | Detalles de la tarea |
| `status` | VARCHAR(20) | Estado actual |
| `priority` | VARCHAR(20) | Prioridad de la tarea |
| `due_date` | DATE | Fecha límite |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Última actualización |

La relación entre `users` y `tasks` es de uno a muchos: un usuario puede tener varias tareas, pero cada tarea pertenece a un único usuario.

## 8. Endpoints de la API

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/auth/register` | Registrar un usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/logout` | Cerrar sesión |

### Tareas

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/tasks` | Listar las tareas del usuario autenticado |
| `GET` | `/api/tasks/:id` | Consultar una tarea específica |
| `POST` | `/api/tasks` | Crear una tarea |
| `PUT` | `/api/tasks/:id` | Actualizar una tarea |
| `PATCH` | `/api/tasks/:id/status` | Actualizar el estado de una tarea |
| `DELETE` | `/api/tasks/:id` | Eliminar una tarea |

Las rutas de tareas requieren un token de autenticación válido.

## 9. Posibles mejoras futuras

- Aplicación móvil para Android y iOS.
- Sincronización con calendarios externos.
- Tareas recurrentes.
- Colaboración entre usuarios y asignación de tareas.
- Comentarios y archivos adjuntos.
- Notificaciones por correo electrónico y push.
- Estadísticas avanzadas de productividad.
- Integración con herramientas como Google Calendar, Slack o Microsoft Teams.
- Soporte para temas claro y oscuro.

## 10. Ejecución con Docker

Requisitos:

- Docker Desktop con Docker Compose habilitado.

Para iniciar la aplicación:

```bash
docker compose up --build -d
```

Servicios disponibles:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- Salud de la API: `http://localhost:3000/health`
- PostgreSQL: `localhost:5432`

Para ejecutar las pruebas del backend dentro del contenedor:

```bash
docker compose exec -T api npm test
```

Para detener los servicios:

```bash
docker compose down
```

La base de datos utiliza el volumen `postgres_data`. Para eliminar también los datos persistidos durante un reinicio de desarrollo:

```bash
docker compose down -v
```
