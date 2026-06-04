import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trustcore Upload",
  description: "Prueba técnica — Sistema de carga de archivos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
