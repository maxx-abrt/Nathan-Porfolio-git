// Composant de bruit visuel animé sur canvas
// Génère un effet de grain/bruit en temps réel via un canvas HTML5
// Utilisé comme couche décorative superposée aux sections (mode overlay)

"use client"

import { useEffect, useRef } from "react"

// Props du composant : opacité du bruit et classe CSS additionnelle
interface AnimatedNoiseProps {
  opacity?: number
  className?: string
}

export function AnimatedNoise({ opacity = 0.05, className }: AnimatedNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Effet principal : initialise le canvas et lance la boucle d'animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let frame = 0

    // Redimensionne le canvas à la moitié de sa taille affichée (optimisation performance)
    const resize = () => {
      canvas.width = canvas.offsetWidth / 2
      canvas.height = canvas.offsetHeight / 2
    }

    // Génère une image de bruit aléatoire pixel par pixel en niveaux de gris
    const generateNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = 255
      }

      ctx.putImageData(imageData, 0, 0)
    }

    // Boucle d'animation : rafraîchit le bruit toutes les 2 frames pour un bon compromis performance/fluidité
    const animate = () => {
      frame++
      if (frame % 2 === 0) {
        generateNoise()
      }
      animationId = requestAnimationFrame(animate)
    }

    // Initialisation et écoute du redimensionnement
    resize()
    window.addEventListener("resize", resize)
    animate()

    // Nettoyage à la destruction du composant
    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
        mixBlendMode: "overlay",
      }}
    />
  )
}
