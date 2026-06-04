"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type { FileDescriptor, FileDescriptorIdle } from "@/types";
import {
  uploadReducer,
  initialUploadState,
  computeFileCounts,
  canSubmit,
  hasActiveUploads,
} from "@/store";
import { mapFilesToDescriptors } from "@/utils/map-files-to-descriptors";
import { validateFile, MAX_FILES } from "@/utils/file-validation";
import { limitConcurrency } from "@/utils/limit-concurrency";
import { withExponentialBackoff } from "@/utils/exponential-backoff";
import { uploadFile } from "@/services/upload.service";

const UPLOAD_CONCURRENCY = 3;
const MAX_RETRIES = 3;

interface UploadContextValue {
  files: FileDescriptor[];
  counts: ReturnType<typeof computeFileCounts>;
  canSubmitFiles: boolean;
  isUploading: boolean;
  addFiles: (input: FileList | File[]) => string[];
  removeFile: (id: string) => void;
  cancelFile: (id: string) => void;
  retryFile: (id: string) => void;
  startUploads: () => void;
  globalErrors: string[];
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uploadReducer, initialUploadState);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const [globalErrors, setGlobalErrors] = useReducer(
    (_: string[], action: { type: "set"; errors: string[] } | { type: "clear" }) => {
      if (action.type === "clear") return [];
      return action.errors;
    },
    []
  );

  const counts = useMemo(() => computeFileCounts(state.files), [state.files]);
  const canSubmitFiles = useMemo(() => canSubmit(state.files), [state.files]);
  const isUploading = useMemo(() => hasActiveUploads(state.files), [state.files]);

  const uploadSingleFile = useCallback(async (descriptor: FileDescriptorIdle) => {
    const controller = new AbortController();
    abortControllers.current.set(descriptor.id, controller);

    dispatch({
      type: "SET_FILE_UPLOADING",
      payload: { id: descriptor.id, progress: 0 },
    });

    try {
      const result = await withExponentialBackoff(
        () =>
          uploadFile(
            descriptor.file,
            controller.signal,
            (progress) => {
              dispatch({
                type: "SET_FILE_UPLOADING",
                payload: { id: descriptor.id, progress },
              });
            }
          ),
        MAX_RETRIES
      );

      dispatch({
        type: "SET_FILE_DONE",
        payload: { id: descriptor.id, url: result.url },
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        dispatch({ type: "SET_FILE_CANCELED", payload: { id: descriptor.id } });
      } else {
        const message =
          error instanceof Error ? error.message : "Error desconocido al subir";
        dispatch({
          type: "SET_FILE_ERROR",
          payload: { id: descriptor.id, errors: [message] },
        });
      }
    } finally {
      abortControllers.current.delete(descriptor.id);
    }
  }, []);

  const startUploads = useCallback(() => {
    const idleFiles = state.files.filter(
      (f): f is FileDescriptorIdle => f.status === "idle"
    );

    if (idleFiles.length === 0) return;

    const tasks = idleFiles.map(
      (descriptor) => () => uploadSingleFile(descriptor)
    );

    void limitConcurrency(tasks, { concurrency: UPLOAD_CONCURRENCY });
  }, [state.files, uploadSingleFile]);

  const addFiles = useCallback(
    (input: FileList | File[]): string[] => {
      const errors: string[] = [];
      const descriptors = mapFilesToDescriptors(input);

      const existingKeys = new Set(
        state.files.map((f) => `${f.name}::${f.size}`)
      );

      const validDescriptors: FileDescriptorIdle[] = [];

      for (const descriptor of descriptors) {
        if (existingKeys.has(`${descriptor.name}::${descriptor.size}`)) {
          errors.push(`"${descriptor.name}" ya fue agregado.`);
          continue;
        }

        const validationErrors = validateFile(descriptor.file);
        if (validationErrors.length > 0) {
          errors.push(...validationErrors.map((e) => `${descriptor.name}: ${e}`));
          continue;
        }

        if (state.files.length + validDescriptors.length >= MAX_FILES) {
          errors.push(`Máximo ${MAX_FILES} archivos permitidos.`);
          break;
        }

        validDescriptors.push(descriptor);
        existingKeys.add(`${descriptor.name}::${descriptor.size}`);
      }

      if (validDescriptors.length > 0) {
        dispatch({ type: "ADD_FILES", payload: validDescriptors });
      }

      setGlobalErrors({ type: "set", errors });
      return errors;
    },
    [state.files]
  );

  const removeFile = useCallback((id: string) => {
    const controller = abortControllers.current.get(id);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(id);
    }
    dispatch({ type: "REMOVE_FILE", payload: { id } });
  }, []);

  const cancelFile = useCallback((id: string) => {
    const controller = abortControllers.current.get(id);
    if (controller) {
      controller.abort();
    }
  }, []);

  const retryFile = useCallback(
    (id: string) => {
      const file = state.files.find((f) => f.id === id);
      if (!file || (file.status !== "error" && file.status !== "canceled")) {
        return;
      }

      dispatch({
        type: "UPDATE_FILE",
        payload: { id, patch: { status: "idle" } },
      });

      const idleDescriptor = {
        ...file,
        status: "idle" as const,
      };

      void uploadSingleFile(idleDescriptor);
    },
    [state.files, uploadSingleFile]
  );

  const value = useMemo<UploadContextValue>(
    () => ({
      files: state.files,
      counts,
      canSubmitFiles,
      isUploading,
      addFiles,
      removeFile,
      cancelFile,
      retryFile,
      startUploads,
      globalErrors,
    }),
    [
      state.files,
      counts,
      canSubmitFiles,
      isUploading,
      addFiles,
      removeFile,
      cancelFile,
      retryFile,
      startUploads,
      globalErrors,
    ]
  );

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
}

export function useUploadContext(): UploadContextValue {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUploadContext must be used within UploadProvider");
  }
  return context;
}
