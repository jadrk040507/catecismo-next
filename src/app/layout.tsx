import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MagisteriumChat from "@/components/MagisteriumChat";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Proyecto Catecismo",
    template: "%s — Proyecto Catecismo",
  },
  description: "Un catecismo vivo, accesible y gratuito. Catequesis católica gratuita, clara y profunda para todas las edades.",
  keywords: ["catecismo", "iglesia católica", "catequesis", "fe", "sacramentos", "oración"],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Proyecto Catecismo",
    title: "Proyecto Catecismo — Catecismo Digital",
    description: "Un catecismo vivo, accesible y gratuito para todas las edades.",
    url: "https://catecismo.kipadmon.com",
  },
  metadataBase: new URL("https://catecismo.kipadmon.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans min-h-screen flex flex-col bg-neutral text-primary">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <MagisteriumChat />
        </AuthProvider>
      </body>
    </html>
  );
}
