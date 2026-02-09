// Composant lightbox pour l'affichage d'une photo en plein écran
// Affiche l'image agrandie avec un panneau latéral contenant :
// la note d'intention, les détails techniques, la date et un lien vers la série parente.
// Se ferme avec la touche Escape ou en cliquant sur le fond.

"use client"

import { useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import type { Photo, Series } from "@/lib/data"
import Link from "next/link"

// Props : photo à afficher, série parente (optionnelle), fonction de fermeture
interface PhotoLightboxProps {
  photo: Photo
  parentSeries?: Series
  onClose: () => void
}

export function PhotoLightbox({ photo, parentSeries, onClose }: PhotoLightboxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Gestion de la touche Escape pour fermer la lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  // Écoute du clavier et blocage du défilement du body quand la lightbox est ouverte
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"
    
    // Prevent scroll on touch devices
    const preventScroll = (e: TouchEvent) => e.preventDefault()
    document.addEventListener("touchmove", preventScroll, { passive: false })
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
      document.body.style.touchAction = ""
      document.removeEventListener("touchmove", preventScroll)
    }
  }, [handleKeyDown])

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
        className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-3 text-white/60 hover:text-white transition-colors duration-200 touch-manipulation"
        aria-label="Fermer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Contenu principal — scrollable verticalement sur mobile */}
      {/* stopPropagation empêche la fermeture quand on clique sur le contenu */}
      <div
        ref={(el) => { 
          scrollRef.current = el;
          if (el) {
            // Reset scroll to top when lightbox opens
            el.scrollTop = 0;
            el.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        }}
        className="relative z-10 w-full h-full lg:h-auto lg:max-h-[90vh] overflow-y-auto lg:overflow-visible flex flex-col lg:flex-row gap-0 lg:gap-8 max-w-6xl lg:mx-6 scroll-smooth"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image principale adaptée selon l'orientation portrait/paysage */}
        <div className="flex-shrink-0 lg:flex-1 flex items-center justify-center min-h-[40vh] lg:min-h-0 p-4 pt-16 lg:p-0">
          <img
            src={photo.src}
            alt={photo.alt}
            className={cn(
              "max-h-[50vh] lg:max-h-[80vh] w-auto object-contain",
              photo.orientation === "portrait" ? "max-w-[70vw] lg:max-w-[50vw]" : "max-w-[90vw] lg:max-w-full",
            )}
          />
        </div>

        {/* Panneau d'informations — pleine largeur en mobile, latéral en desktop */}
        <div className="flex-shrink-0 lg:w-80 bg-card/95 backdrop-blur-md border-t lg:border-t-0 lg:border border-border/30 p-6 md:p-8 overflow-y-auto max-h-[80vh] rounded-lg lg:rounded-none scroll-smooth">
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
