// Layout racine de l'application Next.js
// Ce fichier définit la structure HTML globale, les polices, les métadonnées SEO,
// et enveloppe toute l'application avec les fournisseurs de thème et de défilement fluide.

import type React from "react"
import type { Metadata } from "next"
import { Archivo, Archivo_Black, Archivo_Narrow } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SmoothScroll } from "@/components/smooth-scroll"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

// Archivo font family - gras pour titres, courant pour texte, fin pour descriptions
const archivo = Archivo({
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-archivo",
})
const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
})
const archivoNarrow = Archivo_Narrow({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-archivo-narrow",
})

// Métadonnées SEO de la page (titre et description pour les moteurs de recherche)
export const metadata: Metadata = {
  title: "Nathan Dumont — Photographe & Vidéaste",
  description:
    "Portfolio de Nathan Dumont, photographe et vidéaste, étudiant à l'ENSAD de Dijon. Photographie artistique, studio et reportage.",
  keywords: ["Nathan Dumont", "photographe", "vidéaste", "ENSAD", "Dijon", "portfolio", "photographie artistique", "studio"],
  authors: [{ name: "Nathan Dumont" }],
  creator: "Nathan Dumont",
  metadataBase: new URL("https://nathandumont.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "Nathan Dumont — Photographe & Vidéaste",
    description: "Portfolio de Nathan Dumont, photographe et vidéaste, étudiant à l'ENSAD de Dijon.",
    siteName: "Nathan Dumont",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nathan Dumont — Photographe & Vidéaste",
    description: "Portfolio de Nathan Dumont, photographe et vidéaste, étudiant à l'ENSAD de Dijon.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Composant layout racine qui enveloppe toutes les pages
// Structure : html > body > ThemeProvider > SmoothScroll > contenu des pages
// - ThemeProvider : gestion du thème clair/sombre via next-themes
// - noise-overlay : couche de bruit visuel décoratif en superposition
// - SmoothScroll : défilement fluide via la librairie Lenis
// - Analytics : suivi Vercel Analytics
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Nathan Dumont",
              jobTitle: "Photographe & Vidéaste",
              affiliation: {
                "@type": "EducationalOrganization",
                name: "ENSAD Dijon",
              },
              url: "https://nathandumont.fr",
              sameAs: [],
            }),
          }}
        />
      </head>
      <body
        className={`${archivo.variable} ${archivoBlack.variable} ${archivoNarrow.variable} font-sans antialiased overflow-x-hidden`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="noise-overlay" aria-hidden="true" />
          <SmoothScroll>{children}</SmoothScroll>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
