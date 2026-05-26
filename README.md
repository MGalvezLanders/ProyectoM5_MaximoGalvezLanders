<div align="center">
  <img src="./public/Logo.jpg" alt="La Gauchada Mates" width="140" />

  # 🧉 La Gauchada Mates

  ### *Pequeños mates, grandes momentos*

  Plataforma de e-commerce para una marca real argentina especializada en mates, bombillas, termos, materas, ponchos, boinas y yerbas.

  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
  [![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
  [![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

  **🌐 Demo en producción:** [proyecto-m5-maximo-galvez-landers.vercel.app](https://proyecto-m5-maximo-galvez-landers.vercel.app)
  **📦 Repositorio:** [github.com/MGalvezLanders/ProyectoM5_MaximoGalvezLanders](https://github.com/MGalvezLanders/ProyectoM5_MaximoGalvezLanders)
</div>

---

## 📋 Tabla de contenidos

- [Sobre el proyecto](#-sobre-el-proyecto)
- [Tech stack](#-tech-stack)
- [Capturas](#-capturas)
- [Decisiones arquitectónicas](#-decisiones-arquitectónicas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Flujo de upload de imágenes a S3](#-flujo-de-upload-de-imágenes-a-s3)
- [Instalación paso a paso](#-instalación-paso-a-paso)
- [Variables de entorno](#-variables-de-entorno)
- [Scripts disponibles](#-scripts-disponibles)
- [Bitácora de uso de IA](#-bitácora-de-uso-de-ia)
- [Autor](#-autor)

---

## 🧉 Sobre el proyecto

**La Gauchada Mates** es una marca argentina que vende productos típicos del mundo del mate: mates, bombillas, termos, materas, ponchos, boinas, yerbas y más. Su eslogan, *"pequeños mates, grandes momentos"*, resume la filosofía de la marca: acompañar los momentos cotidianos con productos artesanales de calidad.

Este proyecto es una **Single Page Application (SPA)** de e-commerce desarrollada como Proyecto Integrador del Módulo 5 — Especialización Frontend en Henry. Implementa dos experiencias diferenciadas por rol de usuario:

- **🛒 Customer:** navega el catálogo, filtra productos por categoría, busca por nombre, agrega al carrito y realiza el checkout simulado.
- **🛠️ Admin:** gestiona el catálogo completo (CRUD con upload de imágenes a AWS S3) y administra las órdenes con sus estados.

La aplicación está pensada como una solución **escalable y mantenible**, construida sobre servicios administrados (BaaS) para reducir costos de infraestructura y acelerar el time-to-market.

---

## 🛠️ Tech stack

### Frontend
- **React 18** + **TypeScript** — UI declarativa con tipado estricto
- **Vite** — build tool ultrarrápido
- **React Router v6** — navegación SPA
- **TailwindCSS v4** — estilos utility-first, mobile-first
- **Context API + useReducer** — estado global predecible

### Backend / Servicios
- **Firebase Authentication** — login con email/password y Google
- **Cloud Firestore** — base de datos NoSQL en tiempo real
- **AWS S3** — almacenamiento de imágenes de productos
- **Vercel Serverless Functions** — backend ligero para generar presigned URLs

### Testing
- **Vitest** — test runner moderno
- **React Testing Library** — testing centrado en el usuario

### Deployment
- **Vercel** — hosting + CI/CD desde GitHub
- **GitHub** — control de versiones con commits semánticos

---

## 📸 Capturas

> _Reservado para screenshots de las vistas principales_

| Vista | Captura |
|-------|---------|
| Home | ![Home](public/Home.png) |
| Catálogo | ![Catalog](public/Catalog.png) |
| Detalle de producto | ![Detalle de producto](public/detalle-producto.png) |
| Carrito | ![Carrito](public/cart.png) |
| Checkout | ![Checkout](public/checkout.png) |

---

## 🧠 Decisiones arquitectónicas

### ¿Por qué Context API + useReducer en lugar de Redux o Zustand?

La aplicación tiene un alcance acotado: dos contextos globales reales (sesión del usuario y carrito de compras). Sumar una librería externa como Redux Toolkit o Zustand habría agregado dependencias y curva de aprendizaje sin un beneficio claro a esta escala.

**Context API + useReducer** ya viene en React, no agrega peso al bundle, y `useReducer` es lo suficientemente robusto para manejar las múltiples acciones del carrito (`ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`) de forma predecible y fácil de testear. El reducer es una **función pura**, así que los tests unitarios son directos.

Para un proyecto chico/mediano como este, la solución es **suficientemente escalable** sin agregar complejidad innecesaria.

### ¿Por qué S3 + presigned URLs en lugar de subir desde el servidor?

S3 es un servicio maduro, simple de configurar y ya resuelto para este caso de uso. Las alternativas tenían problemas:

- **Subir desde un servidor propio** → habría que mantener un backend full, gestionar memoria, multipart uploads, etc.
- **Subir desde el frontend directamente con credenciales** → expone las credenciales de AWS en el bundle del navegador (riesgo de seguridad crítico).

La solución con **presigned URLs** combina lo mejor: el frontend pide una URL temporal a una Vercel Function, esa URL autoriza una sola operación (`PutObject`) por tiempo limitado (60 segundos), y el archivo viaja directo del navegador a S3 sin pasar por ningún servidor intermedio. Las credenciales de AWS **nunca llegan al frontend**.

### ¿Por qué estructura por capas y no por features?

Elegí organizar el código por **capas técnicas** (`components/`, `pages/`, `services/`, `contexts/`, `hooks/`, `types/`, `routes/`, `api/`) porque me permite **entender mejor el flujo** de la aplicación: cuando busco "de dónde vienen los datos" sé que están en `services/`, cuando busco "cómo se ve esto" sé que está en `components/` o `pages/`.

Para un proyecto de este tamaño y siendo el primer e-commerce que armo desde cero, la separación por capas hace que la navegación del código sea más intuitiva. La organización por features tiene sentido cuando el equipo crece o cuando las features son completamente independientes entre sí.

---

## 📂 Estructura del proyecto

```
ProyectoM5_MaximoGalvezLanders/
├── api/                        # Vercel Serverless Functions
│   └── presign.ts              # genera presigned URLs de S3
├── public/                     # assets estáticos
│   └── Logo.jpg
├── src/
│   ├── components/             # UI reutilizable (Navbar, Button, CartItem, etc.)
│   ├── contexts/               # AuthContext, CartContext
│   ├── hooks/                  # useAuth, useCart, useDebounce
│   ├── pages/                  # vistas con ruta (HomePage, CartPage, AdminProductPage…)
│   ├── routes/                 # AppRouter, ProtectedRoute, AdminRoute
│   ├── services/               # firebase.ts, auth.ts, products.ts, orders.ts
│   ├── types/                  # interfaces del dominio (Product, Order, User, CartItem)
│   ├── utils/                  # helpers (formatters, validators)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env                        # variables locales (NO se sube al repo)
├── .env.example                # plantilla pública sin valores reales
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔐 Flujo de upload de imágenes a S3

Este es uno de los puntos críticos del proyecto. Las credenciales de AWS **nunca** llegan al navegador.

```
┌─────────────┐  1. POST /api/presign     ┌──────────────────────┐
│             │  { filename, contentType } │                      │
│  Frontend   │ ─────────────────────────▶ │  Vercel Function     │
│  (Admin     │                            │  (/api/presign)      │
│   form)     │                            │                      │
│             │ ◀───────────────────────── │  Usa AWS SDK +       │
│             │  2. { uploadUrl,           │  credenciales del    │
│             │       publicUrl }          │  servidor para       │
│             │                            │  generar URL temp    │
└──────┬──────┘                            └──────────────────────┘
       │
       │ 3. PUT directo a S3 con el archivo
       │    (usando la uploadUrl temporal — 60s)
       ▼
┌──────────────────────┐
│      AWS S3          │
│   (privado para      │
│    escritura,        │
│    público para      │
│    lectura GET)      │
└──────────────────────┘
       │
       │ 4. Frontend guarda la publicUrl en Firestore
       ▼
┌──────────────────────┐
│   Cloud Firestore    │
│   products/{id}      │
│   { imageUrl: "..."} │
└──────────────────────┘
```

### Por qué es seguro

1. **Las credenciales de AWS solo existen en `process.env` de la Vercel Function**, jamás en el bundle del frontend.
2. La **presigned URL expira en 60 segundos**, así que aunque alguien la interceptara, no podría reutilizarla.
3. La URL autoriza **una sola operación específica** (`PutObject` en un `Key` puntual con un `Content-Type` determinado), no acceso general al bucket.
4. La **política del bucket** permite lectura pública solo del prefijo `products/*`, no del bucket entero.
5. El **endpoint `/api/presign` valida** que el usuario es admin antes de generar la URL.

---

## ⚙️ Instalación paso a paso

### Prerrequisitos

- **Node.js** ≥ 18
- **npm** ≥ 9
- Cuenta en [Firebase](https://console.firebase.google.com)
- Cuenta en [AWS](https://aws.amazon.com)
- Cuenta en [Vercel](https://vercel.com) (para deploy)

### 1. Clonar el repositorio

```bash
git clone https://github.com/MGalvezLanders/ProyectoM5_MaximoGalvezLanders.git
cd ProyectoM5_MaximoGalvezLanders
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Entrá a [Firebase Console](https://console.firebase.google.com) y creá un nuevo proyecto.
2. **Authentication** → habilitar *Email/Password* y *Google* como métodos de inicio de sesión.
3. **Firestore Database** → crear base de datos (modo producción).
4. **Project Settings** ⚙️ → *General* → bajá hasta *Your apps* → registrá una app web y copiá la configuración (`apiKey`, `authDomain`, etc.).
5. (Para la Vercel Function) **Project Settings** → *Service accounts* → *Generate new private key* → vas a obtener un JSON con `client_email` y `private_key`.

**Reglas de Firestore mínimas:**

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // -------------------------------------------------------------------
    // users/{uid}
    // -------------------------------------------------------------------
    // Cada usuario lee y escribe únicamente su propio documento de perfil.
    // El perfil guarda `role`: 'customer' (default) o 'admin'. Sólo se asigna
    // admin manualmente desde la consola de Firebase, jamás desde la app.
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // -------------------------------------------------------------------
    // products/{productId}
    // -------------------------------------------------------------------
    // Lectura pública (catálogo navegable sin login).
    // Create/delete: solo admin. Update: admin para cualquier campo, o
    // cualquier autenticado SOLO si decrementa el campo `stock` (checkout).
    match /products/{productId} {
      allow read: if true;
      allow create, delete: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        || (
          request.resource.data.diff(resource.data).affectedKeys().hasOnly(['stock'])
          && request.resource.data.stock is int
          && request.resource.data.stock >= 0
          && request.resource.data.stock < resource.data.stock
        )
      );
    }

    // -------------------------------------------------------------------
    // carts/{uid}
    // -------------------------------------------------------------------
    // Cada usuario lee y escribe únicamente su propio carrito.
    match /carts/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // -------------------------------------------------------------------
    // orders/{orderId}
    // -------------------------------------------------------------------
    // - Lectura: el dueño de la orden o un admin.
    // - Create: cualquier usuario autenticado, siempre que la orden se cree
    //   con su propio userId (impide crear órdenes a nombre de otros).
    // - Update: solo admin (cambio de status). El cliente nunca modifica
    //   sus órdenes una vez creadas.
    match /orders/{orderId} {
      allow read: if request.auth != null
        && (resource.data.userId == request.auth.uid
            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}

```

### 4. Configurar AWS S3

1. Entrá a [AWS Console](https://aws.amazon.com) → servicio **S3**.
2. **Create bucket** → nombre único (ej: `lagauchada-mates-bucket`), región `us-east-1`.
3. Configurar **Block public access**: desmarcar las dos opciones referidas a *bucket policies* y dejar marcadas las de ACLs.
4. **Bucket policy** → pegar (reemplazar el nombre del bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadOnlyForProducts",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::TU-BUCKET/products/*"
    }
  ]
}
```

5. **CORS configuration** → pegar:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 5. Crear usuario IAM con permisos mínimos

1. Servicio **IAM** → *Users* → *Create user*.
2. *Attach policies directly* → *Create policy* (JSON):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::TU-BUCKET/*"
    }
  ]
}
```

3. Crear policy → asignarla al usuario → *Create access key* (*Application running outside AWS*) → guardar el **Access Key ID** y el **Secret Access Key**.

### 6. Configurar variables de entorno

Copiá el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Completá los valores con los datos obtenidos en los pasos 3, 4 y 5. (Ver tabla detallada más abajo.)

### 7. Levantar el proyecto

```bash
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173) en el navegador.

### 8. Asignar el primer admin

Por defecto todos los usuarios se registran con `role: 'customer'`. Para convertir una cuenta en admin:

1. Registrate normalmente con la cuenta que querés que sea admin.
2. Firebase Console → **Firestore** → colección `users` → buscá tu documento.
3. Editá el campo `role` y cambialo de `customer` a `admin`.

---

## 🔑 Variables de entorno

Las variables que empiezan con `VITE_` son accesibles desde el frontend (cliente). Las demás solo existen en las Vercel Serverless Functions (servidor) y **nunca llegan al navegador**.

### Frontend (`VITE_*`)

| Variable | Descripción | Ejemplo | Dónde se usa |
|----------|-------------|---------|--------------|
| `VITE_FIREBASE_API_KEY` | API key pública de Firebase | `AIzaSy...` | `src/services/firebase.ts` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de auth de Firebase | `mi-proy.firebaseapp.com` | `src/services/firebase.ts` |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto Firebase | `mi-proyecto` | `src/services/firebase.ts` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de Firebase Storage | `mi-proy.appspot.com` | `src/services/firebase.ts` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID para mensajería | `1234567890` | `src/services/firebase.ts` |
| `VITE_FIREBASE_APP_ID` | App ID de Firebase | `1:1234:web:abc...` | `src/services/firebase.ts` |
| `VITE_ADMIN_EMAILS` | Emails autorizados (UX) | `admin@mail.com,otro@mail.com` | UI de admin (validación cosmética; la real va en Firestore) |

### Backend / Vercel Functions (sin prefijo)

| Variable | Descripción | Ejemplo | Dónde se usa |
|----------|-------------|---------|--------------|
| `AWS_ACCESS_KEY_ID` | Access Key del usuario IAM | `AKIA...` | `api/presign.ts` |
| `AWS_SECRET_ACCESS_KEY` | Secret Key del usuario IAM | `xxxxxxxxx` | `api/presign.ts` |
| `AWS_REGION` | Región del bucket | `us-east-1` | `api/presign.ts` |
| `S3_BUCKET_NAME` | Nombre del bucket | `lagauchada-mates-bucket` | `api/presign.ts` |
| `FIREBASE_PROJECT_ID` | Project ID para Firebase Admin SDK | `mi-proyecto` | `api/presign.ts` (verificación de token) |
| `FIREBASE_CLIENT_EMAIL` | Email de la service account | `firebase-adminsdk@...iam.gserviceaccount.com` | `api/presign.ts` |
| `FIREBASE_PRIVATE_KEY` | Private key de la service account | `-----BEGIN PRIVATE KEY-----\n...` | `api/presign.ts` |
| `ADMIN_EMAILS` | Lista de emails admin (validación server) | `admin@mail.com,otro@mail.com` | `api/presign.ts` |

> ⚠️ **Importante:** `.env` está incluido en `.gitignore`. Nunca subir credenciales reales al repositorio. El archivo `.env.example` solo contiene los nombres de las variables, sin valores.

---

## 🧪 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Levanta el servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Genera el build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente para verificar |
| `npm run test` | Ejecuta los tests con Vitest |
| `npm run test:coverage` | Ejecuta los tests y genera reporte de cobertura |
| `npm run lint` | Corre ESLint sobre todo el proyecto |

---

## 🤖 Bitácora de uso de IA

Durante el desarrollo de este proyecto utilicé herramientas de IA (Claude, ChatGPT) como apoyo para **tomar decisiones técnicas**, **aprender conceptos nuevos** y **validar implementaciones**. La bitácora a continuación documenta los momentos clave donde la IA aportó valor real al proceso.

| # | Etapa | Herramienta | Prompt / Pregunta | Aprendizaje | Decisión tomada |
|---|-------|-------------|--------------------|-------------|-----------------|
| 1 | Arquitectura inicial | Claude | "Para una SPA de e-commerce con dos roles, ¿conviene organizar el código por capas (components, pages, services) o por features (auth, products, cart)?" | Entendí que la organización por features es mejor cuando las features son independientes y el equipo crece. Por capas es más intuitiva cuando es la primera vez que arma un proyecto así, porque uno "sabe dónde buscar" cada cosa por su tipo técnico. | Elegí **estructura por capas** porque me permite seguir el flujo de datos con más claridad (de `services` a `contexts` a `pages` a `components`). |
| 2 | Estado global | Claude | "¿En qué casos `useReducer` es mejor que `useState` para manejar un carrito de compras con múltiples acciones?" | Aprendí que `useReducer` brilla cuando el estado tiene varias acciones (agregar, eliminar, actualizar cantidad, limpiar) y cuando esas acciones dependen del estado previo. Además, el reducer es una función pura, así que **se testea de forma trivial** sin montar React. | Implementé el carrito con `useReducer` y separé el `CartContext` del `AuthContext` para que cada uno tenga una sola responsabilidad. |
| 3 | Seguridad de credenciales | Claude | "¿Por qué subir imágenes desde el frontend con las credenciales de AWS es un problema y cómo lo resuelven las presigned URLs?" | Las credenciales de AWS no se pueden poner en el frontend porque cualquiera puede inspeccionar el bundle JS y robarlas. Las presigned URLs delegan la autorización al servidor: el backend (Vercel Function) genera una URL temporal con permisos específicos y la entrega al frontend. La URL expira en segundos y solo sirve para una operación puntual. | Implementé la Vercel Function `/api/presign` que valida que el usuario sea admin (verificando el ID token de Firebase) **antes** de generar la presigned URL. Las credenciales de AWS solo viven en `process.env` del servidor. |
| 4 | Bug en producción | Claude | "Subo una imagen a S3 y se ve en el preview, pero en el catálogo aparece rota. La URL en Firestore es limpia (sin presigned)." | El upload con presigned URL ya guardaba la URL pública correcta en Firestore. El problema era que el bucket tenía **Block Public Access** activado para todos los objetos, así que las imágenes no se podían leer públicamente desde el navegador. Aprendí que en S3 la **escritura** y la **lectura** se gobiernan por separado: el `PutObject` se protege con presigned URL pero el `GetObject` necesita una bucket policy pública sobre el prefijo `products/*`. | Agregué una bucket policy que permite `s3:GetObject` solo sobre `products/*`. El upload sigue protegido con presigned URL. |
| 5 | Protección de rutas | Claude | "Después del login, mi `AdminRoute` me redirige a `/` aunque la cuenta sea admin. Si recargo la página, sí funciona." | El problema era el **timing**: `onAuthStateChanged` resolvía el usuario antes de que terminara la query a Firestore que trae el rol. En ese estado intermedio, `profile.role` era `undefined` y el guard tomaba la decisión equivocada. Aprendí que las rutas protegidas necesitan un tercer estado además de "logueado / no logueado": **"cargando el perfil"**. | Agregué un `loading` al `AuthContext` que se mantiene en `true` hasta que el perfil de Firestore termina de cargar. Mientras dura ese estado, `ProtectedRoute` y `AdminRoute` muestran un spinner en vez de redireccionar. |
| 6 | Testing del reducer | Claude | "Generame casos de test para el cartReducer que cubran edge cases que no se me ocurran solo." | Me sugirió casos que yo no había considerado: agregar el mismo producto dos veces (debe sumar cantidad, no duplicar), actualizar cantidad a 0 (debe eliminar el item), aplicar `REMOVE_ITEM` sobre un item que no está en el carrito (debe ser idempotente), aplicar `CLEAR_CART` sobre un carrito vacío (no debe romper). | Implementé esos tests en `cartReducer.test.ts`. Encontré dos bugs reales (no convertía cantidad a 0 en remove y duplicaba items existentes) que arreglé antes de pushear. |

---

## 👤 Autor

**Máximo Gálvez Landers** — Estudiante de la especialización Frontend en Henry.

- 🐙 GitHub: [@MGalvezLanders](https://github.com/MGalvezLanders)
- 📦 Repositorio del proyecto: [ProyectoM5_MaximoGalvezLanders](https://github.com/MGalvezLanders/ProyectoM5_MaximoGalvezLanders)

---

<div align="center">

**🧉 *Pequeños mates, grandes momentos* 🧉**


</div>