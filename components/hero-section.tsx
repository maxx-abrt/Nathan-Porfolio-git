// Section héro (première section visible) du portfolio
// Affiche le nom "NATHAN" en animation split-flap, le sous-titre, un paragraphe d'introduction,
// les boutons de navigation, le toggle de thème et un bruit de fond animé.
// Le contenu disparaît en parallaxe lors du défilement vers le bas.

"use client"

import { useEffect, useRef } from "react"
import { ScrambleTextOnHover } from "@/components/scramble-text"
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
      <div ref={contentRef} className="flex-1 w-full">
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
            href="/CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            <ScrambleTextOnHover text="Mon CV →" as="span" duration={0.6} />
          </a>
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
