// Composant d'animation de texte style "ticker" / panneau d'affichage
// Chaque caractère défile aléatoirement parmi des glyphes avant de se fixer sur la lettre finale
// L'animation se rejoue au survol de la souris
// Utilise GSAP pour le timing des délais entre chaque caractère

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"

// Props : texte à afficher, durée de flip par caractère, délai initial, décalage entre lettres
interface DrawTextProps {
  text: string
  className?: string
  duration?: number
  delay?: number
  stagger?: number
}

export function DrawText({ text, className = "", duration = 0.08, delay = 0.5, stagger = 0.08 }: DrawTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // État des caractères affichés à l'écran (vide au départ)
  const [displayChars, setDisplayChars] = useState<string[]>(text.split("").map(() => ""))
  // Indices des caractères qui ont atteint leur valeur finale (fond gris)
  const [activeIndices, setActiveIndices] = useState<boolean[]>(text.split("").map(() => false))
  // Indices des caractères en cours de défilement (texte gris)
  const [flippingIndices, setFlippingIndices] = useState<boolean[]>(text.split("").map(() => false))
  // Empêche l'animation d'entrée de se rejouer automatiquement
  const [hasAnimated, setHasAnimated] = useState(false)
  // Stockage des intervalles pour nettoyage propre
  const intervalsRef = useRef<NodeJS.Timeout[]>([])

  const characters = text.split("")
  // Jeu de caractères utilisés pour l'effet de défilement aléatoire
  const flipChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-+#@$%"

  // Fonction principale d'animation : fait défiler chaque caractère avec un décalage progressif
  const runTickerAnimation = useCallback(
    (animationDelay = 0) => {
      // Nettoyage des intervalles existants
      intervalsRef.current.forEach(clearInterval)
      intervalsRef.current = []

      // Réinitialisation de tous les états
      setDisplayChars(text.split("").map(() => ""))
      setActiveIndices(text.split("").map(() => false))
      setFlippingIndices(text.split("").map(() => false))

      // Pour chaque caractère, lance l'animation avec un délai croissant
      characters.forEach((targetChar, index) => {
        const letterDelay = animationDelay + index * stagger

        // Délai GSAP avant de commencer le défilement de ce caractère
        gsap.delayedCall(letterDelay, () => {
          setFlippingIndices((prev) => {
            const next = [...prev]
            next[index] = true
            return next
          })

          // Nombre aléatoire de rotations avant de se fixer (8 à 13)
          let flipCount = 0
          const maxFlips = 8 + Math.floor(Math.random() * 6)

          const flipInterval = setInterval(() => {
            flipCount++

            if (flipCount >= maxFlips) {
              clearInterval(flipInterval)
              setDisplayChars((prev) => {
                const next = [...prev]
                next[index] = targetChar
                return next
              })
              setActiveIndices((prev) => {
                const next = [...prev]
                next[index] = true
                return next
              })
              setFlippingIndices((prev) => {
                const next = [...prev]
                next[index] = false
                return next
              })
            } else {
              setDisplayChars((prev) => {
                const next = [...prev]
                next[index] = flipChars[Math.floor(Math.random() * flipChars.length)]
                return next
              })
            }
          }, duration * 1000)

          intervalsRef.current.push(flipInterval)
        })
      })
    },
    [text, duration, stagger, characters],
  )

  // Lancement de l'animation initiale au montage du composant
  useEffect(() => {
    if (!containerRef.current || hasAnimated) return

    const ctx = gsap.context(() => {
      runTickerAnimation(delay)
      setHasAnimated(true)
    }, containerRef)

    return () => {
      ctx.revert()
      intervalsRef.current.forEach(clearInterval)
    }
  }, [delay, hasAnimated, runTickerAnimation])

  // Rejoue l'animation au survol de la souris (sans délai initial)
  const handleMouseEnter = () => {
    if (hasAnimated) {
      runTickerAnimation(0)
    }
  }

  return (
    <h1
      ref={containerRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      style={{
        fontSize: "clamp(5rem, 18vw, 18rem)",
        lineHeight: 0.9,
        letterSpacing: "0.02em",
        fontFamily: "'Bebas Neue', sans-serif",
        display: "flex",
        cursor: "pointer",
      }}
    >
      {characters.map((char, index) => (
        <span
          key={index}
          className="relative inline-block transition-colors duration-100"
          style={{
            backgroundColor: activeIndices[index] ? "#3D3D3D" : "transparent",
            color: activeIndices[index] ? "#ffffff" : flippingIndices[index] ? "#3D3D3D" : "transparent",
            padding: "0.08em 0.05em",
            marginRight: "0.06em",
            minWidth: char === " " ? "0.3em" : undefined,
          }}
        >
          {displayChars[index] || (char === " " ? "\u00A0" : "")}
        </span>
      ))}
    </h1>
  )
}
