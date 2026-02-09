// Composant d'affichage "split-flap" (panneau à volets mécaniques)
// Reproduit l'effet visuel et sonore des anciens panneaux d'affichage d'aéroport/gare
// où chaque caractère défile mécaniquement avant de se fixer sur la bonne lettre.
//
// Architecture :
// - SplitFlapAudioProvider : contexte React pour la gestion audio (son de clic mécanique)
// - SplitFlapMuteToggle : bouton pour activer/désactiver le son
// - SplitFlapText : composant principal affichant le texte animé
// - SplitFlapChar : composant interne pour un seul caractère avec animation 3D

"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useMemo, useState, useCallback, useEffect, useRef, createContext, useContext, memo } from "react"
import { Volume2, VolumeX } from "lucide-react"

// Type du contexte audio partagé entre les composants split-flap
interface AudioContextType {
  isMuted: boolean
  toggleMute: () => void
  playClick: () => void
}

// Contexte React pour partager l'état audio entre le provider et les caractères
const SplitFlapAudioContext = createContext<AudioContextType | null>(null)

// Hook utilitaire pour accéder au contexte audio
function useSplitFlapAudio() {
  return useContext(SplitFlapAudioContext)
}

// Fournisseur audio pour les sons de clic mécanique des volets
// Gère la création du contexte Web Audio, la synthèse sonore et le retour haptique
// Le son est désactivé par défaut (isMuted = true)
export function SplitFlapAudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(true)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialisation paresseuse du contexte Web Audio (créé une seule fois)
  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass()
      }
    }
    return audioContextRef.current
  }, [])

  // Déclenche une vibration haptique légère sur les appareils compatibles
  const triggerHaptic = useCallback(() => {
    if (isMuted) return
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10)
    }
  }, [isMuted])

  // Synthétise et joue un son de clic mécanique via Web Audio API
  // Chaîne audio : oscillateur carré → filtre passe-bande → gain → filtre passe-bas → sortie
  // Le son est très court (20ms) avec une fréquence descendante pour simuler un clic
  const playClick = useCallback(() => {
    if (isMuted) return

    triggerHaptic()

    try {
      const ctx = getAudioContext()
      if (!ctx) return

      if (ctx.state === "suspended") {
        ctx.resume()
      }

      // Oscillateur carré avec fréquence descendante rapide (800-1200Hz → 200Hz)
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      const lowpass = ctx.createBiquadFilter()

      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.015)

      // Filtre passe-bande pour isoler les fréquences du clic
      filter.type = "bandpass"
      filter.frequency.setValueAtTime(1200, ctx.currentTime)
      filter.Q.setValueAtTime(0.8, ctx.currentTime)

      // Filtre passe-bas pour adoucir le son
      lowpass.type = "lowpass"
      lowpass.frequency.value = 2500
      lowpass.Q.value = 0.5

      // Enveloppe de gain : atténuation rapide pour un son percussif
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02)

      // Connexion de la chaîne audio
      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(lowpass)
      lowpass.connect(ctx.destination)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.02)
    } catch {
      // Audio non supporté par le navigateur
    }
  }, [isMuted, getAudioContext, triggerHaptic])

  // Bascule l'état muet/non-muet et réactive le contexte audio si nécessaire
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
    if (isMuted) {
      try {
        const ctx = getAudioContext()
        if (ctx && ctx.state === "suspended") {
          ctx.resume()
        }
      } catch {
        // Audio non supporté par le navigateur
      }
    }
  }, [isMuted, getAudioContext])

  // Mémorisation de la valeur du contexte pour éviter les re-rendus inutiles
  const value = useMemo(() => ({ isMuted, toggleMute, playClick }), [isMuted, toggleMute, playClick])

  return <SplitFlapAudioContext.Provider value={value}>{children}</SplitFlapAudioContext.Provider>
}

// Bouton de bascule son on/off pour l'effet split-flap
export function SplitFlapMuteToggle({ className = "" }: { className?: string }) {
  const audio = useSplitFlapAudio()
  if (!audio) return null

  return (
    <button
      onClick={audio.toggleMute}
      className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 ${className}`}
      aria-label={audio.isMuted ? "Unmute sound effects" : "Mute sound effects"}
    >
      {audio.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      <span>{audio.isMuted ? "Sound Off" : "Sound On"}</span>
    </button>
  )
}

// Props du composant SplitFlapText : texte à afficher, classe CSS, vitesse de défilement
interface SplitFlapTextProps {
  text: string
  className?: string
  speed?: number
  size?: string
}

// Jeu de caractères disponibles pour le défilement (lettres + chiffres)
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("")

// Composant interne du texte split-flap (rendu des caractères individuels)
function SplitFlapTextInner({ text, className = "", speed = 50, size }: SplitFlapTextProps) {
  const chars = useMemo(() => text.split(""), [text])
  // Clé d'animation : incrémentée à chaque survol pour relancer l'animation
  const [animationKey, setAnimationKey] = useState(0)
  // Indique si l'animation initiale est terminée (après 1s)
  const [hasInitialized, setHasInitialized] = useState(false)
  const audio = useSplitFlapAudio()

  // Au survol, incrémente la clé pour relancer l'animation de tous les caractères
  const handleMouseEnter = useCallback(() => {
    setAnimationKey((prev) => prev + 1)
  }, [])

  // Marque l'initialisation comme terminée après 1 seconde
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasInitialized(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`inline-flex gap-[0.08em] items-center cursor-pointer ${className}`}
      aria-label={text}
      onMouseEnter={handleMouseEnter}
      style={{ perspective: "1000px" }}
    >
      {chars.map((char, index) => (
        <SplitFlapChar
          key={index}
          char={char.toUpperCase()}
          index={index}
          animationKey={animationKey}
          skipEntrance={hasInitialized}
          speed={speed}
          size={size}
        />
      ))}
    </div>
  )
}

// Composant exporté : wrapper public du texte split-flap
export function SplitFlapText(props: SplitFlapTextProps) {
  return <SplitFlapTextInner {...props} />
}

// Props d'un caractère split-flap individuel
interface SplitFlapCharProps {
  char: string
  index: number
  animationKey: number
  skipEntrance: boolean
  speed: number
  playClick?: () => void
  size?: string
}

// Composant interne : un seul caractère split-flap avec animation de volet 3D
// Simule un volet mécanique qui tourne pour révéler le bon caractère
const SplitFlapChar = memo(function SplitFlapChar({ char, index, animationKey, skipEntrance, speed, playClick, size }: SplitFlapCharProps) {
  const displayChar = CHARSET.includes(char) ? char : " "
  const isSpace = char === " "
  // Caractère actuellement affiché (change pendant le défilement)
  const [currentChar, setCurrentChar] = useState(skipEntrance ? displayChar : " ")
  // Indique si le caractère a atteint sa valeur finale
  const [isSettled, setIsSettled] = useState(skipEntrance)
  const hasAnimatedRef = useRef(skipEntrance)
  const defaultSize = "clamp(2.5rem, 12vw, 14rem)"
  const fontSize = size || defaultSize
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Délai progressif basé sur la position du caractère dans le texte
  const tileDelay = 0.15 * index

  // Couleurs conditionnelles : bleu pendant le défilement, couleurs du thème une fois fixé
  const bgColor = isSettled ? "var(--background)" : "#eee"  
  const textColor = isSettled ? "var(--foreground)" : "#1C1C1E"

  // Animation principale du défilement de caractères
  // Défile aléatoirement dans le CHARSET puis se fixe sur le bon caractère
  useEffect(() => {
    // Si l'animation d'entrée a déjà été jouée et que ce n'est pas un hover (animationKey === 0),
    // on ne refait pas l'animation complète
    if (hasAnimatedRef.current && animationKey === 0) {
      setCurrentChar(displayChar)
      setIsSettled(true)
      return
    }

    // Nettoyage des timers précédents
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    // Les espaces sont directement fixés sans animation
    if (isSpace) {
      setCurrentChar(" ")
      setIsSettled(true)
      return
    }

    // Début du défilement avec un caractère aléatoire
    setIsSettled(false)
    setCurrentChar(CHARSET[Math.floor(Math.random() * CHARSET.length)])

    // Nombre de base de rotations + délai progressif selon la position
    const baseFlips = 8
    const startDelay = hasAnimatedRef.current ? tileDelay * 200 : tileDelay * 800
    let flipIndex = 0
    let hasStartedSettling = false

    // Démarre le défilement après le délai initial
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        // Seuil de fixation : plus le caractère est loin, plus il défile longtemps
        const settleThreshold = hasAnimatedRef.current ? 4 : baseFlips + index * 3

        // Une fois le seuil atteint, fixe le bon caractère et joue le son final
        if (flipIndex >= settleThreshold && !hasStartedSettling) {
          hasStartedSettling = true
          if (intervalRef.current) clearInterval(intervalRef.current)
          setCurrentChar(displayChar)
          setIsSettled(true)
          hasAnimatedRef.current = true
          if (playClick) playClick()
          return
        }
        // Pendant le défilement : caractère aléatoire + son de clic toutes les 2 rotations
        setCurrentChar(CHARSET[Math.floor(Math.random() * CHARSET.length)])
        if (flipIndex % 2 === 0 && playClick) playClick()
        flipIndex++
      }, speed)
    }, startDelay)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [displayChar, isSpace, tileDelay, animationKey, index, speed, playClick])

  if (isSpace) {
    return (
      <div
        style={{
          width: "0.3em",
          fontSize,
        }}
      />
    )
  }

  return (
    <motion.div
      initial={skipEntrance ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: tileDelay, duration: 0.3, ease: "easeOut" }}
      className="relative overflow-hidden flex items-center justify-center font-[family-name:var(--font-bebas)]"
      style={{
        fontSize,
        width: "0.65em",
        height: "1.05em",
        backgroundColor: bgColor,
        transformStyle: "preserve-3d",
        transition: "background-color 0.15s ease",
      }}
    >
      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/20 pointer-events-none z-10" />

      <div className="absolute inset-x-0 top-0 bottom-1/2 flex items-end justify-center overflow-hidden">
        <span
          className="block translate-y-[0.52em] leading-none transition-colors duration-150"
          style={{ color: textColor }}
        >
          {currentChar}
        </span>
      </div>

      <div className="absolute inset-x-0 top-1/2 bottom-0 flex items-start justify-center overflow-hidden">
        <span
          className="-translate-y-[0.52em] leading-none transition-colors duration-150"
          style={{ color: textColor }}
        >
          {currentChar}
        </span>
      </div>

      <motion.div
        key={`${animationKey}-${isSettled}`}
        initial={{ rotateX: -90 }}
        animate={{ rotateX: 0 }}
        transition={{ delay: hasAnimatedRef.current ? tileDelay * 0.3 : tileDelay + 0.15,
          duration: 0.25,
          ease: [0.22, 0.61, 0.36, 1],
        }}
        className="absolute inset-x-0 top-0 bottom-1/2 origin-bottom overflow-hidden"
        style={{
          backgroundColor: bgColor,
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          transition: "background-color 0.15s ease",
        }}
      >
        <div className="flex h-full items-end justify-center">
          <span
            className="translate-y-[0.52em] leading-none transition-colors duration-150"
            style={{ color: textColor }}
          >
            {currentChar}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
})
