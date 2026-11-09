# TaskFlow - Plan de implementación y pruebas

## 1. Tareas técnicas de implementación

### Preparación del proyecto

- [ ] Crear los proyectos de frontend y backend.
- [ ] Configurar variables de entorno para la aplicación y la base de datos.
- [ ] Definir la estructura de carpetas, convenciones de código y estrategia de ramas.
- [ ] Configurar ESLint, Prettier y el flujo de integración continua.

### Backend y API

- [ ] Configurar Express, el manejo centralizado de errores y el registro de solicitudes.
- [ ] Crear las migraciones para las tablas `users` y `tasks`, incluyendo claves primarias, foráneas e índices.
- [ ] Implementar el registro de usuarios con validación de datos y hash seguro de contraseñas.
- [ ] Implementar autenticación mediante JWT y middleware para proteger los endpoints.
- [ ] Implementar los endpoints CRUD de tareas y el cambio de estado.
- [ ] Añadir validación de títulos, estados, prioridades y fechas límite.
- [ ] Aplicar autorización para garantizar que cada usuario solo acceda a sus tareas.
- [ ] Implementar filtros, ordenamiento, paginación y detección de tareas vencidas.
- [ ] Documentar los endpoints y sus respuestas de error.

### Frontend

- [ ] Crear las vistas de registro, inicio de sesión y panel principal.
- [ ] Implementar formularios de creación y edición de tareas con validación.
- [ ] Mostrar tareas por estado, prioridad y fecha límite.
- [ ] Añadir acciones para completar, editar y eliminar tareas.
- [ ] Implementar estados de carga, mensajes de error y confirmaciones de acciones destructivas.
- [ ] Proteger las rutas privadas y gestionar la expiración de la sesión.
- [ ] Adaptar la interfaz a dispositivos móviles y navegadores modernos.

### Operación y entrega

- [ ] Crear datos de prueba y un procedimiento reproducible para levantar el entorno local.
- [ ] Configurar migraciones y copias de seguridad para los entornos desplegados.
- [ ] Configurar monitoreo básico de errores, salud de la API y disponibilidad.
- [ ] Revisar accesibilidad, seguridad de dependencias y variables secretas antes del despliegue.

## 2. Plan de pruebas

### Alcance

El plan cubre autenticación, gestión de tareas, autorización, validaciones, filtros, interfaz responsive y requisitos no funcionales. Las pruebas deben ejecutarse en un entorno de pruebas con una base de datos aislada.

### Tipos de pruebas

| Tipo | Objetivo | Herramientas sugeridas |
|---|---|---|
| Unitarias | Verificar validadores, servicios, utilidades y reglas de negocio | Jest o Vitest |
| Integración | Comprobar API, middleware y persistencia en PostgreSQL | Supertest y PostgreSQL de pruebas |
| End-to-end | Validar los flujos principales desde la interfaz | Playwright o Cypress |
| Seguridad | Comprobar autenticación, autorización, validación y exposición de datos | OWASP ZAP y pruebas automatizadas |
| Rendimiento | Medir tiempos de respuesta bajo carga básica | k6 o Artillery |
| Compatibilidad | Verificar la interfaz en navegadores y tamaños de pantalla soportados | Playwright |

### Casos de prueba funcionales

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-01 | Registrar usuario con datos válidos | Se crea la cuenta y se confirma el registro. |
| TC-02 | Registrar un correo ya existente | La API rechaza la solicitud sin crear duplicados. |
| TC-03 | Iniciar sesión con credenciales válidas | Se entrega una sesión o token válido. |
| TC-04 | Iniciar sesión con contraseña incorrecta | Se devuelve un error sin revelar información sensible. |
| TC-05 | Crear una tarea completa | La tarea se guarda con sus valores enviados. |
| TC-06 | Crear una tarea sin título o con prioridad inválida | La solicitud se rechaza con errores de validación. |
| TC-07 | Editar y cambiar el estado de una tarea propia | Los cambios se persisten y se muestran actualizados. |
| TC-08 | Consultar tareas filtradas | Solo se devuelven las tareas que cumplen los filtros. |
| TC-09 | Consultar una tarea de otro usuario | La API responde como no autorizada o no encontrada y no filtra datos. |
| TC-10 | Eliminar una tarea propia | La tarea deja de aparecer en las consultas posteriores. |
| TC-11 | Consultar una tarea con fecha vencida | La tarea se identifica como vencida. |
| TC-12 | Acceder a una ruta protegida sin autenticación | La API rechaza el acceso. |

### Casos de prueba no funcionales

- Verificar que las contraseñas nunca se almacenan en texto plano ni aparecen en respuestas.
- Verificar que las rutas protegidas rechazan tokens ausentes, inválidos o expirados.
- Comprobar que las consultas de tareas utilizan paginación y responden dentro del objetivo definido.
- Ejecutar pruebas con múltiples usuarios para confirmar el aislamiento de sus datos.
- Comprobar navegación con teclado, etiquetas de formularios, contraste y mensajes accesibles.
- Validar la interfaz en móvil, tablet y escritorio en los navegadores soportados.
- Ejecutar el análisis de dependencias y corregir vulnerabilidades críticas o altas antes de publicar.

### Criterios de entrada y salida

**Entrada:**

- Migraciones aplicadas correctamente en la base de datos de pruebas.
- Variables de entorno configuradas.
- Servicios de frontend, backend y base de datos disponibles.
- Datos de prueba preparados y criterios de aceptación revisados.

**Salida:**

- Todos los casos críticos y de alta prioridad aprobados.
- Sin defectos críticos o altos abiertos.
- Pruebas unitarias, de integración y end-to-end ejecutadas en CI.
- Resultados y defectos registrados con pasos para reproducirlos.
- Aprobación funcional antes del despliegue.

### Flujo de ejecución

1. Ejecutar validaciones estáticas y pruebas unitarias en cada cambio.
2. Ejecutar pruebas de integración contra una base de datos aislada.
3. Ejecutar el flujo end-to-end de registro, inicio de sesión y CRUD de tareas.
4. Ejecutar pruebas de seguridad y rendimiento antes de cada versión.
5. Registrar resultados, corregir fallos y repetir las pruebas afectadas.
6. Publicar únicamente cuando se cumplan los criterios de salida.
