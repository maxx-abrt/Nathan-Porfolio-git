// Page dynamique d'une série photo — composant serveur Next.js
// Route : /series/[...slug] — le slug correspond au chemin du dossier dans public/series/
// Charge les données de la série côté serveur et les passe au composant client.

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getSeriesBySlug, getAllSeries } from "@/lib/series-loader"
import SeriesPageClient from "@/components/series-page-client"

// Force static rendering for output: export compatibility
export const dynamic = "force-static"

// Génération statique des paramètres de route (SSG)
// Pré-génère une page pour chaque série trouvée dans le système de fichiers
export function generateStaticParams() {
  const allSeries = getAllSeries()
  // Retourner les segments bruts : Next.js encode déjà les chemins pour output: export
  return allSeries.map((s) => ({
    slug: s.slug.split("/")
  }))
}

// Génération dynamique des métadonnées SEO pour chaque série
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  // Décoder les segments encodés par generateStaticParams
  const slugPath = slug.map((s) => decodeURIComponent(s)).join("/")
  const seriesData = getSeriesBySlug(slugPath)
  if (!seriesData) return {}

  return {
    title: `${seriesData.title} — Nathan Dumont`,
    description: seriesData.description,
    openGraph: {
      title: `${seriesData.title} — Nathan Dumont`,
      description: seriesData.description,
      type: "article",
    },
  }
}

// Composant serveur asynchrone de la page série
// Récupère le slug depuis les paramètres de route, charge la série correspondante,
// et redirige vers une 404 si la série n'existe pas
export default async function SeriesPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const slugPath = slug.map((segment) => decodeURIComponent(segment)).join("/")
  const allSeries = getAllSeries()
  const seriesData = getSeriesBySlug(slugPath)

  if (!seriesData) {
    notFound()
  }

  return <SeriesPageClient seriesData={seriesData} allSeries={allSeries} />
}
