import * as Yup from "yup";
import { MAX_FILES, MIN_FILES } from "@/utils/file-validation";

export const uploadFormSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required("El título es obligatorio")
    .min(10, "El título debe tener al menos 10 caracteres"),
  description: Yup.string()
    .trim()
    .required("La descripción es obligatoria")
    .min(10, "La descripción debe tener al menos 10 caracteres"),
});

export type UploadFormValues = Yup.InferType<typeof uploadFormSchema>;

export const fileCollectionSchema = Yup.array()
  .min(MIN_FILES, `Debes subir al menos ${MIN_FILES} archivo`)
  .max(MAX_FILES, `Máximo ${MAX_FILES} archivos permitidos`);
