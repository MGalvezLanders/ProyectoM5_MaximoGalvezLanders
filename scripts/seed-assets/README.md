# Seed assets

Carpeta local con las imágenes de productos para el seed inicial.
**Esta carpeta NO se commitea** (está en `.gitignore`).

## Estructura esperada

```
seed-assets/
  mates/           → mate-1.jpg, mate-imperial.jpg, ...
  termos/          → termo-stanley.jpg, termo-lumilagro.jpg, ...
  materas/         → matera-cuero.jpg, ...
  ponchos/         → poncho-salteno.jpg, ...
  sombreros/       → sombrero-gaucho.jpg, ...
  boinas/          → boina-vasca.jpg, ...
```

## Reglas

- Formatos válidos: `.jpg`, `.jpeg`, `.png`, `.webp`
- El **nombre del archivo (sin extensión)** se usa como `name` del producto, capitalizado
  - Ejemplo: `mate-imperial.jpg` → producto `Mate Imperial`
- Cada producto hereda la `category` del nombre de la subcarpeta
- Cantidad recomendada: 12–15 archivos repartidos entre todas las categorías

## Cómo correr el seed

1. Llená esta carpeta con las imágenes
2. Asegurate de tener `.env` configurado con AWS + Firebase Admin
3. Corré:

```bash
npm run seed
```

El script sube cada imagen a S3 y crea el doc en Firestore con la URL pública.
