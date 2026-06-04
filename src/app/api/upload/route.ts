import { NextResponse } from "next/server";

const FAILURE_RATE = 0.2;
const MIN_DELAY_MS = 500;
const MAX_DELAY_MS = 1500;

/**
 * Simulates a file upload endpoint with:
 * - Random latency (500–1500ms) to mimic network variance
 * - 20% failure rate to test retry/backoff logic
 */
export async function POST(request: Request) {
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  await new Promise((resolve) => setTimeout(resolve, delay));

  const shouldFail = Math.random() < FAILURE_RATE;

  if (shouldFail) {
    return NextResponse.json(
      { message: "Error simulado del servidor (20% probabilidad)" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  const fileName =
    file instanceof File ? file.name : "unknown";

  return NextResponse.json({
    id: crypto.randomUUID(),
    url: `https://cdn.example.com/uploads/${Date.now()}-${fileName}`,
  });
}
