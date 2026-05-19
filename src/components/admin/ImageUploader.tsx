import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";

type ImageUploaderProps = {
  //* URL existente del producto (Firestore) — se muestra como preview hasta
  //* que el admin elija un archivo nuevo.
  existingImageUrl?: string;
  //* Se dispara cuando el admin elige un archivo. Null = limpió la selección.
  //* El padre guarda el File y lo sube a S3 recién al submit.
  onFileSelected: (file: File | null) => void;
  disabled?: boolean;
};

const ACCEPTED = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUploader({
  existingImageUrl,
  onFileSelected,
  disabled,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);

  //* Liberar el blob: la cleanup corre con el closure del previewUrl previo,
  //* así se revoca el anterior cuando cambia y también al desmontar.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    if (file.size > MAX_BYTES) {
      setLocalError(`Archivo demasiado grande. Máx: ${MAX_BYTES / 1024 / 1024} MB`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  };

  const displayUrl = previewUrl || existingImageUrl || "";

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <div className="w-32 h-32 rounded-lg overflow-hidden border border-sepia-300 bg-cream-100 flex items-center justify-center shrink-0">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-leather-500 text-center px-2">
              Sin imagen
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            disabled={disabled}
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {displayUrl ? "Cambiar imagen" : "Subir imagen"}
          </Button>
          <p className="text-xs text-leather-500">JPG, PNG o WebP · máx 5 MB</p>
          {localError && (
            <p className="text-xs text-terracota-500" role="alert">
              {localError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
