# Setup del bucket S3

## 1) Bucket Policy (lectura pública de objetos en `/products/*`)

1. AWS Console → S3 → tu bucket → pestaña **Permissions**
2. Sección **Block public access** → editar → **desmarcar** "Block all public access" → confirmar
3. Sección **Bucket policy** → editar → pegar el contenido de `bucket-policy.json`
4. Reemplazá `REEMPLAZAR-NOMBRE-DEL-BUCKET` por el nombre real de tu bucket
5. Guardar

> Esto permite `s3:GetObject` SOLO en objetos bajo `/products/*`. El resto del bucket queda privado.

## 2) CORS (permitir PUT desde el front local)

1. Misma pestaña **Permissions** → sección **Cross-origin resource sharing (CORS)** → editar
2. Pegar el contenido de `cors.json` y guardar

> Cuando hagas deploy en Vercel, agregá tu URL de producción a `AllowedOrigins`.

## 3) IAM user con permisos mínimos

Si todavía no lo hiciste:

1. AWS Console → IAM → Users → Create user
2. Adjuntar policy inline:

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

3. Security credentials → Create access key → guardar en `.env`:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
