"use client";

import type { FileDescriptor } from "@/types";
import { formatBytes } from "@/utils/format-bytes";
import { getStatusLabel } from "@/store";
import { ProgressBar, isUploading } from "./ProgressBar";
import { useUploadContext } from "@/hooks";

interface FileListItemProps {
  file: FileDescriptor;
}

export function FileListItem({ file }: FileListItemProps) {
  const { removeFile, cancelFile, retryFile } = useUploadContext();

  const canCancel = file.status === "uploading";
  const canRetry = file.status === "error" || file.status === "canceled";
  const canRemove = file.status !== "uploading";

  return (
    <li className={`file-item file-item--${file.status}`}>
      <div className="file-item__header">
        <span className="file-item__name" title={file.name}>
          {file.name}
        </span>
        <span className={`file-item__status file-item__status--${file.status}`}>
          {getStatusLabel(file.status)}
        </span>
      </div>

      <dl className="file-item__meta">
        <div>
          <dt>Tamaño</dt>
          <dd>{formatBytes(file.size)}</dd>
        </div>
        <div>
          <dt>Tipo</dt>
          <dd>{file.mimeType || "desconocido"}</dd>
        </div>
      </dl>

      {isUploading(file) && (
        <ProgressBar progress={file.progress} label={`Progreso de ${file.name}`} />
      )}

      {file.status === "error" && (
        <ul className="file-item__errors" role="alert">
          {file.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div className="file-item__actions">
        {canCancel && (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => cancelFile(file.id)}
            aria-label={`Cancelar subida de ${file.name}`}
          >
            Cancelar
          </button>
        )}
        {canRetry && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => retryFile(file.id)}
            aria-label={`Reintentar subida de ${file.name}`}
          >
            Reintentar
          </button>
        )}
        {canRemove && (
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={() => removeFile(file.id)}
            aria-label={`Eliminar ${file.name}`}
          >
            Eliminar
          </button>
        )}
      </div>
    </li>
  );
}
