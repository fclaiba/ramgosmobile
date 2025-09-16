## Resumen de estado del proyecto

### Evaluación global – avance actual

- **Frontend**: 70% (usable, flows principales presentes con mocks)
- **Backend**: 20% (servicios mock; falta infraestructura real y procesos críticos)

### Frontend – entregado (hecho)

- **Perfil social completo** (`screens/SocialProfileScreen.tsx`)
  - Header con cover, avatar centrado, nombre, handle, stats y botones Seguir/Contactar
  - Tabs: **Fotos** (grid 3x3 tipo IG con viewer modal vertical e infinitamente deslizable), **Posts** (feed tipo Twitter con acciones: comentar, retweet, like, share), **Comercial** (productos, cupones, eventos vinculados)
  - **Sistema de respuestas estilo Twitter**: hilos anidados con líneas, like en comentarios, colapso/expandir desde 3er nivel, composer con límite de caracteres
- **Historias Destacadas (Highlights)** (`components/ig/highlights.tsx`)
  - Carrusel horizontal de burbujas con snap
  - Viewer de historias a pantalla completa con barras de progreso, tap zones, avance automático y prefetching
- **Grid/Viewer tipo Instagram**
  - `components/ig/ProfileGrid.tsx`, `components/ig/PostFeedInsideModal.tsx`, `components/ig/PostCard.tsx`
  - Responsive (3x3), fillers, prefetching, `FlatList` con `pagingEnabled`
- **Dashboards de promoción (negocios e influencers)**
  - Rango 7d/30d/90d, funnel de conversión, heatmap de actividad, serie temporal de transacciones, distribución geográfica
  - Integrado en `screens/MerchantHomeScreen.tsx` y `screens/InfluencerDashboard.tsx`
- **Centro de Notificaciones** (`screens/NotificationsScreen.tsx`)
  - Tabs: All, Transactional, Social, System, High Priority; acciones contextuales (ver factura, follow back, recordar, etc.)
  - Navegación: tab inferior actualizado para incluir Notificaciones
- **Ajustes / Perfil y Configuración** (`screens/SettingsScreen.tsx`)
  - Identidad, preferencias (tema, idioma, moneda), seguridad avanzada (2FA UI, API keys), dispositivos conectados
  - Acceso como modal desde el icono de ajustes en el perfil social
- **Servicios mock operativos**
  - `services/social.ts` (posts, retweets, comentarios anidados, likes)
  - `services/analytics.ts` (funnel, heatmap, series, geodistribución)
  - `services/products.ts`, `services/coupons.ts`, `services/events.ts`, `services/reviews.ts`
  - `services/notifications.ts` (tipos, listado, marcar leído, recordar)
- **Mejoras técnicas y fixes**
  - Migración a `resizeMode` prop en `<Image>` y `boxShadow` en web
  - Cambio de imágenes mock a Picsum para evitar ORB
  - Correcciones de sintaxis/duplicados (refs, JSX) y errores de bundler
- **Utilidades de responsive**: `components/ig/units.ts` (rem/vh/vw), optimizaciones de listas virtualizadas

### Backend – entregado (hecho)

- **Servicios simulados (in‑memory/mock)** para social, analytics, marketplace, cupones, eventos, notificaciones y reviews
- **Sin** API real, BD, auth, pagos, webhooks ni orquestación

### Frontend – pendientes para llegar al 100%

- **Datos y estado**
  - [ ] Reemplazar mocks por API real (TanStack Query: caché, reintentos, invalidaciones)
  - [ ] Persistencia local con AsyncStorage (sesión, preferencias, caché offline)
- **Social/IG**
  - [ ] Visor IG: video (autoplay/onEnd), long‑press para pausa, swipe‑down para cerrar, carruseles multi‑imagen
  - [ ] Likes/guardados/comentarios persistentes; deep‑links a post/usuario
- **Historias destacadas**
  - [ ] Editor completo (crear/renombrar/portada/agregar‑quitar historias/eliminar)
  - [ ] Reacciones/contador de vistas; permisos según privacidad
- **Notificaciones**
  - [ ] Deep‑link por tipo (factura, perfil, chat, sistema)
  - [ ] Preferencias por canal (push/email) y "no molestar"; paginación/infinite scroll
- **Bonos/Marketplace/Pagos**
  - [ ] Checkout con Stripe real (payment sheet), manejo de fallos, recibos
  - [ ] Publicación de productos con validaciones, subida de imágenes y borrador
  - [ ] Escrow UI con estados (retenido/liberado/reembolso) enlazados a back
- **Ajustes/Seguridad**
  - [ ] 2FA real (TOTP/SMS), rotación de claves API
  - [ ] Verificación de identidad: carga de documentos y estados
- **Calidad y accesibilidad**
  - [ ] i18n completo (copy centralizada), A11y (labels, focus, contraste), skeletons y error boundaries
  - [ ] Tests: unit (RTL), integración (mock server), e2e (Detox/Playwright)
- **Plataforma/UX**
  - [ ] Theming claro/oscuro global, animaciones (Reanimated/Moti), performance (memoización, virtualization)
  - [ ] Deep‑links universales (web/mobile) y manejo de back‑button
- **Entrega**
  - [ ] CI para lint/test/build, firmas iOS/Android, sourcemaps, codepush/OTA (Expo Updates)

### Backend – pendientes para llegar al 100%

- **Autenticación/Autorización**
  - [ ] Servicio de auth (JWT/OAuth/Firebase), refresh tokens, roles/ACL, recuperación
  - [ ] Gestión de sesiones/dispositivos (revocación, trusted devices)
- **Dominio**
  - [ ] Usuarios/perfiles: avatar, bio, preferencias, privacidad
  - [ ] Social: posts, comentarios/hilos, likes, guardados, historias (ephemerals + archivo), destacados (colecciones)
  - [ ] Marketplace: productos, inventario, fotos, categorías, búsqueda (Elastic/Algolia)
  - [ ] Bonos/Cupones: emisión, compra, QR único, validación/redención con idempotencia
  - [ ] Pagos/Escrow: Stripe (PaymentIntents, Webhooks), ledger interno, conciliación, disputas
  - [ ] Reputación: reviews con moderación, agregados y reportes anti‑abuso
  - [ ] Chat/mensajería: WebSocket/RTC, tipificación de eventos, historial, anti‑spam
  - [ ] Notificaciones: orquestador (push/email/in‑app), plantillas, preferencias, digest, encolado (Kafka/SQS)
- **Operaciones/DevOps**
  - [ ] Contenedores y orquestación (Docker+k8s), IaC (Terraform), entornos (dev/stg/prod)
  - [ ] Observabilidad: logs, métricas (Prometheus), trazas (OpenTelemetry), alertas
  - [ ] Seguridad: rate‑limit, WAF, CSP, rotación de secretos, auditoría, backups, GDPR/retención
  - [ ] Almacenamiento: Postgres + Redis + objetos (S3/GCS) para media
  - [ ] Migraciones y seeding; jobs (cron) para expiraciones/recordatorios/liquidaciones
- **Admin**
  - [ ] Panel/Endpoints para moderación, flags, configuración, reportes financieros y de riesgo
- **Performance/Escalabilidad**
  - [ ] Paginaciones cursor‑based, índices/consultas optimizadas, colas asíncronas

### Próximos pasos sugeridos (orden recomendado)

1) **Contratos API (OpenAPI)** y esquema de datos base (Usuarios, Social, Pagos, Bonos, Marketplace)

2) **Gateway + Auth**: login/registro, roles y sesiones; React Query conectado a endpoints de posts y notificaciones

3) **Pagos/Escrow**: Stripe PaymentIntents + webhooks + ledger interno; UI de estados conectada

4) **Seguridad**: 2FA, gestión de sesiones y dispositivos, rate‑limits

5) **Notificaciones**: orquestador, preferencias y deep‑links

6) **CI/CD y Observabilidad**: pipelines, tests, métricas, trazas y alertas

### Notas

- Este documento resume el estado actual y lo pendiente para alcanzar el 100% en front y back. Actualizar en cada iteración relevante.


