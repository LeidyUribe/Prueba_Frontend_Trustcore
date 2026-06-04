import type { Metadata } from "next";
import { UploadProvider } from "@/hooks";
import { UploadForm } from "@/components";
import "./upload.css";

export const metadata: Metadata = {
  title: "Subir documentos | Trustcore",
  description: "Formulario de carga de archivos con validación y progreso individual",
};

export default function UploadPage() {
  return (
    <UploadProvider>
      <main className="upload-page">
        <header className="upload-page__header">
          <h1 className="upload-page__title">Carga de documentos</h1>
          <p className="upload-page__subtitle">
            Completa la información y sube entre 1 y 10 archivos (PNG, JPEG o PDF, máx. 5 MB).
          </p>
        </header>
        <UploadForm />
      </main>
    </UploadProvider>
  );
}
