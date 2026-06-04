/**
 * Discriminated Union for file upload lifecycle states.
 * The `status` field acts as the discriminant — TypeScript narrows
 * the type based on its value, enforcing field presence/absence at compile time.
 */

export type FileStatus = "idle" | "uploading" | "done" | "error" | "canceled";

export interface FileDescriptorBase {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  /** Reference to the original File object for upload/retry */
  file: File;
  /** Server URL after successful upload */
  url?: string;
}

export interface FileDescriptorIdle extends FileDescriptorBase {
  status: "idle";
}

export interface FileDescriptorUploading extends FileDescriptorBase {
  status: "uploading";
  progress: number;
}

export interface FileDescriptorDone extends FileDescriptorBase {
  status: "done";
  url: string;
}

export interface FileDescriptorError extends FileDescriptorBase {
  status: "error";
  errors: string[];
}

export interface FileDescriptorCanceled extends FileDescriptorBase {
  status: "canceled";
}

export type FileDescriptor =
  | FileDescriptorIdle
  | FileDescriptorUploading
  | FileDescriptorDone
  | FileDescriptorError
  | FileDescriptorCanceled;

export type AllowedMimeType =
  | "image/png"
  | "image/jpeg"
  | "application/pdf";

export interface SubmitFilePayload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface SubmitPayload {
  title: string;
  description: string;
  files: SubmitFilePayload[];
}

export interface UploadResponse {
  id: string;
  url: string;
}
