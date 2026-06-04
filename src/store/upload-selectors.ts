import type { FileDescriptor, FileStatus } from "@/types";

export interface FileCounts {
  uploading: number;
  pending: number;
  done: number;
  error: number;
  canceled: number;
  total: number;
}

export function computeFileCounts(files: FileDescriptor[]): FileCounts {
  const counts: FileCounts = {
    uploading: 0,
    pending: 0,
    done: 0,
    error: 0,
    canceled: 0,
    total: files.length,
  };

  for (const file of files) {
    switch (file.status) {
      case "uploading":
        counts.uploading += 1;
        break;
      case "idle":
        counts.pending += 1;
        break;
      case "done":
        counts.done += 1;
        break;
      case "error":
        counts.error += 1;
        break;
      case "canceled":
        counts.canceled += 1;
        break;
    }
  }

  return counts;
}

export function getStatusLabel(status: FileStatus): string {
  const labels: Record<FileStatus, string> = {
    idle: "Pendiente",
    uploading: "Subiendo",
    done: "Completado",
    error: "Error",
    canceled: "Cancelado",
  };
  return labels[status];
}

export function canSubmit(files: FileDescriptor[]): boolean {
  if (files.length === 0) return false;
  return files.every((f) => f.status === "done");
}

export function hasActiveUploads(files: FileDescriptor[]): boolean {
  return files.some((f) => f.status === "uploading");
}
