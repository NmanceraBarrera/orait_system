import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppBar from "@/components/layout/AppBar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import logoImage from "@/app/assets/logo.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORait System - ORAIT S.A.S. | Rescate Acuático y Salvavidas",
  description: "Sistema de gestión para rescatistas acuáticos y supervisores de ORAIT S.A.S. - Salvavidas profesionales para piscinas y estanques",
  icons: {
    icon: logoImage.src,
    apple: logoImage.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppBar />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
