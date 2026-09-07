import { useEffect, useRef, type ChangeEvent } from "react";

const ACCEPTED = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES = 5;

interface MultiImageUploaderProps {
  existingUrls: string[];
  newFiles: File[];
  onAdd: (file: File) => void;
  onRemoveExisting: (url: string) => void;
  onRemoveNew: (index: number) => void;
  disabled?: boolean;
  error?: string;
  localError: string | null;
  onLocalError: (msg: string | null) => void;
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-leather-900/70 text-cream-50 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity"
      aria-label="Quitar imagen"
    >
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function MultiImageUploader({
  existingUrls,
  newFiles,
  onAdd,
  onRemoveExisting,
  onRemoveNew,
  disabled,
  error,
  localError,
  onLocalError,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobMapRef = useRef<Map<File, string>>(new Map());

  const getPreview = (file: File): string => {
    if (!blobMapRef.current.has(file)) {
      blobMapRef.current.set(file, URL.createObjectURL(file));
    }
    return blobMapRef.current.get(file)!;
  };

  // Limpia URLs de archivos que ya no están en newFiles
  useEffect(() => {
    const current = new Set(newFiles);
    for (const [file, url] of blobMapRef.current.entries()) {
      if (!current.has(file)) {
        URL.revokeObjectURL(url);
        blobMapRef.current.delete(file);
      }
    }
  }, [newFiles]);

  // Limpia todo al desmontar
  useEffect(() => {
    const map = blobMapRef.current;
    return () => {
      for (const url of map.values()) URL.revokeObjectURL(url);
      map.clear();
    };
  }, []);

  const totalCount = existingUrls.length + newFiles.length;
  const canAdd = totalCount < MAX_IMAGES && !disabled;

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onLocalError(null);

    if (file.size > MAX_BYTES) {
      onLocalError(`Archivo muy grande. Máx: ${MAX_BYTES / 1024 / 1024} MB`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    onAdd(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isPrincipal = (existingIndex: number, newIndex: number) =>
    existingIndex === 0 && existingUrls.length > 0
      ? existingIndex === 0
      : existingUrls.length === 0 && newIndex === 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Fotos existentes (Firestore) */}
        {existingUrls.map((url, i) => (
          <div
            key={url}
            className="relative w-20 h-20 rounded-lg overflow-hidden border border-sepia-300 bg-cream-100 group/slot shrink-0"
          >
            <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 text-[9px] font-bold text-center bg-leather-900/60 text-cream-50 py-0.5 leading-4">
                Principal
              </span>
            )}
            {!disabled && <RemoveBtn onClick={() => onRemoveExisting(url)} />}
          </div>
        ))}

        {/* Previews de archivos nuevos */}
        {newFiles.map((file, i) => (
          <div
            key={i}
            className="relative w-20 h-20 rounded-lg overflow-hidden border border-sepia-300 bg-cream-100 group/slot shrink-0"
          >
            <img src={getPreview(file)} alt={`Foto nueva ${i + 1}`} className="w-full h-full object-cover" />
            {isPrincipal(-1, i) && existingUrls.length === 0 && i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 text-[9px] font-bold text-center bg-leather-900/60 text-cream-50 py-0.5 leading-4">
                Principal
              </span>
            )}
            {!disabled && <RemoveBtn onClick={() => onRemoveNew(i)} />}
          </div>
        ))}

        {/* Botón agregar */}
        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-sepia-400 flex flex-col items-center justify-center gap-0.5 text-leather-500 hover:border-leather-600 hover:text-leather-700 transition-colors shrink-0"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] font-semibold">Agregar</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        disabled={disabled}
        onChange={handleFile}
      />

      <p className="text-xs text-leather-500">
        JPG, PNG o WebP · máx 5 MB · hasta {MAX_IMAGES} fotos
        {totalCount > 0 && ` (${totalCount}/${MAX_IMAGES})`}
      </p>

      {(localError ?? error) && (
        <p className="text-xs text-terracota-500" role="alert">
          {localError ?? error}
        </p>
      )}
    </div>
  );
}
