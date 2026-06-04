"use client";

import { useUploadContext } from "@/hooks";

export function UploadStats() {
  const { counts } = useUploadContext();

  return (
    <div className="upload-stats" aria-label="Estadísticas de archivos">
      <div className="upload-stats__item">
        <span className="upload-stats__value">{counts.pending}</span>
        <span className="upload-stats__label">Pendientes</span>
      </div>
      <div className="upload-stats__item">
        <span className="upload-stats__value">{counts.uploading}</span>
        <span className="upload-stats__label">Subiendo</span>
      </div>
      <div className="upload-stats__item">
        <span className="upload-stats__value">{counts.done}</span>
        <span className="upload-stats__label">Completados</span>
      </div>
      {counts.error > 0 && (
        <div className="upload-stats__item upload-stats__item--error">
          <span className="upload-stats__value">{counts.error}</span>
          <span className="upload-stats__label">Con error</span>
        </div>
      )}
    </div>
  );
}
