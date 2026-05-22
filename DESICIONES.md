  # Desiciones sobre el uso de IA


  ## Persistencia de datos en el carrito
  Decisión documentada (comentario en src/services/cart.ts:5): elegí Firestore en lugar de localStorage porque la consigna pide "por usuario" — Firestore sincroniza entre dispositivos; localStorage es por-navegador. Doc top-level carts/{uid} en vez de campo dentro de users/{uid} para no acoplar reads de profile con escrituras
  de carrito.


  ## Actualización de stock al crear una orden

  **Decisión:** al confirmar el checkout, `createOrder` (`src/services/orders.ts`) usa `runTransaction` de Firestore para —en una sola operación atómica— leer el stock de todos los productos del carrito, validarlo, crear el documento de la orden y decrementar el stock. Si algún producto no existe o no tiene stock suficiente, **toda** la transacción se aborta y nada se persiste.

  **Por qué transacción y no escrituras sueltas:**
  Si después del `addDoc(orders)` hiciera un `updateDoc(products, { stock: stock - n })` aparte, dos usuarios comprando la última unidad al mismo tiempo pasarían la validación local en paralelo y ambos lograrían crear la orden → stock negativo (oversell). `runTransaction` reintenta automáticamente ante contención, garantizando que las lecturas usadas para validar sean las mismas que se ven al momento del write.

  **Cómo está estructurado:**
  1. **Reads primero** (`Promise.all(refs.map(tx.get))`) — Firestore exige que todas las lecturas vayan antes que cualquier write dentro de la transacción.
  2. **Validación** — para cada item: el producto existe + `stock >= quantity`. Si falla, se lanza un `Error` con mensaje claro (ej. `Stock insuficiente para "Mochila de cuero": disponible 2, solicitado 3`). El hook `useFirestoreError` muestra ese `.message` directamente en la UI del checkout.
  3. **Writes** — `tx.set(orderRef, …)` para crear la orden (con ID pre-generado vía `doc(collection)` para poder devolverlo) y `tx.update(productRef, { stock: nuevo })` para cada producto.

  **Limitación conocida (caveat de seguridad):**
  La transacción corre en el cliente, así que protege contra race conditions legítimas pero **no** contra un usuario malicioso que llame a Firestore directamente desde la consola y haga un `updateDoc` arbitrario sobre `products`. Para protección real haría falta:
  - **Firestore Security Rules** que solo permitan escribir en `products.stock` desde una transacción que también cree una orden, o
  - mover `createOrder` a una **Cloud Function** y bloquear escrituras directas a `products` desde el cliente.

  En el alcance del proyecto académico se eligió la transacción cliente + documentar este caveat, sin Cloud Functions.


  ## Subida de imágenes a S3 (presigned URLs) y verificación de admin en el server

  **Decisión:** las imágenes de productos se suben directo del navegador a S3 mediante una **presigned URL** generada por una Vercel Function (`api/s3-presign.ts`). El endpoint **verifica el ID token de Firebase Auth en el server** antes de firmar, así solo un usuario admin puede obtener URLs de subida.

  **Por qué presigned URLs y no proxy:**
  - Las credenciales AWS quedan **solo en el server** (`process.env.AWS_*`, sin prefijo `VITE_`), nunca expuestas al cliente.
  - El archivo viaja del browser **directo a S3**, sin pasar por la Vercel Function → no consume tiempo de ejecución serverless ni memoria por cada MB subido.
  - La URL firmada caduca a los **60 segundos**, ventana suficiente para subir (máx. 5 MB) y corta para minimizar riesgo si se filtra.

  **Por qué verificar admin en el server (no solo `AdminRoute`):**
  `AdminRoute` (`src/routes/AdminRoute.tsx`) solo bloquea la UI. Sin verificación server-side, cualquier usuario autenticado podría hacer `fetch("/api/s3-presign", …)` desde la consola del browser y subir archivos a nuestro bucket. Por eso el endpoint:

  1. Lee el header `Authorization: Bearer <idToken>` (el cliente lo adjunta con `currentUser.getIdToken()` en `src/services/admin/uploadImage.ts`).
  2. Verifica el token con **Firebase Admin SDK** (`getAuth(admin).verifyIdToken(token)`) — esto valida firma, expiración y emisor contra los servicios de Firebase.
  3. Compara el `email` decodificado contra `process.env.ADMIN_EMAILS` (misma lista que `VITE_ADMIN_EMAILS` del cliente, pero leída del lado server). Si no matchea → `403 Forbidden`.

  **Validaciones adicionales en el endpoint:**
  - MIME permitido: `image/jpeg`, `image/png`, `image/webp` (la extensión del archivo se deriva del MIME validado, no del filename — que es input no confiable).
  - Tamaño máx.: 5 MB.
  - Key generada server-side con `${timestamp}-${uuid}-${slug}.${ext}` → impide colisiones y que el cliente elija la ruta dentro del bucket.
  - CORS configurado (`OPTIONS` preflight + headers `Access-Control-*`).
  - `CacheControl: public, max-age=31536000, immutable` en el `PutObjectCommand` → como cada URL es única, el browser puede cachear la imagen indefinidamente.

  **Env vars requeridas en Vercel (server-side, sin `VITE_`):**
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
  - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (del service account JSON de Firebase Admin)
  - `ADMIN_EMAILS` (lista separada por coma, igual a `VITE_ADMIN_EMAILS` del cliente)


  ## Upload de imagen en submit (no on file pick) + cleanup de huérfanos

  **Decisión:** el upload a S3 sucede **en el submit del formulario**, no en el momento en que el admin elige el archivo. Mientras el admin no clickea "Guardar", el `File` vive solo en memoria del browser y se previsualiza con `URL.createObjectURL` (blob local, sin red). Esto elimina por construcción la mayoría de escenarios de archivos huérfanos en S3.

  **El problema original** (con upload on file pick):
  Cada vez que el admin elegía una imagen, se subía inmediatamente a S3. Si después cancelaba, cambiaba de opinión, o cerraba la pestaña, el objeto quedaba huérfano (almacenado pero sin referencia desde Firestore). Para mitigarlo había que trackear todas las keys subidas en sesión y borrarlas en `useEffect` cleanup — funcionaba pero era frágil (no corre si el browser cierra la pestaña, depende del ciclo de vida de React).

  **El cambio arquitectónico:**
  - `ImageUploader` ahora es un componente **controlado**: solo muestra el preview (existente de Firestore o blob local del `File` elegido) y emite `onFileSelected(file)` al padre. **No sube nada a S3.**
  - El padre (`AdminProductFormPage`) guarda el `File` en estado y solo invoca `uploadImage(file)` dentro del `handleSubmit`, después de validar todos los campos.
  - El preview local usa `URL.createObjectURL(file)` y se libera con `URL.revokeObjectURL` en la cleanup del `useEffect` (se dispara al cambiar de archivo y al desmontar — evita memory leaks).

  **Consecuencia: no hay huérfanos por cancelación.** Si el admin no completa el submit, ningún archivo va a S3. Si abandona la pestaña antes del submit, igual no hay nada subido.

  **Caso restante que sí requiere cleanup:** edición + reemplazo de imagen.
  - Admin abre `/admin/products/:id/edit` → carga imagen X de Firestore.
  - Elige imagen Y, completa el form, hace submit → se sube Y, Firestore se actualiza con la URL de Y.
  - **X queda huérfana en S3** porque ya no está referenciada.

  Para esto se conserva el endpoint **`/api/s3-delete`** (mismo patrón de auth que `/api/s3-presign`: verifica ID token + admin email + restringe al prefix `products/` para que un admin no pueda borrar objetos arbitrarios). En `handleSubmit`, tras la save exitosa:
  ```ts
  if (selectedFile && initialImageUrl && initialImageUrl !== finalImageUrl) {
    void deleteImageByUrl(initialImageUrl);
  }
  ```
  El `deleteImageByUrl` parsea la URL para extraer la key (`extractKeyFromUrl`), llama al endpoint con el ID token, y falla silenciosamente si algo sale mal (un cleanup fallido no debe romper la UX — la save ya fue exitosa).

  **State machine del form:**
  Se adoptó un único objeto de estado `{ fields, errors, status, globalError }` con `status: "editing" | "submitting" | "error"`. Validación corre en cada `handleChange` (real-time feedback) y antes del submit. Mensajes de error específicos:
  - `permission-denied` → "No tenés permiso para realizar esta acción"
  - `CORS` → "Error de CORS al subir la imagen — revisar config del bucket" (mensaje recurrente durante el setup)
  - Otros → se propaga el `.message` del error (que para fallos de S3 ya viene parseado con `<Code>: <Message>` desde `parseS3Error`).

  **Limitaciones conocidas:**
  - Si el upload a S3 funciona pero la escritura a Firestore falla (caso raro: token expira entre ambas, regla de Firestore rechaza), queda una imagen huérfana porque ya no podemos borrarla (el catch del submit no sabe la `key`). Aceptable para alcance académico — se podría capturar la key del `uploadImage` y borrarla en el catch, pero agrega complejidad sin beneficio relevante.
  - El restrict del endpoint `/api/s3-delete` al prefix `products/` impide que un admin (o un token admin filtrado) use el endpoint para borrar objetos arbitrarios del bucket.


  ## Mejoras de robustez en el flujo de upload

  **Decisión:** se ajustaron varios puntos del cliente para mejorar diagnóstico y resiliencia, sin cambiar el flujo arquitectural.

  - **Parsing del error de S3** (`src/services/admin/uploadImage.ts` → `parseS3Error`): cuando el PUT a S3 falla (403, 400, etc.), se parsea el XML estándar de AWS (`<Code>` + `<Message>`) y se propaga al UI. Antes se mostraba solo "status 403", lo que dificultó el diagnóstico del CORS/IAM en la etapa de setup.
  - **Timeout XHR de 60s** (mismo archivo): la presigned URL expira a los 60s, así que el upload también. `xhr.timeout` + `xhr.ontimeout` evita que el botón quede colgado indefinidamente con una conexión lenta o un peer muerto.
  - **Race condition en `ImageUploader`** (`src/components/admin/ImageUploader.tsx`): un `mountedRef` previene `setState` sobre componente desmontado cuando el upload termina después de que el usuario navegó fuera del form.
  - **Validación de `imageUrl` activada en el submit** (`AdminProductFormPage.tsx`): el form ahora exige imagen antes de guardar — un producto sin imagen producía cards rotas en el catálogo.
  - **Regex de diacríticos en `slugifyFilename`** (`api/s3-presign.ts`): se reemplazó el rango de combining marks literales por `\p{M}` (clase Unicode estándar) para que no dependa del encoding del archivo.

 ### Credenciales AWS NO están en el frontend — pero hay un matiz importante

  El secret access key (AWS_SECRET_ACCESS_KEY) JAMÁS sale del server — confirmado, solo se usa en api/s3-presign.ts:47 con process.env.* (server-side only, sin prefijo
  VITE_).

  PERO el Access Key ID (AKIATWVRYQBYWTGLLDFT...) SÍ es visible en la presigned URL dentro del parámetro X-Amz-Credential=... (lo vimos en errores anteriores tuyos). Esto
  es comportamiento normal y esperado de AWS — el Access Key ID es "público" en el sentido de que identifica al usuario IAM, pero sin el secret nadie puede hacer nada con
  él. Es como un username.

  → Si tu evaluador chequea DevTools → Network y ve AKIA... en la URL del PUT, va a parecer "credencial expuesta" pero no lo es. Anotalo para defenderlo: "el Access Key ID
   es visible en presigned URLs por diseño; el secret nunca sale del server, y eso es lo único que da poder de acción".

   ### Podés explicar el flujo de presigned URLs en voz alta — esto depende de vos, no del código

  Lo que tenés a favor: DESICIONES.md tiene 4 secciones que cubren el flujo completo (presign + auth admin + cleanup + bucket policy). Si lo leés tranquilo antes de la
  defensa, lo bajás. El flujo en una frase:

  ▎ "El cliente, autenticado como admin, le pide al endpoint /api/s3-presign una URL temporal. El server verifica el ID token de Firebase con firebase-admin, confirma que
  ▎ el email está en ADMIN_EMAILS, y firma una URL con las credenciales AWS que solo vive 60 segundos. El cliente hace PUT directo a S3 con esa URL — el archivo nunca pasa
  ▎  por el server. S3 valida la firma y guarda el objeto. La URL pública del objeto se persiste en Firestore junto con los demás campos del producto."



  ## Formateo y Principio de Responsabilidad Unica
  10 archivos nuevos creados:

  ┌──────────────────────────────────┬────────────────────────────────────────────────────────┐
  │             Archivo              │                    Responsabilidad                     │
  ├──────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ utils/formatting.ts              │ formatPrice, formatOrderDate, formatOrderDateShort     │
  ├──────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ utils/orderStatus.ts             │ STATUS_LABELS, STATUS_TONES                            │
  ├──────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ utils/constants.ts               │ PRODUCT_CATEGORIES                                     │
  ├──────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ utils/product.ts                 │ getStockBadge + tipo StockBadge                        │
  ├──────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ types/productForm.ts             │ Tipos del formulario admin                             │
  ├──────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ types/auth.ts                    │ Tipo UserProfile                                       │
  ├──────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ hooks/admin/useProductForm.ts    │ Toda la lógica de estado, validación y submit del form │
  ├──────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ hooks/useUserOrders.ts           │ Fetch de órdenes del usuario                           │
  ├──────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ hooks/useCheckout.ts             │ Lógica completa del checkout                           │
  ├──────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ components/admin/ProductForm.tsx │ JSX del formulario con Field interno                   │
  └──────────────────────────────────┴────────────────────────────────────────────────────────┘

  7 archivos simplificados:
  - AdminProductFormPage.tsx 464 → 45 líneas (solo orquesta hook + componente)
  - CheckoutPage.tsx 220 → 100 líneas (solo presentación)
  - OrdersPage.tsx — sin lógica de fetch ni constantes inline
  - OrderDetailPage.tsx — sin formatPrice, STATUS_LABELS, STATUS_TONES ni formatOrderDate
  - AdminProductsPage.tsx — sin formatPrice local
  - ProductDetailPage.tsx — sin formatPrice ni getStockBadge locales
  - AuthContext.tsx — UserProfile viene de types/auth.ts


  ## Siguiendo los principios SOLID que otros cambios me propondrias 

  1. ISP — ProductsContext expone demasiado a todos los consumidores

  El contexto mezcla lectura y escritura. Una CatalogPage o ProductDetailPage recibe createOne, updateOne, removeOne, bulkCreate... métodos que jamás va
  a usar.

  Propuesta: dividir en dos contextos:
  - ProductsReadContext — solo items, loading, error, fetchAll
  - ProductsWriteContext — el CRUD, solo usado en rutas admin

  ---
  2. SRP — AuthContext tiene lógica de negocio mezclada con estado

  La función resolveProfile dentro de AuthContext.tsx hace tres cosas: busca el perfil, lo crea si no existe, y promueve a admin si corresponde. Es
  lógica de negocio que no pertenece en un contexto de React.

  Propuesta: mover resolveProfile a services/users.service.ts como resolveOrCreateProfile(firebaseUser). El contexto solo llama al servicio y gestiona el
   estado.

  ---
  3. DIP — Los hooks y contextos dependen de implementaciones concretas de Firebase

  useProductForm, CatalogContext, ProductsContext importan directamente desde products.service.ts. Si mañana cambiás el backend (Firebase → REST API),
  tenés que modificar todos esos archivos.

  Propuesta: un repositorio como capa intermedia:
  hooks/contextos → IProductRepository (interfaz) → FirebaseProductRepository (implementación)
  Permite cambiar el backend sin tocar la UI, y hace los tests más simples (mockés la interfaz, no Firebase).

  ---
  4. OCP — Los 5 hooks de error no comparten base

  useFirestoreError, useHttpError, useStorageError, etc. probablemente tienen la misma estructura interna y se diferencian solo en cómo mapean el error a
   mensaje legible.

  Propuesta: un hook base useError(mapper: (err) => string) del que los específicos son solo variantes. Agregar un nuevo tipo de error es extender, no
  modificar.

  ---
  5. ISP — CatalogContext mezcla tres responsabilidades

  Hoy maneja: estado de los filtros (category, searchPrefix), estado de paginación (lastDoc, hasMore) y fetching de datos. Son tres razones distintas
  para cambiar.

  Propuesta: separar en useCatalogFilters (estado de filtros) y useCatalogPage (paginación + fetching), que CatalogContext compone.

  ---
  Mi recomendación de orden: empezar por el 2 (SRP en AuthContext) porque es el cambio más pequeño con beneficio inmediato en testabilidad, luego el 1
  (ISP en ProductsContext) porque el mayor riesgo de bugs siempre está en exponer mutaciones donde no deberían estar. ¿Querés que implemente alguno?