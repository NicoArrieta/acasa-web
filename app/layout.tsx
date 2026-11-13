import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Acasa Tienda | Muebles y Diseño para el Hogar",
  description: "Diseño que acompaña tu forma de vivir. Fabricación y venta de muebles de calidad superior para cada ambiente de tu hogar. Envíos a todo el país y cuotas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-black selection:text-white">
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
