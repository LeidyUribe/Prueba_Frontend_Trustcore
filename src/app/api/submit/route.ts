import { NextResponse } from "next/server";
import type { SubmitPayload } from "@/types";

export async function POST(request: Request) {
  let body: SubmitPayload;

  try {
    body = (await request.json()) as SubmitPayload;
  } catch {
    return NextResponse.json(
      { message: "Payload JSON inválido" },
      { status: 400 }
    );
  }

  if (!body.title?.trim() || body.title.trim().length < 10) {
    return NextResponse.json(
      { message: "Título inválido: mínimo 10 caracteres" },
      { status: 400 }
    );
  }

  if (!body.description?.trim() || body.description.trim().length < 10) {
    return NextResponse.json(
      { message: "Descripción inválida: mínimo 10 caracteres" },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.files) || body.files.length === 0) {
    return NextResponse.json(
      { message: "Se requiere al menos un archivo completado" },
      { status: 400 }
    );
  }

  const invalidFile = body.files.find(
    (f) => !f.id || !f.url || !f.name || !f.type
  );

  if (invalidFile) {
    return NextResponse.json(
      { message: "Uno o más archivos tienen datos incompletos" },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 800));

  return NextResponse.json({
    success: true,
    message: "Formulario recibido correctamente",
    receivedFiles: body.files.length,
  });
}
