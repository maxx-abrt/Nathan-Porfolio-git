// Page d'accueil du portfolio — composant serveur Next.js
// Charge toutes les séries photo depuis le système de fichiers
// puis les transmet en props aux sections clientes de la page.

import dynamic from "next/dynamic"
import { HeroSection } from "@/components/hero-section"
import { SideNav } from "@/components/side-nav"
import { MobileNav } from "@/components/mobile-nav"
import { LazySection } from "@/components/lazy-section"
import { getAllSeries } from "@/lib/series-loader"

// Dynamic imports — code-split below-fold sections so they don't block initial paint
const SignalsSection = dynamic(() => import("@/components/signals-section").then(m => ({ default: m.SignalsSection })), { ssr: true })
const WorkSection = dynamic(() => import("@/components/work-section").then(m => ({ default: m.WorkSection })), { ssr: true })
const PortfolioSection = dynamic(() => import("@/components/portfolio-section").then(m => ({ default: m.PortfolioSection })), { ssr: true })
const PrinciplesSection = dynamic(() => import("@/components/principles-section").then(m => ({ default: m.PrinciplesSection })), { ssr: true })
const ColophonSection = dynamic(() => import("@/components/colophon-section").then(m => ({ default: m.ColophonSection })), { ssr: true })

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
        <LazySection rootMargin="400px" minHeight="600px">
          <SignalsSection series={allSeries} />
        </LazySection>
        <LazySection rootMargin="300px" minHeight="500px">
          <WorkSection series={allSeries} />
        </LazySection>
        <LazySection rootMargin="200px" minHeight="400px">
          <PortfolioSection />
        </LazySection>
        <LazySection rootMargin="200px" minHeight="400px">
          <PrinciplesSection />
        </LazySection>
        <LazySection rootMargin="200px" minHeight="300px">
          <ColophonSection />
        </LazySection>
      </div>
    </main>
  )
}

