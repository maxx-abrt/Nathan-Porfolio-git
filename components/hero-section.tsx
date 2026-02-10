// Section héro (première section visible) du portfolio
// Affiche le nom "NATHAN" en animation split-flap, le sous-titre, un paragraphe d'introduction,
// les boutons de navigation, le toggle de thème et un bruit de fond animé.
// Le contenu disparaît en parallaxe lors du défilement vers le bas.

"use client"

import { useEffect, useRef } from "react"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { getAssetUrl } from "@/lib/asset-url"
import { SplitFlapText, SplitFlapMuteToggle, SplitFlapAudioProvider } from "@/components/split-flap-text"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { ThemeToggle } from "@/components/theme-toggle"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Animation parallaxe : le contenu monte et disparaît progressivement au scroll
  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        y: -100,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Structure : section plein écran avec labels verticaux, contenu principal et tag flottant
  return (
    <section ref={sectionRef} id="hero" className="relative min-h-screen flex items-center pl-4 sm:pl-6 md:pl-28 pr-4 sm:pr-6 md:pr-12 overflow-hidden">

      {/* Label vertical gauche avec le nom abrégé */}
      <div className="absolute left-4 md:left-6 top-[15%]">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
          N. DUMONT
        </span>
      </div>

      {/* Bouton de basculement du thème clair/sombre en haut à droite */}
      <div className="absolute top-6 right-6 md:top-8 md:right-12 z-20">
        <ThemeToggle />
      </div>

      {/* Contenu principal : nom en split-flap, sous-titre, description et boutons d'action */}
      <div ref={contentRef} className="flex-1 w-full will-change-transform">
        <SplitFlapAudioProvider>
          <div className="relative">
            {/* Desktop: Single line */}
            <div className="hidden md:block">
              <SplitFlapText text="NATHAN DUMONT" speed={80} size="clamp(3.5rem, 10vw, 10rem)" />
            </div>
            {/* Mobile: Stacked with offset */}
            <div className="md:hidden flex flex-col">
              <SplitFlapText text="NATHAN" speed={80} size="clamp(3.5rem, 10vw, 10rem)" />
              <div className="mt-1 ml-[3vw]">
                <SplitFlapText text="DUMONT" speed={80} size="clamp(3.5rem, 10vw, 10rem)" />
              </div>
            </div>
            <div className="mt-4">
              <SplitFlapMuteToggle />
            </div>
          </div>
        </SplitFlapAudioProvider>

        <h2 className="font-[var(--font-bebas)] text-muted-foreground text-[clamp(1rem,3vw,2rem)] mt-4 tracking-wide">
          Étudiant 
        </h2>
        <h2 className="font-[var(--font-bebas)] text-muted-foreground text-[clamp(1rem,3vw,1rem)] mt-4 tracking-wide">
          Photographie, Cinéma et vidéo
        </h2>

        <p className="mt-12 max-w-md font-mono text-sm text-muted-foreground leading-relaxed">
          Étudiant en étude supérieure né le 06 mai 2005. Je suis passionné par la photographie, le cinéma et la vidéo. 
        </p>

        <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          <a
            href="#photographies"
            className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            <ScrambleTextOnHover text="Voir les projets" as="span" duration={0.6} />
            <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
          </a>
          <a
            href="#cinema-videos"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Cinéma/vidéos
          </a>
          <a
            href={getAssetUrl("/CV.pdf")}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            <ScrambleTextOnHover text="Mon CV →" as="span" duration={0.6} />
          </a>
        </div>
        {/* Logiciels maîtrisés - sleek compact bar */}
        <div className="mt-12 pt-8 border-t border-border/20">
          <div className="flex flex-wrap items-center gap-6 md:gap-8">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Logiciels Maîtrisés</span>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              {/* Affinity */}
              <div className="group flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 9l3 6l3-6" />
                  <path d="M10 12h4" />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Affinity</span>
              </div>

              {/* Canva */}
              <div className="group flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="6" width="6" height="12" rx="1" />
                  <rect x="14" y="4" width="6" height="8" rx="1" />
                  <rect x="14" y="14" width="6" height="6" rx="1" />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Canva</span>
              </div>

              {/* Davinci */}
              <div className="group flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="6" width="12" height="12" />
                  <path d="M9 9h2v6H9z" />
                  <path d="M13 9h2v6h-2z" />
                  <circle cx="12" cy="18" r="1.5" />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Davinci</span>
              </div>

              {/* Photoshop */}
              <div className="group flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7 17V7h4c2 0 3 1 3 3s-1 3-3 3H9" />
                  <circle cx="16" cy="13" r="1.5" />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Adobe</span>
              </div>

              {/* Procreate */}
              <div className="group flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 6v6l-8 6l-8-6V9l8-6z" />
                  <path d="M12 15c1.66 0 3-1.34 3-3s-1.34-3-3-3" />
                  <path d="M12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3" />
                  <path d="M12 9v12" />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Procreate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Étiquette flottante décorative en bas à droite */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
        <a
            href="#portfolio"
            className="border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            Portfolio / 2026
          </a>
      </div>
    </section>
  )
}
