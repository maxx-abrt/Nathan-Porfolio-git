// Section "Dernières séries" avec carrousel horizontal
// Affiche les 5 séries les plus récentes sous forme de cartes défilables horizontalement
// Inclut un curseur personnalisé animé qui suit la souris dans la section
// Animations GSAP au scroll : glissement du titre et des cartes depuis la gauche

"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { Series } from "@/lib/data"
import type { ReactNode } from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/optimized-image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// ... markdown parser functions remain the same ...

// Simple markdown parser for descriptions
// Supports: **bold**, *italic*, __underline__, and \\n for line breaks
function parseMarkdown(text: string): ReactNode {
  if (!text) return <></>
  
  // Split by line breaks first (handle both \\n literal and actual newlines)
  const normalizedText = text.replace(/\\n/g, '\n')
  const lines = normalizedText.split('\n')
  
  return (
    <>
      {lines.map((line, lineIndex) => {
        // Process the line with a more robust parser
        const elements = parseLine(line)
        
        return (
          <span key={lineIndex}>
            {elements}
            {lineIndex < lines.length - 1 && <br />}
          </span>
        )
      })}
    </>
  )
}

function parseLine(line: string): ReactNode {
  const parts: ReactNode[] = []
  let remaining = line
  let key = 0
  
  // Process patterns one at a time, left to right
  while (remaining.length > 0) {
    // Find the first occurrence of any pattern opener
    const boldIdx = remaining.indexOf('**')
    const underlineIdx = remaining.indexOf('__')
    const italicIdx = remaining.indexOf('*')
    
    // Find which pattern comes first
    let firstIdx = Infinity
    let patternType: 'bold' | 'underline' | 'italic' | null = null
    
    if (boldIdx !== -1 && boldIdx < firstIdx) {
      firstIdx = boldIdx
      patternType = 'bold'
    }
    if (underlineIdx !== -1 && underlineIdx < firstIdx) {
      firstIdx = underlineIdx
      patternType = 'underline'
    }
    // Only check italic if it's not part of a bold (at position 0 of bold)
    if (italicIdx !== -1 && italicIdx < firstIdx) {
      // Check if this * is the start of **
      if (remaining.substring(italicIdx, italicIdx + 2) !== '**') {
        firstIdx = italicIdx
        patternType = 'italic'
      }
    }
    
    if (patternType === null) {
      // No more patterns found
      parts.push(remaining)
      break
    }
    
    // Add text before the pattern
    if (firstIdx > 0) {
      parts.push(remaining.substring(0, firstIdx))
    }
    
    // Find closing tag based on pattern type
    let closeIdx = -1
    let content = ''
    let skipLength = 0
    
    if (patternType === 'bold') {
      closeIdx = remaining.indexOf('**', firstIdx + 2)
      if (closeIdx !== -1) {
        content = remaining.substring(firstIdx + 2, closeIdx)
        parts.push(<strong key={key++} className="text-grey-900 font-semibold">{parseLine(content)}</strong>)
        skipLength = closeIdx + 2
      }
    } else if (patternType === 'underline') {
      closeIdx = remaining.indexOf('__', firstIdx + 2)
      if (closeIdx !== -1) {
        content = remaining.substring(firstIdx + 2, closeIdx)
        parts.push(<span key={key++} className="underline underline-offset-2">{parseLine(content)}</span>)
        skipLength = closeIdx + 2
      }
    } else if (patternType === 'italic') {
      closeIdx = remaining.indexOf('*', firstIdx + 1)
      if (closeIdx !== -1) {
        content = remaining.substring(firstIdx + 1, closeIdx)
        parts.push(<em key={key++} className="italic">{parseLine(content)}</em>)
        skipLength = closeIdx + 1
      }
    }
    
    if (closeIdx === -1) {
      // No closing tag found, treat as plain text
      parts.push(remaining.substring(firstIdx))
      break
    }
    
    remaining = remaining.substring(skipLength)
  }
  
  return <>{parts}</>
}

// Parse markdown for preview with length limit
function parseMarkdownPreview(text: string, maxLength: number): ReactNode {
  if (!text) return <></>
  
  // Normalize line breaks
  const normalizedText = text.replace(/\\n/g, '\n')
  
  // Get a substring with some buffer to not cut in middle of markdown
  const buffer = 20
  const truncated = normalizedText.length > maxLength + buffer 
    ? normalizedText.substring(0, maxLength + buffer) 
    : normalizedText
  
  // Process the text
  const lines = truncated.split('\n')
  const previewLines: ReactNode[] = []
  let currentLength = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if adding this line would exceed maxLength
    if (currentLength + line.length > maxLength && previewLines.length > 0) {
      break
    }
    
    // Add line break if not first line
    if (i > 0) {
      previewLines.push(<br key={`br-${i}`} />)
      currentLength += 1
    }
    
    // Parse markdown in this line
    previewLines.push(
      <span key={`line-${i}`}>{parseLine(line)}</span>
    )
    currentLength += line.length
    
    // Stop if we've exceeded maxLength
    if (currentLength >= maxLength) {
      break
    }
  }
  
  // Add ellipsis if truncated
  const isTruncated = normalizedText.length > maxLength
  
  return (
    <>
      {previewLines}
      {isTruncated && <span>…</span>}
    </>
  )
}

export function SignalsSection({ series }: { series: Series[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  // Référence du curseur personnalisé (cercle coloré qui suit la souris)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  // Gestion du curseur personnalisé : suit la position de la souris avec CSS transforms (performant)
  const cursorX = useRef(0)
  const cursorY = useRef(0)
  const targetX = useRef(0)
  const targetY = useRef(0)
  const rafId = useRef<number | null>(null)
  
  useEffect(() => {
    if (!sectionRef.current || !cursorRef.current) return

    const section = sectionRef.current
    const cursor = cursorRef.current

    // Smooth cursor animation with RAF (better performance than GSAP for continuous updates)
    // Only run RAF loop when hovering — stops wasting CPU when cursor is elsewhere
    const animateCursor = () => {
      cursorX.current += (targetX.current - cursorX.current) * 0.15
      cursorY.current += (targetY.current - cursorY.current) * 0.15
      
      cursor.style.transform = `translate3d(${cursorX.current}px, ${cursorY.current}px, 0) translate(-50%, -50%)`
      
      rafId.current = requestAnimationFrame(animateCursor)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      targetX.current = e.clientX - rect.left
      targetY.current = e.clientY - rect.top
    }

    const handleMouseEnter = () => {
      setIsHovering(true)
      if (!rafId.current) rafId.current = requestAnimationFrame(animateCursor)
    }
    const handleMouseLeave = () => {
      setIsHovering(false)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
    }

    section.addEventListener("mousemove", handleMouseMove, { passive: true })
    section.addEventListener("mouseenter", handleMouseEnter)
    section.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      section.removeEventListener("mousemove", handleMouseMove)
      section.removeEventListener("mouseenter", handleMouseEnter)
      section.removeEventListener("mouseleave", handleMouseLeave)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  // Animations d'entrée au scroll : titre et cartes glissent depuis la gauche
  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !cardsRef.current) return

    const ctx = gsap.context(() => {
      // Titre : glissement depuis la gauche avec fondu
      gsap.fromTo(
        headerRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )

      // Cartes : apparition progressive avec décalage entre chaque carte
      const cards = cardsRef.current?.querySelectorAll("article")
      if (cards) {
        gsap.fromTo(
          cards,
          { x: -100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Filter for Photo projects only (exclude video/cinema)
  // Only include series that have a series.json file (explicitly configured)
  const photoSeries = series.filter((s) => {
    const medium = s.medium.toLowerCase()
    return medium.includes("photo") && !medium.includes("vidéo") && s.hasJson
  })

  // Sélection des 5 séries photo les plus récentes
  const recentSeries = photoSeries.slice(0, 20)

  return (
    <section id="photographies" ref={sectionRef} className="relative pt-20 sm:pt-32 pb-8 sm:pb-12 pl-4 sm:pl-6 md:pl-28">
      <div
        ref={cursorRef}
        className={cn(
          "pointer-events-none absolute top-0 left-0 z-50",
          "w-12 h-12 rounded-full border-2 border-accent bg-accent",
          "transition-opacity duration-300 will-change-transform",
          isHovering ? "opacity-100" : "opacity-0",
        )}
      />

      {/* En-tête de la section avec numéro et titre */}
      <div ref={headerRef} className="mb-16 pr-6 md:pr-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / Photo</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">PHOTOGRAPHIES</h2>
      </div>

      {/* Conteneur de défilement horizontal pour les cartes */}
      <div
        ref={(el) => {
          scrollRef.current = el
          cardsRef.current = el
        }}
        className="flex gap-8 overflow-x-auto pb-8 pr-12 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {recentSeries.map((s, index) => (
          <RecentSeriesCard key={s.id} seriesItem={s} index={index} />
        ))}
      </div>
    </section>
  )
}

// Composant interne : carte de série récente avec image de couverture,
// numéro, année, titre, médium, description et compteur de photos
// Effet au survol : légère montée, zoom de l'image, extension de la ligne décorative
function RecentSeriesCard({
  seriesItem,
  index,
}: {
  seriesItem: Series
  index: number
}) {
  // Récupération de la photo de couverture définie dans series.json
  const coverPhoto = seriesItem.photos[seriesItem.coverIndex]

  return (
    <article
      className={cn(
        "group relative flex-shrink-0 w-72 sm:w-80 min-h-[480px] max-h-[480px]",
        "transition-transform duration-500 ease-out",
        "hover:-translate-y-2",
      )}
    >
      <Link href={`/series/${seriesItem.slug}`} className="block h-full">
        {/* Carte avec bordures éditoriales et effet de texture papier */}
        <div className="relative bg-card border border-border/50 md:border-t md:border-l md:border-r-0 md:border-b-0 overflow-hidden h-full flex flex-col">
          {/* Image de couverture avec dégradé vers le contenu */}
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <OptimizedImage
              src={coverPhoto.src}
              alt={coverPhoto.alt}
              className="w-full h-full transition-transform duration-700 group-hover:scale-105"
              wrapperClassName="w-full h-full"
              sizes="(max-width: 640px) 288px, 320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
          </div>

          {/* Contenu de la carte */}
          <div className="p-8 flex flex-col grow">
            {/* Effet de bord déchiré en haut */}
            <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

            {/* Numéro de série et année, style éditorial */}
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                No. {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/60">{seriesItem.year}</span>
            </div>

            {/* Titre de la série */}
            <h3 className="font-[var(--font-bebas)] text-4xl tracking-tight mb-2 group-hover:text-accent transition-colors duration-300">
              {seriesItem.title}
            </h3>

            {/* Médium utilisé */}
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent/70 mb-4 block">
              {seriesItem.medium}
            </span>

            {/* Ligne décorative qui s'étend au survol */}
            <div className="w-12 h-px bg-accent/60 mb-4 group-hover:w-full transition-all duration-500" />

            {/* Description tronquée à 2 lignes */}
            <div className="font-mono text-xs text-muted-foreground leading-relaxed line-clamp-2 grow">
              {parseMarkdownPreview(seriesItem.description, 120)}
            </div>

            {/* Nombre de photos dans la série */}
            <span className="font-mono text-[10px] text-muted-foreground/40 mt-4 block">
              {seriesItem.photos.length} {seriesItem.photos.length > 1 ? "photos" : "photo"}
            </span>
          </div>

          {/* Effet de coin replié en bas à droite */}
          <div className="absolute bottom-0 right-0 w-6 h-6 overflow-hidden">
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-background rotate-45 translate-x-4 translate-y-4 border-t border-l border-border/30" />
          </div>
        </div>

        {/* Couche d'ombre/profondeur visible au survol - classic look, reduced height */}
        <div className="absolute inset-x-1 bottom-1 h-[50%] -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute inset-0 translate-x-[8px] translate-y-[10px] bg-accent/20 blur-[12px] rounded-[12px]" />
        </div>
      </Link>
    </article>
  )
}
