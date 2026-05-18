import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { uploadImage } from "@/api/uploadImage";

type ImageUploaderProps = {
  value?: string;
  onChange: (url: string) => void;
  onError?: (message: string) => void;
};

const ACCEPTED = "image/jpeg,image/png,image/webp";

export function ImageUploader({ value, onChange, onError }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadImage(file, setProgress);
      onChange(url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error desconocido subiendo";
      onError?.(message);
    } finally {
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <div className="w-32 h-32 rounded-lg overflow-hidden border border-sepia-300 bg-cream-100 flex items-center justify-center shrink-0">
          {value ? (
            <img
              src={value}
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading
              ? `Subiendo ${progress ?? 0}%`
              : value
                ? "Cambiar imagen"
                : "Subir imagen"}
          </Button>
          <p className="text-xs text-leather-500">
            JPG, PNG o WebP · máx 5 MB
          </p>
          {uploading && progress !== null && (
            <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sun-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
