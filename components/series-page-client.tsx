// Page client d'une série photographique
// Affiche l'en-tête de la série (titre, description, médium, année),
// une galerie masonry de photos, une section de documents PDF,
// et une lightbox au clic sur une photo.
// Animations GSAP : fondu de l'en-tête et apparition progressive des photos au scroll.

"use client"

import { useState, useRef, useEffect, useMemo, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { Photo, Series, VideoFile, AudioFile } from "@/lib/data"
import { cn } from "@/lib/utils"
import { PhotoLightbox } from "@/components/photo-lightbox"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { OptimizedImage } from "@/components/optimized-image"
import Link from "next/link"
import { FileText, ArrowLeft, Play, Volume2, ExternalLink } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrambleTextOnHover } from "./scramble-text"

gsap.registerPlugin(ScrollTrigger)

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
  
  while (remaining.length > 0) {
    const boldIdx = remaining.indexOf('**')
    const underlineIdx = remaining.indexOf('__')
    const italicIdx = remaining.indexOf('*')
    
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
    if (italicIdx !== -1 && italicIdx < firstIdx) {
      if (remaining.substring(italicIdx, italicIdx + 2) !== '**') {
        firstIdx = italicIdx
        patternType = 'italic'
      }
    }
    
    if (patternType === null) {
      parts.push(remaining)
      break
    }
    
    if (firstIdx > 0) {
      parts.push(remaining.substring(0, firstIdx))
    }
    
    let closeIdx = -1
    let content = ''
    let skipLength = 0
    
    if (patternType === 'bold') {
      closeIdx = remaining.indexOf('**', firstIdx + 2)
      if (closeIdx !== -1) {
        content = remaining.substring(firstIdx + 2, closeIdx)
        parts.push(<strong key={key++} className="text-foreground font-semibold">{parseLine(content)}</strong>)
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
      parts.push(remaining.substring(firstIdx))
      break
    }
    
    remaining = remaining.substring(skipLength)
  }
  
  return <>{parts}</>
}

export default function SeriesPageClient({ seriesData, allSeries }: { seriesData: Series; allSeries: Series[] }) {
  const safeAllSeries = Array.isArray(allSeries) ? allSeries : []
  // Photo actuellement affichée dans la lightbox (null = fermée)
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null)
  const [coverHeight, setCoverHeight] = useState(400)
  const headerRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Determine if this is a video/cinema series for contextual button text
  const isVideoOrCinema = useMemo(() => {
    const medium = seriesData.medium.toLowerCase()
    return medium.includes("vidéo") || medium.includes("cinéma")
  }, [seriesData.medium])

  // Liste des autres projets (exclure le courant)
  const otherProjects = useMemo(
    () => safeAllSeries.filter((s: Series) => s.slug !== seriesData.slug),
    [safeAllSeries, seriesData.slug]
  )

  const handleRandomProject = () => {
    if (otherProjects.length === 0) return
    const random = otherProjects[Math.floor(Math.random() * otherProjects.length)]
    router.push(`/series/${random.slug}`)
  }

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Animations GSAP au montage : en-tête + galerie
  useEffect(() => {
    if (!headerRef.current || !galleryRef.current) return

    const ctx = gsap.context(() => {
      // Animation de l'en-tête : montée avec fondu
      gsap.from(headerRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      })

      // Apparition progressive des éléments de la galerie avec décalage
      const items = galleryRef.current?.querySelectorAll(".gallery-item")
      if (items && items.length > 0) {
        gsap.set(items, { y: 60, opacity: 0 })
        gsap.to(items, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: galleryRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        })
      }
    })

    return () => ctx.revert()
  }, [seriesData])

  return (
    <main className="relative min-h-screen">
      <MobileNav />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      {/* Barre supérieure avec lien retour et toggle de thème */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        {/* Bouton retour - visible uniquement sur desktop */}
        <Link 
          href="/" 
          className="hidden md:flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </Link>
        <div className="md:hidden" />{/* Spacer for mobile */}
        <ThemeToggle />
      </div>

      {/* En-tête de la série : médium, année, titre, description, compteur */}
      <div ref={headerRef} className="relative z-10 px-6 md:px-12 pt-8 pb-20 md:pt-16 md:pb-32">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent block mb-4">
          {seriesData.medium} — {seriesData.year}
        </span>
        <h1 className="font-[var(--font-bebas)] text-4xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tight">
          {seriesData.title}
        </h1>
        <div className="font-mono text-sm text-muted-foreground leading-relaxed overflow-y-auto max-h-[30vh] pr-3 scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent hover:scrollbar-thumb-border/80 scrollbar-thumb-rounded">
          {parseMarkdown(seriesData.description)}
        </div>
        <div className="mt-6 flex items-center gap-6">
          <span className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
            {seriesData.photos.length} {seriesData.photos.length > 1 ? "éléments" : "élément"}
          </span>
          <div className="h-px flex-1 bg-border/30 max-w-xs" />
        </div>
        
        {/* Link button - only shown if link exists */}
        {seriesData.link && (
          <div className="mt-8">
            <a
              href={seriesData.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 hover:bg-accent/20 border border-accent/20 hover:border-accent/40 rounded-lg transition-all duration-300 group"
            >
              <span className="font-mono text-sm text-accent">{seriesData.linkText || "Voir le projet"}</span>
              <ExternalLink className="w-4 h-4 text-accent transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        )}
      </div>

      {/* Transparent spacer to create visual gap */}
      <div className="h-8 md:h-12" aria-hidden="true" />

      {/* Cover Image Section */}
      <div className="relative z-10 px-6 md:px-12 pb-12 md:ml-24">
        <div className="max-w-6xl">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Couverture</span>
            
            {/* Height control only - cover is set in JSON */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground">Hauteur:</span>
              <input
                type="range"
                min="200"
                max="800"
                step="50"
                value={coverHeight}
                onChange={(e) => setCoverHeight(Number(e.target.value))}
                className="w-24 accent-accent"
              />
              <span className="font-mono text-[10px] text-muted-foreground w-10">{coverHeight}px</span>
            </div>
          </div>
          
          <div className="relative border border-border rounded-lg overflow-hidden bg-card">
            <OptimizedImage
              src={seriesData.photos[seriesData.biggerIndex]?.src}
              alt={seriesData.photos[seriesData.biggerIndex]?.alt}
              className="w-full"
              wrapperClassName="w-full"
              objectFit="contain"
              loading="eager"
              fadeDuration={300}
              sizes="(max-width: 768px) 100vw, 80vw"
            />
            {seriesData.photos[seriesData.biggerIndex]?.intentionNote && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="font-mono text-xs text-white/90">
                  {seriesData.photos[seriesData.biggerIndex].intentionNote}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Galerie masonry responsive : 1 colonne mobile, 2 tablette, 2 desktop */}
      <div
        ref={galleryRef}
        className="relative z-10 px-6 md:px-12 pb-24 md:ml-24"
      >
        <div className="max-w-6xl">
          <div className="mb-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {seriesData.photos.length > 1 ? `Galerie (${seriesData.photos.length - 1} photos)` : 'Galerie'}
            </span>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-2 gap-6 md:gap-8">
            {/* Skip the "bigger" photo in the gallery (it's shown in Couverture) */}
            {seriesData.photos
              .filter((_, index) => index !== seriesData.biggerIndex)
              .map((photo) => (
                <GalleryItem
                  key={photo.id}
                  photo={photo}
                  onPhotoClick={() => setLightboxPhoto(photo)}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Section des documents PDF */}
      {seriesData.pdfFiles && seriesData.pdfFiles.length > 0 && (
        <div className="relative z-10 px-6 md:px-12 pb-24 md:ml-24">
          <div className="max-w-6xl">
            <div className="mb-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent block mb-2">
                Documents
              </span>
              <h2 className="font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight">
                Fichiers PDF
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {seriesData.pdfFiles.map((pdf) => (
                <PDFItem key={pdf.id} pdf={pdf} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section des vidéos */}
      {seriesData.videoFiles && seriesData.videoFiles.length > 0 && (
        <div className="relative z-10 px-6 md:px-12 pb-24 md:ml-24">
          <div className="max-w-6xl">
            <div className="mb-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent block mb-2">
                Vidéos
              </span>
              <h2 className="font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight">
                {seriesData.videoFiles.length > 1 ? "Vidéos" : "Vidéo"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {seriesData.videoFiles.map((video) => (
                <VideoItem key={video.id} video={video} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section des fichiers audio */}
      {seriesData.audioFiles && seriesData.audioFiles.length > 0 && (
        <div className="relative z-10 px-6 md:px-12 pb-24 md:ml-24">
          <div className="max-w-6xl">
            <div className="mb-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent block mb-2">
                Audio
              </span>
              <h2 className="font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight">
                {seriesData.audioFiles.length > 1 ? "Fichiers audio" : "Fichier audio"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {seriesData.audioFiles.map((audio) => (
                <AudioItem key={audio.id} audio={audio} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox affichée quand une photo est sélectionnée */}
      {lightboxPhoto && (
        <PhotoLightbox
          photo={lightboxPhoto}
          parentSeries={seriesData}
          onClose={() => setLightboxPhoto(null)}
        />
      )}

      <div className="relative z-10 px-6 md:px-12 pb-12 pt-8 flex justify-center">
        {otherProjects.length > 0 ? (
          <button
            type="button"
            onClick={handleRandomProject}
            className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            aria-label={isVideoOrCinema ? "Voir un autre film/vidéo" : "Voir les autres projets"}
            title={isVideoOrCinema ? "Voir un autre film/vidéo" : "Voir les autres projets"}
          >
            {isVideoOrCinema ? "VOIR UN AUTRE FILM/VIDÉO" : "Voir les autres projets"}
            <span className="transition-transform duration-300 group-hover:translate-x-1 inline-block">→</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-3 border border-foreground/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Chargement...
          </div>
        )}
      </div>
    </main>
  )
}

// Composant interne : carte de photo individuelle dans la galerie
// Affiche l'image, un overlay au survol avec la note d'intention,
// les infos techniques en dessous, et un accent décoratif en coin
function GalleryItem({
  photo,
  onPhotoClick,
}: {
  photo: Photo
  onPhotoClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="gallery-item break-inside-avoid mb-4 md:mb-6 group cursor-pointer relative overflow-hidden border border-border/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPhotoClick}
    >
      {/* Image avec zoom léger au survol */}
      <div className="relative overflow-hidden">
        <OptimizedImage
          src={photo.src}
          alt={photo.alt}
          className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.03]"
          wrapperClassName="w-full"
          sizes="(max-width: 640px) 100vw, 50vw"
        />

        {/* Overlay sombre au survol avec aperçu de la note d'intention */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex items-end transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="p-4 w-full">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent block mb-1">
              Commentaire
            </span>
            <p className="font-mono text-xs text-white/80 leading-relaxed line-clamp-3">
              {photo.intentionNote || "Aucune note d'intention"}
            </p>
          </div>
        </div>
      </div>

      {/* Informations de la photo sous l'image */}
      <div className="p-3 bg-card/80">
        <p className="font-mono text-[10px] text-muted-foreground truncate">{photo.alt}</p>
        {photo.technical && (
          <p className="font-mono text-[9px] text-muted-foreground/50 mt-1">{photo.technical}</p>
        )}
      </div>

      {/* Accent décoratif en coin supérieur droit au survol */}
      <div
        className={cn(
          "absolute top-0 right-0 w-8 h-8 transition-all duration-500",
          isHovered ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="absolute top-0 right-0 w-full h-px bg-accent" />
        <div className="absolute top-0 right-0 w-px h-full bg-accent" />
      </div>
    </div>
  )
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

// Composant interne : carte de document PDF
// Affiche l'icône, le titre, la description, et ouvre le PDF dans un nouvel onglet au clic
function PDFItem({ pdf }: { pdf: { id: string; src: string; title: string; description?: string } }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={pdf.src}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative overflow-hidden border border-border/20 bg-card/30 hover:bg-card/50 transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-sm font-medium text-foreground truncate">
            {pdf.title}
          </h3>
          {pdf.description && (
            <div className="font-mono text-[10px] text-muted-foreground mt-1 line-clamp-2">
              {parseMarkdownPreview(pdf.description, 150)}
            </div>
          )}
          <span className="font-mono text-[9px] text-accent mt-3 inline-block">
            Ouvrir le document →
          </span>
        </div>
      </div>

      {/* Accent décoratif en coin supérieur droit au survol */}
      <div
        className={cn(
          "absolute top-0 right-0 w-8 h-8 transition-all duration-500",
          isHovered ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="absolute top-0 right-0 w-full h-px bg-accent" />
        <div className="absolute top-0 right-0 w-px h-full bg-accent" />
      </div>
    </a>
  )
}

// Composant interne : lecteur vidéo
// Affiche une vidéo avec contrôles natifs du navigateur
function VideoItem({ video }: { video: VideoFile }) {
  return (
    <div className="group relative overflow-hidden border border-border/20 bg-card/30">
      <div className="relative aspect-video bg-black/50">
        <video
          src={video.src}
          controls
          preload="metadata"
          className="w-full h-full object-contain"
          playsInline
        />
      </div>
      <div className="p-4 bg-card/80">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Play className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm font-medium text-foreground truncate">
              {video.title}
            </h3>
          </div>
        </div>
        {video.description && (
          <div className="font-mono text-[10px] text-muted-foreground line-clamp-2">
            {parseMarkdownPreview(video.description, 150)}
          </div>
        )}
        {video.duration && (
          <span className="font-mono text-[9px] text-accent mt-2 inline-block">
            Durée: {video.duration}
          </span>
        )}
      </div>
    </div>
  )
}

// Composant interne : lecteur audio
// Affiche un fichier audio avec contrôles natifs du navigateur
function AudioItem({ audio }: { audio: AudioFile }) {
  return (
    <div className="group relative overflow-hidden border border-border/20 bg-card/30 hover:bg-card/50 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm font-medium text-foreground truncate">
              {audio.title}
            </h3>
            {audio.description && (
              <div className="font-mono text-[10px] text-muted-foreground mt-1 line-clamp-2">
                {parseMarkdownPreview(audio.description, 150)}
              </div>
            )}
            {audio.duration && (
              <span className="font-mono text-[9px] text-accent mt-2 inline-block">
                Durée: {audio.duration}
              </span>
            )}
          </div>
        </div>
        <audio
          src={audio.src}
          controls
          preload="metadata"
          className="w-full mt-4"
        />
      </div>
    </div>
  )
}
