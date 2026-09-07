# ProyectoM5 — La Gauchada

E-commerce de productos artesanales argentinos. React + TypeScript + Vite + Firebase (Firestore/Auth) + AWS S3.

## Antes de terminar cualquier tarea

Siempre correr `npm run build` al final. El build debe completarse sin errores antes de hacer commit o declarar la tarea terminada.

## Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Vite
- **Animaciones**: motion/react (framer motion)
- **Routing**: react-router-dom v7
- **Backend/DB**: Firebase Firestore + Firebase Auth
- **Storage**: AWS S3 (imágenes de productos vía presigned URLs en Vercel Functions)
- **Toasts**: sonner
- **Gráficos**: recharts

## Estructura

```
src/
  pages/         # Páginas por sección (products/, admin/, auth/, etc.)
  components/    # Componentes reutilizables (admin/, product/, ui/, button/)
  hooks/         # Custom hooks por dominio
  services/      # Acceso a Firestore y S3
  types/         # Tipos TypeScript
  utils/         # Helpers (formatting, animations, etc.)
```

## Colores Tailwind personalizados

`leather`, `terracota`, `cream`, `sepia`, `field`, `sun`, `sky` — paleta de tonos cálidos terrosos.

## Datos

- **products** (Firestore): `imageUrl` (string) + `imageUrls?` (string[]) para múltiples fotos
- **orders** (Firestore): status = `pending | processing | completed | cancelled`
- **users** (Firestore): role = `admin | customer`
