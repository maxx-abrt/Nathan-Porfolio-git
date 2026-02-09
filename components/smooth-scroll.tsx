// Composant de défilement fluide (smooth scroll) utilisant Lenis
// Enveloppe les enfants et active un défilement lissé sur toute l'application
// Synchronise Lenis avec GSAP ScrollTrigger pour que les animations au scroll fonctionnent correctement

"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  // Initialisation de Lenis au montage du composant
  useEffect(() => {
    // Configuration de Lenis : durée, courbe d'aisé, orientation verticale
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    })

    lenisRef.current = lenis

    // Connexion de Lenis à GSAP ScrollTrigger pour synchroniser les animations
    lenis.on("scroll", ScrollTrigger.update)

    // Ajout de Lenis au ticker GSAP pour un rafraîchissement continu
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    // Désactivation du lissage de latence GSAP (Lenis gère déjà le lissage)
    gsap.ticker.lagSmoothing(0)

    // Nettoyage à la destruction du composant
    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf)
    }
  }, [])

  return <>{children}</>
}
