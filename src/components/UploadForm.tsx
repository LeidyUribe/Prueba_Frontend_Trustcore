"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import { uploadFormSchema, type UploadFormValues } from "@/schemas/upload-form.schema";
import { useUploadContext } from "@/hooks";
import { submitForm } from "@/services/upload.service";
import { FileDropZone } from "./FileDropZone";
import { FileList } from "./FileList";
import { UploadStats } from "./UploadStats";
import { MIN_FILES } from "@/utils/file-validation";

const initialValues: UploadFormValues = {
  title: "",
  description: "",
};

export function UploadForm() {
  const { files, counts, canSubmitFiles, isUploading, globalErrors } =
    useUploadContext();
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isFormDisabled = isUploading;
  const hasMinFiles = files.length >= MIN_FILES;
  const allDone = canSubmitFiles;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={uploadFormSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        setSubmitStatus(null);

        if (!allDone) {
          setSubmitStatus({
            type: "error",
            message: "Todos los archivos deben estar completados antes de enviar.",
          });
          setSubmitting(false);
          return;
        }

        try {
          await submitForm({
            title: values.title,
            description: values.description,
            files: files
              .filter((f) => f.status === "done")
              .map((f) => ({
                id: f.id,
                name: f.name,
                size: f.size,
                type: f.mimeType,
                url: f.url!,
              })),
          });

          setSubmitStatus({
            type: "success",
            message: "Formulario enviado correctamente.",
          });
          resetForm();
        } catch (error) {
          setSubmitStatus({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "Error al enviar el formulario",
          });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, isValid, dirty }) => {
        const submitDisabled =
          isSubmitting ||
          isFormDisabled ||
          !isValid ||
          !dirty ||
          !hasMinFiles ||
          !allDone;

        return (
          <Form className="upload-form" noValidate>
            <div className="upload-form__grid">
              <section className="upload-form__section" aria-labelledby="form-fields-heading">
                <h2 id="form-fields-heading" className="upload-form__heading">
                  Información del documento
                </h2>

                <div className="form-field">
                  <label htmlFor="title" className="form-field__label">
                    Título <span aria-hidden="true">*</span>
                  </label>
                  <Field
                    id="title"
                    name="title"
                    type="text"
                    className="form-field__input"
                    placeholder="Ej: Documentación del proyecto Q1"
                    aria-required="true"
                    aria-describedby="title-error"
                    disabled={isFormDisabled}
                  />
                  <ErrorMessage name="title">
                    {(msg) => (
                      <p className="form-field__error" id="title-error" role="alert">
                        {msg}
                      </p>
                    )}
                  </ErrorMessage>
                </div>

                <div className="form-field">
                  <label htmlFor="description" className="form-field__label">
                    Descripción <span aria-hidden="true">*</span>
                  </label>
                  <Field
                    id="description"
                    name="description"
                    as="textarea"
                    rows={4}
                    className="form-field__input form-field__textarea"
                    placeholder="Describe el contenido de los archivos..."
                    aria-required="true"
                    aria-describedby="description-error"
                    disabled={isFormDisabled}
                  />
                  <ErrorMessage name="description">
                    {(msg) => (
                      <p className="form-field__error" id="description-error" role="alert">
                        {msg}
                      </p>
                    )}
                  </ErrorMessage>
                </div>
              </section>

              <section className="upload-form__section" aria-labelledby="upload-heading">
                <h2 id="upload-heading" className="upload-form__heading">
                  Archivos
                </h2>

                <UploadStats />

                <FileDropZone />

                {globalErrors.length > 0 && (
                  <div className="alert alert--error" role="alert" aria-live="polite">
                    <ul>
                      {globalErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <FileList />

                {files.length > 0 && files.length < MIN_FILES && (
                  <p className="form-field__error" role="alert">
                    Debes subir al menos {MIN_FILES} archivo.
                  </p>
                )}
              </section>
            </div>

            <div
              className="upload-form__footer"
              aria-live="polite"
              aria-atomic="true"
            >
              {submitStatus && (
                <div
                  className={`alert alert--${submitStatus.type}`}
                  role="status"
                >
                  {submitStatus.message}
                </div>
              )}

              <div className="upload-form__summary">
                <span>
                  {counts.done} de {counts.total} archivos completados
                </span>
                {isUploading && (
                  <span className="upload-form__uploading-badge">
                    Subiendo archivos...
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--lg"
                disabled={submitDisabled}
                aria-disabled={submitDisabled}
                aria-describedby="submit-help"
              >
                {isSubmitting ? "Enviando..." : "Enviar formulario"}
              </button>
              <p id="submit-help" className="sr-only">
                El botón se habilita cuando el formulario es válido, hay al menos un
                archivo y todos están completados sin subidas activas.
              </p>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
