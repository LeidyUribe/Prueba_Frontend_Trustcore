/**
 * PART A — Ejemplos de FileDescriptor (Discriminated Union)
 *
 * Estos ejemplos demuestran type narrowing en acción.
 */

import type { FileDescriptor } from "./file-descriptor";

// Mock File for examples
const mockFile = new File(["content"], "doc.pdf", { type: "application/pdf" });

// ✅ VÁLIDOS
const idleFile: FileDescriptor = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "doc.pdf",
  size: 1024,
  mimeType: "application/pdf",
  status: "idle",
  file: mockFile,
};

const uploadingFile: FileDescriptor = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  name: "photo.jpg",
  size: 2048000,
  mimeType: "image/jpeg",
  status: "uploading",
  progress: 45,
  file: mockFile,
};

const doneFile: FileDescriptor = {
  id: "550e8400-e29b-41d4-a716-446655440002",
  name: "image.png",
  size: 512000,
  mimeType: "image/png",
  status: "done",
  url: "https://cdn.example.com/uploads/image.png",
  file: mockFile,
};

const errorFile: FileDescriptor = {
  id: "550e8400-e29b-41d4-a716-446655440003",
  name: "fail.pdf",
  size: 100,
  mimeType: "application/pdf",
  status: "error",
  errors: ["Error simulado del servidor"],
  file: mockFile,
};

// Type Narrowing en acción
function renderProgress(descriptor: FileDescriptor): string {
  if (descriptor.status === "uploading") {
    // TypeScript sabe que `progress` existe aquí
    return `${descriptor.progress}%`;
  }
  return "N/A";
}

// ❌ INVÁLIDOS (descomentar produce error de compilación)

// Error: progress no existe en status "idle"
// const invalidIdle: FileDescriptor = {
//   id: "1", name: "a.pdf", size: 100, mimeType: "application/pdf",
//   status: "idle", progress: 0, file: mockFile,
// };

// Error: progress es obligatorio en "uploading"
// const invalidUploading: FileDescriptor = {
//   id: "2", name: "b.pdf", size: 100, mimeType: "application/pdf",
//   status: "uploading", file: mockFile,
// };

// Error: errors es obligatorio en "error"
// const invalidError: FileDescriptor = {
//   id: "3", name: "c.pdf", size: 100, mimeType: "application/pdf",
//   status: "error", file: mockFile,
// };

// Error: url es obligatorio en "done"
// const invalidDone: FileDescriptor = {
//   id: "4", name: "d.pdf", size: 100, mimeType: "application/pdf",
//   status: "done", file: mockFile,
// };

export { idleFile, uploadingFile, doneFile, errorFile, renderProgress };
