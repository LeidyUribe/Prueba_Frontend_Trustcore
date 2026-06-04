"use client";

import { useUploadContext } from "@/hooks";
import { FileListItem } from "./FileListItem";

export function FileList() {
  const { files } = useUploadContext();

  if (files.length === 0) {
    return (
      <p className="file-list__empty" role="status">
        No hay archivos seleccionados. Arrastra archivos o usa el botón de selección.
      </p>
    );
  }

  return (
    <ul className="file-list" aria-label="Lista de archivos">
      {files.map((file) => (
        <FileListItem key={file.id} file={file} />
      ))}
    </ul>
  );
}
