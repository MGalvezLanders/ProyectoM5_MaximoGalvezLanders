  # Desiciones sobre el uso de IA


  ## Persistencia de datos en el carrito
  Decisión documentada (comentario en src/services/cart.ts:5): elegí Firestore en lugar de localStorage porque la consigna pide "por usuario" — Firestore sincroniza entre dispositivos; localStorage es por-navegador. Doc top-level carts/{uid} en vez de campo dentro de users/{uid} para no acoplar reads de profile con escrituras
  de carrito.
