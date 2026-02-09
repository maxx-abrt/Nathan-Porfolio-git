// Page d'accueil du portfolio — composant serveur Next.js
// Charge toutes les séries photo depuis le système de fichiers
// puis les transmet en props aux sections clientes de la page.

import { HeroSection } from "@/components/hero-section"
import { SignalsSection } from "@/components/signals-section"
import { WorkSection } from "@/components/work-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { PrinciplesSection } from "@/components/principles-section"
import { ColophonSection } from "@/components/colophon-section"
import { SideNav } from "@/components/side-nav"
import { MobileNav } from "@/components/mobile-nav"
import { getAllSeries } from "@/lib/series-loader"

// Composant principal de la page d'accueil
// Récupère toutes les séries photo côté serveur puis assemble les sections :
// - SideNav : navigation latérale fixe avec indicateur de section active
// - grid-bg : fond décoratif en grille, fixe derrière le contenu
// - HeroSection : section d'accroche avec le nom et animation split-flap
// - SignalsSection : carrousel horizontal des séries récentes
// - WorkSection : grille complète de tous les projets
// - PrinciplesSection : parcours et expériences professionnelles
// - ColophonSection : informations de contact et crédits
export default function Page() {
  const allSeries = getAllSeries()

  return (
    <main className="relative min-h-screen">
      <SideNav />
      <MobileNav />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        <HeroSection />
        <SignalsSection series={allSeries} />
        <WorkSection series={allSeries} />
        <PortfolioSection />
        <PrinciplesSection />
        <ColophonSection />
      </div>
    </main>
  )
}

