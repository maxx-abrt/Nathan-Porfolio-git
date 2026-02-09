// Composant de défilement fluide (smooth scroll) utilisant Lenis
// Enveloppe les enfants et active un défilement lissé sur toute l'application
// Synchronise Lenis avec GSAP ScrollTrigger pour que les animations au scroll fonctionnent correctement

"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile/touch devices
    const checkMobile = () => {
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 
                           'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0
      setIsMobile(isTouchDevice)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return // Skip Lenis on mobile for better performance

    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      autoResize: true,
    })

    lenisRef.current = lenis

    lenis.on("scroll", ScrollTrigger.update)

    // Use GSAP ticker instead of separate RAF — avoids double RAF loop overhead
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(lenis.raf as any)
      lenis.destroy()
    }
  }, [isMobile])

  return <>{children}</>
}
