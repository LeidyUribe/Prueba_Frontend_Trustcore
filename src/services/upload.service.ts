import type { SubmitPayload, UploadResponse } from "@/types";

const UPLOAD_ENDPOINT = "/api/upload";
const SUBMIT_ENDPOINT = "/api/submit";

export async function uploadFile(
  file: File,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  return simulateUploadWithProgress(file, signal, onProgress);
}

async function simulateUploadWithProgress(
  file: File,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  const totalSteps = 20;
  const stepDelay = 80 + Math.random() * 120;

  for (let step = 1; step <= totalSteps; step += 1) {
    if (signal?.aborted) {
      throw new DOMException("Upload canceled", "AbortError");
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(resolve, stepDelay);

      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timeout);
          reject(new DOMException("Upload canceled", "AbortError"));
        },
        { once: true }
      );
    });

    onProgress?.(Math.round((step / totalSteps) * 90));
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Error al subir el archivo"
    );
  }

  onProgress?.(100);
  return response.json() as Promise<UploadResponse>;
}

export async function submitForm(payload: SubmitPayload): Promise<{ success: boolean }> {
  const response = await fetch(SUBMIT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Error al enviar el formulario"
    );
  }

  return response.json() as Promise<{ success: boolean }>;
}
