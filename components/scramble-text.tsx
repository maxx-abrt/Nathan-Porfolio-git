// Composants d'animation de texte par brouillage (scramble)
// Deux variantes exportées :
// - ScrambleText : anime le texte automatiquement au montage
// - ScrambleTextOnHover : anime le texte au survol de la souris
// L'animation remplace progressivement les glyphes aléatoires par les vrais caractères

"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import gsap from "gsap"

// Props pour le composant ScrambleText (animation au montage)
interface ScrambleTextProps {
  text: string
  className?: string
  /** Délai en millisecondes avant le début de l'animation */
  delayMs?: number
  /** Durée de l'animation de brouillage en secondes */
  duration?: number
}

// Props pour le composant ScrambleTextOnHover (animation au survol)
interface ScrambleTextOnHoverProps {
  text: string
  className?: string
  /** Durée de l'animation de brouillage en secondes */
  duration?: number
  /** Type d'élément HTML à rendre */
  as?: "span" | "button" | "div"
  /** Gestionnaire de clic pour les boutons */
  onClick?: () => void
}

// Jeu de glyphes utilisés pour l'effet de brouillage aléatoire
const GLYPHS = "!@#$%^&*()_+-=<>?/\\[]{}Xx"

// Fonction utilitaire : exécute l'animation de brouillage sur un texte donné
// Utilise GSAP pour progresser de 0 à 1, verrouillant les caractères un par un de gauche à droite
function runScrambleAnimation(
  text: string,
  duration: number,
  setDisplayText: (text: string) => void,
  onComplete?: () => void,
): gsap.core.Tween {
  const lockedIndices = new Set<number>()
  const finalChars = text.split("")
  const totalChars = finalChars.length
  const scrambleObj = { progress: 0 }

  return gsap.to(scrambleObj, {
    progress: 1,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      const numLocked = Math.floor(scrambleObj.progress * totalChars)

      for (let i = 0; i < numLocked; i++) {
        lockedIndices.add(i)
      }

      const newDisplay = finalChars
        .map((char, i) => {
          if (lockedIndices.has(i)) return char
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        })
        .join("")

      setDisplayText(newDisplay)
    },
    onComplete: () => {
      setDisplayText(text)
      onComplete?.()
    },
  })
}

// Composant de texte brouillé — animation automatique au montage
export function ScrambleText({ text, className, delayMs = 0, duration = 0.9 }: ScrambleTextProps) {
  // Initialisation avec le texte final pour éviter un flash de contenu vide
  const [displayText, setDisplayText] = useState(text)
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<gsap.core.Tween | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Lance l'animation une seule fois au montage initial
  useEffect(() => {
    if (hasAnimated || !text) return

    // Démarre avec un texte entièrement brouillé
    const scrambledStart = text
      .split("")
      .map(() => GLYPHS[Math.floor(Math.random() * GLYPHS.length)])
      .join("")
    setDisplayText(scrambledStart)

    timeoutRef.current = setTimeout(() => {
      animationRef.current = runScrambleAnimation(text, duration, setDisplayText, () => {
        setHasAnimated(true)
      })
    }, delayMs)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (animationRef.current) animationRef.current.kill()
    }
  }, [])

  // Mise à jour du texte affiché si la prop text change après l'animation initiale
  useEffect(() => {
    if (hasAnimated && displayText !== text) {
      setDisplayText(text)
    }
  }, [text, hasAnimated, displayText])

  return (
    <span ref={containerRef} className={className}>
      {displayText || text}
    </span>
  )
}

// Composant de texte brouillé — animation déclenchée au survol
export function ScrambleTextOnHover({
  text,
  className,
  duration = 0.4,
  as: Component = "span",
  onClick,
}: ScrambleTextOnHoverProps) {
  const [displayText, setDisplayText] = useState(text)
  const isAnimating = useRef(false)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  // Déclenché au survol : lance le brouillage puis révèle le texte progressivement
  const handleMouseEnter = useCallback(() => {
    if (isAnimating.current) return
    isAnimating.current = true

    // Arrêt de toute animation en cours
    if (tweenRef.current) {
      tweenRef.current.kill()
    }

    // Démarre avec un texte complètement brouillé
    const scrambledStart = text
      .split("")
      .map(() => GLYPHS[Math.floor(Math.random() * GLYPHS.length)])
      .join("")
    setDisplayText(scrambledStart)

    tweenRef.current = runScrambleAnimation(text, duration, setDisplayText, () => {
      isAnimating.current = false
    })
  }, [text, duration])

  // Met à jour le texte affiché si la prop change en dehors d'une animation
  useEffect(() => {
    if (!isAnimating.current) {
      setDisplayText(text)
    }
  }, [text])

  return (
    <Component className={className} onMouseEnter={handleMouseEnter} onClick={onClick}>
      {displayText}
    </Component>
  )
}
