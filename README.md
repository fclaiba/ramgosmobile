# ramgosmobile# ramgosmobile
<div align="center">

# 🚀 Mi‑App · Plataforma Comercial Multifuncional

Una super‑app escrita en React Native (Expo) que une cupones/bonos, marketplace, social, pagos y herramientas para negocios e influencers. Pensada mobile‑first, modular y lista para escalar.

</div>

---
## 📌 Estado del proyecto

- Lee el resumen vivo: [docs/RESUMEN_ESTADO.md](docs/RESUMEN_ESTADO.md)

## ✨ Visión

Mi‑App conecta consumidores, negocios e influencers a través de:

- Bonos y cupones con QR y redención en punto de venta
- Marketplace con chat, reputación y escrow
- Social network (posts, historias, perfil público) + Herramientas de promoción
- Pagos con Stripe y reportes por rol

El objetivo es ofrecer una experiencia coherente, rápida y muy utilizable desde el día 1.

---

## 🧭 Mapa rápido

- Home: acceso a tus bonos, historial y recomendaciones
- Social: perfil público IG/Twitter‑like, historias destacadas y grid 3×3 con visor vertical al estilo Instagram
- Marketplace: publicaciones con filtros y detalle de producto
- Bonos: explorador, detalle y checkout (Stripe mock)
- Ajustes: perfil + verificación de identidad + preferencias + seguridad + dispositivos
- Notificaciones: centro con tabs (todas, transaccionales, sociales, sistema) y acciones por tarjeta

---

## 🧱 Arquitectura

- React Native + Expo (web/native)
- React Navigation (tabs + stack)
- Estado local por pantalla + servicios mock tipados (TS) → preparados para migrar a API real
- Componentes UI desacoplados y reutilizables (`components/`)

```text
mi-app/
  screens/           # Pantallas (Home, Social, IG Grid/Viewer, Ajustes, Notificaciones, etc.)
  components/        # Componentes reutilizables (IG, mapas, drawer, etc.)
  services/          # Datos mock + lógica de dominio (social, coupons, products, notifications)
  navigation/        # Tabs + Stack
  context/           # UserContext (rol/usuario actual)
```

---

## 🧩 Módulos clave

- Perfil Social
  - Grid tipo Instagram con visor vertical de posts (una pantalla por post)
  - Historias Destacadas (carousel + viewer con progreso y tap zones)
  - Posts Twitter‑like: avatar, handle, fecha, media, barra de acciones (like/retweet/comentar/share)
  - Hilos de respuestas anidadas con “Mostrar más” desde 3er nivel, composer 280 chars

- Centro de Notificaciones
  - Tabs: todas/transaccionales/sociales/sistema/mensajes
  - Acciones por tipo (ver factura, archivar, seguir también, recordármelo, responder, marcar leído)
  - Servicio `services/notifications.ts` con CRUD mock y timestamps

- Ajustes (en modal desde el perfil)
  - Verificación de identidad (3 pasos)
  - Preferencias: modo oscuro, idioma, moneda
  - Seguridad avanzada: 2FA, claves API, dispositivos, logs

---

## 🛠️ Stack técnico

- React 19 + React Native 0.79 + Expo 53
- React Navigation 7 (bottom tabs + native stack)
- Reanimated/gesture‑handler listos para gestos (plug‑and‑play)
- TypeScript estricto, utilidades de “rem/vh/vw” para RN (`components/ig/units.ts`)

---

## ▶️ Puesta en marcha

1. Requisitos: Node 18+, npm 9+
2. Instalar dependencias

```bash
npm install
```

3. Levantar en web (desarrollo)

```bash
npm run web
```

4. Expo Go (iOS/Android)

```bash
npm run start
```

> Consejo: si el bundler devuelve JSON (y el navegador bloquea por MIME), revisá el último error de TypeScript en consola; la app ya maneja estos casos (ver historial de fixes en commits).

---

## 🧪 Scripts útiles

```jsonc
"scripts": {
  "start": "expo start",
  "web": "expo start --web",
  "android": "expo start --android",
  "ios": "expo start --ios"
}
```

---

## 🧭 Flujos UX destacados

- IG Grid → Visor vertical (snap por pantalla, prefetch de siguientes imágenes)
- Historias Destacadas → visor fullscreen con progreso y tap izquierda/derecha
- Respuestas tipo Twitter → anidadas + composer con límite 280, like en comentarios
- Campana en Home → Centro de Notificaciones con acciones por tarjeta
- Ícono de ajustes en Social → modal de Ajustes completo

---

## 🔒 Roles y seguridad

- `UserContext` simula roles: consumer, business, influencer, admin
- Pantallas por rol enlazadas desde el Drawer
- Mock de verificación de identidad y 2FA preparado para integrar proveedor real

---

## 🧰 Cómo contribuir

1. Crea una rama desde `main`
2. Escribe tests/ejemplos visuales en la pantalla tocada
3. Commits pequeños, descriptivos; enlaza issue si aplica
4. Pull Request con demo (GIF/video) de la interacción

---

## 🗺️ Roadmap breve

- [ ] Integrar fuente de datos real (React Query + API)
- [ ] Carruseles de media en posts del visor IG
- [ ] Deep‑links a pantallas (post/usuario/factura)
- [ ] Persistir notificaciones en AsyncStorage
- [ ] Temas claro/oscuro globales

---

## 📄 Licencia

Este proyecto se publica con fines educativos y de demostración. Ajusta la licencia según tus necesidades.
