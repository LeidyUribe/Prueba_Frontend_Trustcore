"use client";

import { useFileDropzone } from "@/hooks";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, MAX_FILES } from "@/utils/file-validation";
import { formatBytes } from "@/utils/format-bytes";

export function FileDropZone() {
  const {
    inputRef,
    isDragging,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onInputChange,
    openFilePicker,
    onKeyDown,
  } = useFileDropzone();

  const accept = ALLOWED_MIME_TYPES.join(",");

  return (
    <div className="dropzone-wrapper">
      <div
        className={`dropzone ${isDragging ? "dropzone--active" : ""}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Zona para arrastrar y soltar archivos. Presiona Enter para seleccionar archivos."
        aria-describedby="dropzone-help"
      >
        <input
          ref={inputRef}
          type="file"
          id="file-input"
          className="dropzone__input"
          multiple
          accept={accept}
          onChange={onInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="dropzone__content">
          <svg
            className="dropzone__icon"
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="dropzone__title">
            Arrastra archivos aquí o{" "}
            <button
              type="button"
              className="dropzone__link"
              onClick={openFilePicker}
            >
              selecciona desde tu dispositivo
            </button>
          </p>
          <p id="dropzone-help" className="dropzone__help">
            PNG, JPEG o PDF · Máx. {formatBytes(MAX_FILE_SIZE)} · Hasta {MAX_FILES} archivos
          </p>
        </div>
      </div>
    </div>
  );
}
