import type { FileDescriptor } from "@/types";

export type UploadAction =
  | { type: "ADD_FILES"; payload: FileDescriptor[] }
  | { type: "REMOVE_FILE"; payload: { id: string } }
  | { type: "UPDATE_FILE"; payload: { id: string; patch: Partial<FileDescriptor> & Pick<FileDescriptor, "status"> } }
  | { type: "SET_FILE_UPLOADING"; payload: { id: string; progress: number } }
  | { type: "SET_FILE_DONE"; payload: { id: string; url: string } }
  | { type: "SET_FILE_ERROR"; payload: { id: string; errors: string[] } }
  | { type: "SET_FILE_CANCELED"; payload: { id: string } }
  | { type: "RESET" };

export interface UploadState {
  files: FileDescriptor[];
}

export const initialUploadState: UploadState = {
  files: [],
};

export function uploadReducer(
  state: UploadState,
  action: UploadAction
): UploadState {
  switch (action.type) {
    case "ADD_FILES":
      return { ...state, files: [...state.files, ...action.payload] };

    case "REMOVE_FILE":
      return {
        ...state,
        files: state.files.filter((f) => f.id !== action.payload.id),
      };

    case "UPDATE_FILE":
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.payload.id
            ? ({ ...f, ...action.payload.patch } as FileDescriptor)
            : f
        ),
      };

    case "SET_FILE_UPLOADING":
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.payload.id
            ? { ...f, status: "uploading" as const, progress: action.payload.progress }
            : f
        ),
      };

    case "SET_FILE_DONE":
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.payload.id
            ? { ...f, status: "done" as const, url: action.payload.url }
            : f
        ),
      };

    case "SET_FILE_ERROR":
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.payload.id
            ? { ...f, status: "error" as const, errors: action.payload.errors }
            : f
        ),
      };

    case "SET_FILE_CANCELED":
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.payload.id
            ? { ...f, status: "canceled" as const }
            : f
        ),
      };

    case "RESET":
      return initialUploadState;

    default:
      return state;
  }
}
