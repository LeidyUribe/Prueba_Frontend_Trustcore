import type { AllowedMimeType } from "@/types";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MIN_FILES = 1;
export const MAX_FILES = 10;

export const ALLOWED_MIME_TYPES: AllowedMimeType[] = [
  "image/png",
  "image/jpeg",
  "application/pdf",
];

export function validateFile(file: File): string[] {
  const errors: string[] = [];

  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    errors.push(
      `Tipo no permitido: "${file.type || "desconocido"}". Permitidos: PNG, JPEG, PDF.`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push(
      `Tamaño excede el máximo de 5 MB (actual: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`
    );
  }

  if (file.size === 0) {
    errors.push("El archivo está vacío.");
  }

  return errors;
}
