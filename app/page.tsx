// Page d'accueil du portfolio — composant serveur Next.js
// Charge toutes les séries photo depuis le système de fichiers
// puis les transmet en props aux sections clientes de la page.

import dynamic from "next/dynamic"
import { HeroSection } from "@/components/hero-section"
import { SideNav } from "@/components/side-nav"
import { MobileNav } from "@/components/mobile-nav"
import { LazySection } from "@/components/lazy-section"
import { LastProjectSection } from "@/components/last-project-section"
import { getAllSeries } from "@/lib/series-loader"

// Dynamic imports — code-split below-fold sections so they don't block initial paint
const SignalsSection = dynamic(() => import("@/components/signals-section").then(m => ({ default: m.SignalsSection })), { ssr: true })
const WorkSection = dynamic(() => import("@/components/work-section").then(m => ({ default: m.WorkSection })), { ssr: true })
const PortfolioSection = dynamic(() => import("@/components/portfolio-section").then(m => ({ default: m.PortfolioSection })), { ssr: true })
const PrinciplesSection = dynamic(() => import("@/components/principles-section").then(m => ({ default: m.PrinciplesSection })), { ssr: true })
const ContactSection = dynamic(() => import("@/components/contact-section").then(m => ({ default: m.ContactSection })), { ssr: true })
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
  const lastProject = allSeries.find((series) => series.lastProject)
  const remainingSeries = lastProject
    ? allSeries.filter((series) => series.id !== lastProject.id)
    : allSeries

  return (
    <main className="relative min-h-screen">
      <SideNav />
      <MobileNav />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        <HeroSection />
        {lastProject && <LastProjectSection series={lastProject} />}
        <LazySection rootMargin="400px" minHeight="600px" anchorIds={["photographies"]}>
          <SignalsSection series={remainingSeries} />
        </LazySection>
        <LazySection rootMargin="300px" minHeight="500px" anchorIds={["cinema-videos", "autres-projets", "projets-personnels"]}>
          <WorkSection series={remainingSeries} />
        </LazySection>
        <LazySection rootMargin="200px" minHeight="400px" anchorIds={["portfolio"]}>
          <PortfolioSection />
        </LazySection>
        <LazySection rootMargin="200px" minHeight="400px" anchorIds={["cv"]}>
          <PrinciplesSection />
        </LazySection>
        <LazySection rootMargin="200px" minHeight="300px" anchorIds={["contact"]}>
          <ContactSection />
        </LazySection>
        <LazySection rootMargin="200px" minHeight="300px" anchorIds={["informations"]}>
          <ColophonSection />
        </LazySection>
      </div>
    </main>
  )
}

