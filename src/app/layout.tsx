import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Salon Yoe — Reserva tu hora online",
    template: "%s | Salon Yoe",
  },
  description:
    "Reserva tu hora en Salon Yoe. Tratamientos capilares, depilación y más. Agenda online rápida con pago de abono seguro.",
  keywords: ["salon", "peluqueria", "tratamientos capilares", "depilacion", "reservas online", "Chile"],
  authors: [{ name: "Salon Yoe" }],
  creator: "Salon Yoe",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: APP_URL,
    siteName: "Salon Yoe",
    title: "Salon Yoe — Reserva tu hora online",
    description: "Reserva tu hora en Salon Yoe. Tratamientos capilares, depilación y más.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salon Yoe — Reserva tu hora online",
    description: "Reserva tu hora en Salon Yoe. Tratamientos capilares, depilación y más.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
