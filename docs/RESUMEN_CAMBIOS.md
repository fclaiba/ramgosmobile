# Resumen de cambios (últimas iteraciones)

- Marketplace
  - Filtros avanzados y slider de distancia fuera del mapa (sin superposición).
  - `MapRadius` con centro movible (tap/click), pin central arrastrable, contador en vivo y "Mi ubicación".
  - Implementación web con Leaflet y nativa con `react-native-maps` (archivos por plataforma).
  - Botón “+” para publicar producto.

- Publicación de productos
  - Nueva `PublishProductScreen` (imágenes hasta 5, validaciones, publicar/borrador/preview).
  - `services/products.ts`: `createProduct(...)` para alta local e ID automático.

- Detalle de producto
  - Nueva `ProductDetailScreen` (carrusel, vendedor, mapa mini, tabs, CTA Comprar).
  - Fix navegación: “Comprar Ahora” navega a flujo de escrow.

- Flujo de Escrow
  - `services/escrow.ts`: modelo de transacción, mensajes, temporizador, helpers (ship/deliver/release/dispute).
  - `EscrowFlowScreen`: timeline, acciones (confirmar envío con tracking, recepción, liberar fondos, disputa) y chat.

- Navegación
  - Rutas agregadas: `ProductDetail`, `PublishProduct`, `EscrowFlow`.

- Correcciones clave
  - Web: separación `DetailMiniMap.native/web` para evitar importar módulos nativos en web.
  - Integración de `expo-image-picker`.



 - Configuración Expo / Dependencias
   - Instalación de `react-native-gesture-handler` y `react-native-reanimated`.
   - `babel.config.js` con `babel-preset-expo` y plugin de reanimated.
   - `index.ts`: importación de `react-native-gesture-handler` al inicio.

 - Mapas
   - Radio mínimo permitido en `MapRadius` ahora es 0 km (nativo y web) con clamping de inputs.

 - Social Network (nuevo módulo)
   - Pestaña renombrada a “Social Network” con icono `groups`.
   - Feed social: publicar texto/foto, likes, comentarios, “Mensaje”, “Ver detalles”.
   - Sugerencias para seguir y lista de siguiendo; seguir/dejar de seguir.
   - Perfiles: `SocialProfileScreen` con seguir/unfollow y posts del usuario.
   - Mensajería 1:1: `SocialChatScreen` con envío y listado de mensajes.
   - Notificaciones: likes, comentarios, follows y mensajes (`SocialNotificationsScreen`).
   - Búsqueda: usuarios y `#hashtags` (`SocialSearchScreen`, `SocialHashtagScreen`).
   - Menciones `@usuario` (notificación al mencionado) y hashtags indexados.
   - Historias: strip en feed y visor de stories (`StoriesScreen`).
   - Detalle de publicación: `PostDetailScreen` con comentarios.

 - Navegación
   - Nuevas rutas: `SocialProfile`, `SocialChat`, `SocialNotifications`, `SocialSearch`, `SocialHashtag`, `PostDetail`, `Stories`.
   - Header en Social: accesos a búsqueda y notificaciones.

 - Documentación
   - `docs/Social_Network_Spec.md`: análisis funcional, flujos, RNF, datos y API del módulo social.