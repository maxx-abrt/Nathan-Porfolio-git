// Section Colophon / Contact du portfolio
// Affiche les informations de contact, formation, typographie, localisation et crédits
// Animations GSAP au défilement : glissement du titre, apparition en cascade de la grille, fondu du footer

"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Enregistrement du plugin ScrollTrigger pour les animations déclenchées au scroll
gsap.registerPlugin(ScrollTrigger)

export function ColophonSection() {
  // Références DOM pour cibler les éléments à animer
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  // Initialisation des animations GSAP au montage du composant
  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Animation du titre : glissement depuis la gauche avec fondu
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          x: -60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        })
      }

      // Animation des colonnes de la grille : montée avec décalage progressif entre chaque colonne
      if (gridRef.current) {
        const columns = gridRef.current.querySelectorAll(":scope > div")
        gsap.from(columns, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        })
      }

      // Animation du pied de page : fondu avec légère montée
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 95%",
            toggleActions: "play none none none",
          },
        })
      }
    }, sectionRef)

    // Nettoyage des animations à la destruction du composant
    return () => ctx.revert()
  }, [])

  // Rendu de la section avec grille multi-colonnes responsive
  return (
    <section
      ref={sectionRef}
      id="informations"
      className="relative py-20 sm:py-32 pl-4 sm:pl-6 md:pl-28 pr-4 sm:pr-6 md:pr-12 border-t border-border/30"
    >
      {/* En-tête de la section avec numéro et titre */}
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">08 / Informations</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-4xl sm:text-5xl md:text-7xl tracking-tight">INFORMATIONS</h2>
      </div>

      {/* Grille multi-colonnes responsive : 2 cols mobile, 4 tablette, 6 desktop */}
      <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12">
        {/* À propos */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">À propos</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Nathan Dumont</li>
            <li className="font-mono text-xs text-foreground/80">Étudiant, Année 2</li>
          </ul>
        </div>

        {/* Formation */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Formation</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">ENSAD (Dijon)</li>
            <li className="font-mono text-xs text-foreground/80">Art & Design d'espace</li>
          </ul>
        </div>

        {/* Typographie */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Typographie</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Archivo Black</li>
            <li className="font-mono text-xs text-foreground/80">Archivo Courant</li>
            <li className="font-mono text-xs text-foreground/80">Archivo Light</li>
          </ul>
        </div>

        {/* Localisation */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Localisation</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Dijon, France</li>
            <li className="font-mono text-xs text-foreground/80">ENSAD</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Contact</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="mailto:nathan.dumont@ensa-dijon.fr"
                className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors duration-200"
              >
                Email
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/n_athandmt/"
                className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors duration-200"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>

        {/* Année */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Année</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">2026</li>
            <li className="font-mono text-xs text-foreground/80">En cours</li>
          </ul>
        </div>
      </div>

      {/* Barre de copyright et crédits en bas de page */}
      <div
        ref={footerRef}
        className="mt-24 pt-8 border-t border-border/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          © 2026 Nathan Dumont. Tous droits réservés.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">Conçu avec 🖤 par Max Aubert</p>
      </div>
    </section>
  )
}
