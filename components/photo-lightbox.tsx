// Composant lightbox pour l'affichage d'une photo en plein écran
// Affiche l'image agrandie avec un panneau latéral contenant :
// la note d'intention, les détails techniques, la date et un lien vers la série parente.
// Se ferme avec la touche Escape ou en cliquant sur le fond.

"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import type { Photo, Series } from "@/lib/data"
import Link from "next/link"

// Props : photo à afficher, série parente (optionnelle), fonction de fermeture
interface PhotoLightboxProps {
  photo: Photo
  parentSeries?: Series
  onClose: () => void
  allPhotos?: Photo[]
  onNavigate?: (photo: Photo) => void
}

export function PhotoLightbox({ photo, parentSeries, onClose, allPhotos, onNavigate }: PhotoLightboxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 })
  const pinchStart = useRef({ distance: 0, scale: 1 })

  const currentIndex = allPhotos?.findIndex((p) => p.id === photo.id) ?? -1
  const hasNavigation = allPhotos && allPhotos.length > 1 && onNavigate

  const goToPrev = useCallback(() => {
    if (!hasNavigation || currentIndex === -1) return
    const prevIndex = currentIndex === 0 ? allPhotos.length - 1 : currentIndex - 1
    onNavigate!(allPhotos[prevIndex])
  }, [hasNavigation, currentIndex, allPhotos, onNavigate])

  const goToNext = useCallback(() => {
    if (!hasNavigation || currentIndex === -1) return
    const nextIndex = currentIndex === allPhotos.length - 1 ? 0 : currentIndex + 1
    onNavigate!(allPhotos[nextIndex])
  }, [hasNavigation, currentIndex, allPhotos, onNavigate])

  const zoomIn = useCallback(() => setScale((s) => Math.min(4, s * 1.25)), [])
  const zoomOut = useCallback(() => {
    setScale((s) => {
      const ns = Math.max(1, s / 1.25)
      if (ns <= 1) setPosition({ x: 0, y: 0 })
      return ns
    })
  }, [])
  const resetZoom = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Gestion du clavier : Escape, flèches, zoom
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") goToPrev()
      if (e.key === "ArrowRight") goToNext()
      if (e.key === "+" || e.key === "=") zoomIn()
      if (e.key === "-" || e.key === "_") zoomOut()
    },
    [onClose, goToPrev, goToNext, zoomIn, zoomOut],
  )

  // Écoute du clavier et blocage du défilement du body quand la lightbox est ouverte
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"

    const preventScroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (imageRef.current?.contains(target)) return
      e.preventDefault()
    }
    document.addEventListener("touchmove", preventScroll, { passive: false })

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
      document.body.style.touchAction = ""
      document.removeEventListener("touchmove", preventScroll)
    }
  }, [handleKeyDown])

  // Réinitialise le scroll, le zoom et la position à chaque changement de photo
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
    setImageLoaded(false)
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
  }, [photo.id])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.85 : 1.15
      setScale((s) => {
        const ns = Math.min(4, Math.max(1, s * delta))
        if (ns <= 1) setPosition({ x: 0, y: 0 })
        return ns
      })
    },
    [],
  )

  const handleDoubleClick = useCallback(() => {
    setScale((s) => {
      const ns = s > 1 ? 1 : 2.5
      if (ns <= 1) setPosition({ x: 0, y: 0 })
      return ns
    })
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (scale <= 1) return
      setIsDragging(true)
      dragStart.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [scale, position],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      setPosition({ x: dragStart.current.px + dx, y: dragStart.current.py + dy })
    },
    [isDragging],
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        pinchStart.current = {
          distance: Math.hypot(dx, dy),
          scale,
        }
      }
    },
    [scale],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchStart.current.distance > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const distance = Math.hypot(dx, dy)
        const ratio = distance / pinchStart.current.distance
        const ns = Math.min(4, Math.max(1, pinchStart.current.scale * ratio))
        setScale(ns)
        if (ns <= 1) setPosition({ x: 0, y: 0 })
      }
    },
    [],
  )

  const transformStyle = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      onClick={onClose}
    >
      {/* Fond semi-transparent avec flou */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Bouton de fermeture — toujours visible et accessible */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-30 p-3 text-white/60 hover:text-white transition-colors duration-200 touch-manipulation"
        aria-label="Fermer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Flèche précédente */}
      {hasNavigation && (
        <button
          onClick={(e) => { e.stopPropagation(); goToPrev() }}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-200 touch-manipulation"
          aria-label="Image précédente"
        >
          <ChevronLeft className="w-5 h-5 md:w-7 md:h-7" />
        </button>
      )}

      {/* Flèche suivante */}
      {hasNavigation && (
        <button
          onClick={(e) => { e.stopPropagation(); goToNext() }}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-200 touch-manipulation"
          aria-label="Image suivante"
        >
          <ChevronRight className="w-5 h-5 md:w-7 md:h-7" />
        </button>
      )}

      {/* Contenu principal — scrollable verticalement sur mobile */}
      {/* stopPropagation empêche la fermeture quand on clique sur le contenu */}
      <div
        ref={(el) => {
          scrollRef.current = el
          if (el) {
            el.scrollTop = 0
          }
        }}
        className="relative z-10 w-full h-full lg:h-auto lg:max-h-[90vh] overflow-y-auto lg:overflow-visible flex flex-col lg:flex-row gap-0 lg:gap-8 max-w-6xl lg:mx-6 scroll-smooth"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image principale avec zoom natif */}
        <div className="shrink-0 lg:flex-1 flex items-center justify-center min-h-[40vh] lg:min-h-0 p-4 pt-16 lg:p-0 relative overflow-hidden select-none">
          <div
            ref={imageRef}
            className={cn(
              "relative overflow-hidden touch-none",
              scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in",
            )}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading="eager"
              decoding="async"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              style={transformStyle}
              className={cn(
                "max-h-[50vh] lg:max-h-[80vh] w-auto object-contain transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0",
                photo.orientation === "portrait" ? "max-w-[70vw] lg:max-w-[50vw]" : "max-w-[90vw] lg:max-w-full",
              )}
            />
          </div>

          {/* Contrôles de zoom */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
            <button
              onClick={(e) => { e.stopPropagation(); zoomOut() }}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors touch-manipulation"
              aria-label="Zoom arrière"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-[10px] text-white/70 tabular-nums min-w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); zoomIn() }}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors touch-manipulation"
              aria-label="Zoom avant"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {scale > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); resetZoom() }}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors touch-manipulation"
                aria-label="Réinitialiser le zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Panneau d'informations — pleine largeur en mobile, latéral en desktop */}
        <div className="shrink-0 lg:w-80 bg-card/95 backdrop-blur-md border-t lg:border-t-0 lg:border border-border/30 p-6 md:p-8 overflow-y-auto max-h-[80vh] rounded-lg lg:rounded-none scroll-smooth">
          {/* Étiquette d'en-tête */}
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent block mb-4 md:mb-6">
            Commentaire
          </span>

          {/* Titre de la photo */}
          <h3 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-3 md:mb-4">
            {photo.alt}
          </h3>

          {/* Note d'intention de l'artiste */}
          {photo.intentionNote && (
            <div className="font-mono text-xs text-muted-foreground leading-relaxed mb-4 md:mb-6 overflow-y-auto max-h-[20vh] pr-3 scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent hover:scrollbar-thumb-border/80 scrollbar-thumb-rounded">
              {photo.intentionNote}
            </div>
          )}

          {/* Séparateur décoratif */}
          <div className="w-12 h-px bg-accent/40 mb-4 md:mb-6" />

          {/* Détails techniques (appareil, objectif, etc.) */}
          {photo.technical && (
            <div className="mb-3 md:mb-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 block mb-1 md:mb-2">
                Technique
              </span>
              <div className="font-mono text-xs text-foreground/70 overflow-y-auto max-h-[10vh] pr-3 scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent hover:scrollbar-thumb-border/80 scrollbar-thumb-rounded">
                {photo.technical}
              </div>
            </div>
          )}

          {/* Date de la prise de vue */}
          {photo.date && (
            <div className="mb-4 md:mb-6">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 block mb-1 md:mb-2">
                Date
              </span>
              <p className="font-mono text-xs text-foreground/70">{photo.date}</p>
            </div>
          )}

          {/* Lien vers la série parente */}
          {parentSeries && (
            <div className="pt-4 border-t border-border/20">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 block mb-1 md:mb-2">
                Série
              </span>
              <Link
                href={`/series/${parentSeries.slug}`}
                className="font-mono text-xs text-accent hover:text-accent/80 transition-colors duration-200"
                onClick={onClose}
              >
                {parentSeries.title} →
              </Link>
            </div>
          )}

          {/* Espacement en bas pour le safe area iOS */}
          <div className="h-6 lg:h-0" />
        </div>
      </div>
    </div>
  )
}
