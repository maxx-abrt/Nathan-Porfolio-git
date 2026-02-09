// Composant de texte avec effet de surlignage animé au scroll
// Au défilement, un fond coloré (accent) s'étend de gauche à droite derrière le texte,
// puis la couleur du texte change. Un léger effet parallaxe est aussi appliqué.

"use client"

import { useRef, useEffect, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Props : contenu enfant, classe CSS, vitesse de l'effet parallaxe
interface HighlightTextProps {
  children: ReactNode
  className?: string
  parallaxSpeed?: number
}

export function HighlightText({ children, className = "", parallaxSpeed = 0.3 }: HighlightTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  // Initialisation des animations GSAP liées au scroll
  useEffect(() => {
    if (!containerRef.current || !highlightRef.current || !textRef.current) return

    const ctx = gsap.context(() => {
      // Timeline d'animation déclenchée à l'apparition dans le viewport
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "top -20%",
          toggleActions: "play reverse play reverse",
        },
      })

      // Extension du fond coloré de gauche à droite (scaleX de 0 à 1)
      tl.fromTo(
        highlightRef.current,
        {
          scaleX: 0,
          transformOrigin: "left center",
        },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power3.out",
        },
      )

      // Changement de la couleur du texte après l'apparition du surlignage (décalé de 0.5s)
      tl.fromTo(
        textRef.current,
        {
          color: "var(--foreground)",
        },
        {
          color: "var(--accent-foreground)",
          duration: 0.6,
          ease: "power2.out",
        },
        0.5,
      )

      // Effet parallaxe : le fond se déplace verticalement lors du scroll
      gsap.to(highlightRef.current, {
        yPercent: -20 * parallaxSpeed,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [parallaxSpeed])

  return (
    <span ref={containerRef} className={`relative inline-block ${className}`}>
      <span
        ref={highlightRef}
        className="absolute inset-0 bg-accent"
        style={{
          left: "-0.1em",
          right: "-0.1em",
          top: "0.15em",
          bottom: "0.1em",
          transform: "scaleX(0)",
          transformOrigin: "left center",
        }}
      />
      <span ref={textRef} className="relative z-10">
        {children}
      </span>
    </span>
  )
}
