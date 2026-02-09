"use client"

import { useState, useRef, useEffect, useMemo, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { Series, Photo } from "@/lib/data"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { PhotoLightbox } from "@/components/photo-lightbox"
import { X } from "lucide-react"

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

// Dynamic span pattern generator for balanced grids
function generateBalancedPattern(count: number): string[] {
  const patterns: string[] = []
  
  if (count === 0) return patterns
  
  // Simple, reliable patterns that work with CSS Grid
  const large = "col-span-2 row-span-2"
  const tall = "col-span-1 row-span-2"
  const wide = "col-span-2 row-span-1"
  const small = "col-span-1 row-span-1"
  
  if (count === 1) {
    patterns.push(large)
  } else if (count === 2) {
    patterns.push(large)
    patterns.push(large)
  } else if (count === 3) {
    patterns.push(large)
    patterns.push(small)
    patterns.push(small)
  } else if (count === 4) {
    patterns.push(large)
    patterns.push(small)
    patterns.push(small)
    patterns.push(small)
  } else if (count === 5) {
    patterns.push(large)
    patterns.push(small)
    patterns.push(small)
    patterns.push(small)
    patterns.push(small)
  } else if (count === 6) {
    patterns.push(large)
    patterns.push(small)
    patterns.push(small)
    patterns.push(small)
    patterns.push(small)
    patterns.push(small)
  } else if (count === 7) {
    patterns.push(large)
    patterns.push(small)
    patterns.push(small)
    patterns.push(small)
    patterns.push(small)
    patterns.push(small)
    patterns.push(small)
  } else {
    // For 8+ items, alternate between large and small
    for (let i = 0; i < count; i++) {
      patterns.push(i % 3 === 0 ? large : small)
    }
  }
  
  return patterns
}

export function WorkSection({ series }: { series: Series[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [lightboxData, setLightboxData] = useState<{ photo: Photo; parentSeries: Series } | null>(null)
  const [projectModal, setProjectModal] = useState<{ series: Series } | null>(null)

  // Prevent body scroll when project modal is open
  useEffect(() => {
    if (projectModal) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
      
      // Prevent scroll on touch devices
      const preventScroll = (e: TouchEvent) => e.preventDefault()
      document.addEventListener("touchmove", preventScroll, { passive: false })
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
      document.removeEventListener("touchmove", () => {})
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
      document.removeEventListener("touchmove", () => {})
    }
  }, [projectModal])

  // Filter for Cinéma/vidéo projects only
  const videoSeries = useMemo(() => {
    return series.filter((s) => {
      const medium = s.medium.toLowerCase()
      return medium.includes("vidéo") || medium.includes("cinéma")
    })
  }, [series])

  const gridItems = useMemo(() => {
    const patterns = generateBalancedPattern(videoSeries.length)
    return videoSeries.map((s, i) => ({
      photo: s.photos[s.coverIndex],
      series: s,
      span: patterns[i] || "col-span-1 row-span-1", // Fallback to small if pattern missing
    }))
  }, [videoSeries])

  // Prevent body scroll when project modal is open
  useEffect(() => {
    if (projectModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [projectModal])

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !gridRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in from left
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
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      )

      const cards = gridRef.current?.querySelectorAll("article")
      if (cards && cards.length > 0) {
        gsap.set(cards, { y: 60, opacity: 0 })
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="cinema-videos" className="relative py-20 sm:py-32 pl-4 sm:pl-6 md:pl-28 pr-4 sm:pr-6 md:pr-12">
      {/* Section header */}
      <div ref={headerRef} className="mb-16 flex items-end justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">02 / Cinéma</span>
          <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">CINÉMA / VIDÉOS</h2>
        </div>
        <p className="hidden md:block max-w-xs font-mono text-xs text-muted-foreground text-right leading-relaxed">
          Projets audiovisuels et exercices.
        </p>
      </div>

      {/* Asymmetric grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px] sm:auto-rows-[200px]"
      >
        {gridItems.map((item, index) => (
          <WorkCard
            key={item.photo.id}
            item={item}
            index={index}
            persistHover={index === 0}
            onPhotoClick={() => setLightboxData({ photo: item.photo, parentSeries: item.series })}
            onProjectClick={() => setProjectModal({ series: item.series })}
          />
        ))}
      </div>

      {/* Autres projets section */}
      <OtherProjectsSection series={series} onProjectModal={(series) => setProjectModal({ series })} />

      {/* Lightbox */}
      {lightboxData && (
        <PhotoLightbox
          photo={lightboxData.photo}
          parentSeries={lightboxData.parentSeries}
          onClose={() => setLightboxData(null)}
        />
      )}

      {/* Project Modal */}
      {projectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative z-10 w-full h-full lg:h-auto lg:max-h-[90vh] overflow-y-auto lg:overflow-visible flex flex-col lg:flex-row gap-0 lg:gap-8 max-w-6xl lg:mx-6">
            {/* Close button */}
            <button
              onClick={() => setProjectModal(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-3 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Cover Image - Left Side (no background) */}
            <div className="flex-shrink-0 lg:flex-1 flex items-center justify-center min-h-[40vh] lg:min-h-0 p-4 pt-16 lg:p-0">
              <img
                src={projectModal.series.photos[projectModal.series.coverIndex]?.src}
                alt={projectModal.series.photos[projectModal.series.coverIndex]?.alt}
                className="max-h-[50vh] lg:max-h-[80vh] w-auto object-contain max-w-[90vw] lg:max-w-full"
              />
            </div>
            
            {/* Content - Right Side (with card background) */}
            <div 
              ref={(el) => { 
                if (el) {
                  el.scrollTop = 0;
                  // Smooth scroll to top on open
                  el.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }
              }}
              className="flex-shrink-0 lg:w-80 bg-card/95 backdrop-blur-md border-t lg:border-t-0 lg:border border-border/30 p-6 md:p-8 overflow-y-auto max-h-[80vh] rounded-lg lg:rounded-none scroll-smooth"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent block mb-4">
                Commentaire
              </span>
              
              <h3 className="font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight mb-2">
                {projectModal.series.title}
              </h3>
              <p className="font-mono text-xs text-muted-foreground mb-6">
                {projectModal.series.medium} • {projectModal.series.year}
              </p>
              
              <div className="w-12 h-px bg-accent/40 mb-6" />
              
              <div className="font-mono text-sm text-muted-foreground leading-relaxed overflow-y-auto max-h-[40vh] pr-3 scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent hover:scrollbar-thumb-border/80 scrollbar-thumb-rounded">
                {parseMarkdown(projectModal.series.description)}
              </div>
              
              <div className="mt-6 pt-4 border-t border-border/20">
                <Link
                  href={`/series/${projectModal.series.slug}`}
                  className="inline-flex items-center font-mono text-xs uppercase tracking-widest text-accent hover:text-accent/80 transition-colors group"
                >
                  Voir le projet complet 
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function OtherProjectsSection({ series, onProjectModal }: { series: Series[]; onProjectModal: (series: Series) => void }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [projectModal, setProjectModal] = useState<{ series: Series } | null>(null)

  // Prevent body scroll when project modal is open
  useEffect(() => {
    if (projectModal) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
      
      // Prevent scroll on touch devices
      const preventScroll = (e: TouchEvent) => e.preventDefault()
      document.addEventListener("touchmove", preventScroll, { passive: false })
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
      document.removeEventListener("touchmove", () => {})
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
      document.removeEventListener("touchmove", () => {})
    }
  }, [projectModal])

  // Filter for "Autres" projects only (Audio, empty medium, or explicitly "Autres")
  // Only include series that have a series.json file (explicitly configured)
  const autresSeries = useMemo(() => {
    return series.filter((s) => {
      const medium = s.medium.toLowerCase()
      return (medium.includes("autres") || medium.includes("audio") || medium === "") && s.hasJson
    })
  }, [series])

  const gridItems = useMemo(() => {
    // For "Autres" projects, we need to handle series that might not have photos
    // but have videos or other media
    const filteredSeries = autresSeries.filter(s => {
      // Include if has photos, or if has videos/audios (for media-only projects)
      return s.photos.length > 0 || s.videoFiles || s.audioFiles
    })
    const patterns = generateBalancedPattern(filteredSeries.length)
    return filteredSeries.map((s, i) => {
      // Use first photo if available, otherwise use video thumbnail or create placeholder
      let photo
      if (s.photos.length > 0) {
        photo = s.photos[s.coverIndex]
      } else if (s.videoFiles && s.videoFiles.length > 0 && s.videoFiles[0].thumbnail) {
        // Use video thumbnail if available
        photo = {
          id: `${s.slug}-video-thumb`,
          src: s.videoFiles[0].thumbnail,
          alt: s.videoFiles[0].title || s.title,
          width: 1200,
          height: 800,
          orientation: "landscape" as const,
          seriesId: s.slug,
        }
      } else {
        // Create a colored placeholder with title
        photo = {
          id: `${s.slug}-placeholder`,
          src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect width='1200' height='800' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-family='sans-serif' font-size='24'%3E${encodeURIComponent(s.title)}%3C/text%3E%3C/svg%3E`,
          alt: s.title,
          width: 1200,
          height: 800,
          orientation: "landscape" as const,
          seriesId: s.slug,
        }
      }
      return {
        photo,
        series: s,
        span: patterns[i] || "col-span-1 row-span-1", // Fallback to small if pattern missing
      }
    })
  }, [autresSeries])

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !gridRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in from left
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
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      )

      const cards = gridRef.current?.querySelectorAll("article")
      if (cards && cards.length > 0) {
        gsap.set(cards, { y: 60, opacity: 0 })
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  if (autresSeries.length === 0) return null

  return (
    <div ref={sectionRef} id="autres-projets" className="mt-32">
      {/* Section header */}
      <div ref={headerRef} className="mb-16 flex items-end justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">03 / Autres</span>
          <h2 className="mt-4 font-(--font-bebas) text-5xl md:text-7xl tracking-tight">AUTRES PROJETS</h2>
        </div>
        <p className="hidden md:block max-w-xs font-mono text-xs text-muted-foreground text-right leading-relaxed">
          Son, design graphique, photographies et vidéos. 
        </p>
      </div>

      {/* Grid for other projects */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px] sm:auto-rows-[200px]"
      >
        {gridItems.map((item, index) => (
          <WorkCard
            key={item.photo.id}
            item={item}
            index={index}
            persistHover={false}
            onPhotoClick={() => setProjectModal({ series: item.series })}
            onProjectClick={() => setProjectModal({ series: item.series })}
          />
        ))}
      </div>

      {/* Project Modal */}
      {projectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative z-10 w-full h-full lg:h-auto lg:max-h-[90vh] overflow-y-auto lg:overflow-visible flex flex-col lg:flex-row gap-0 lg:gap-8 max-w-6xl lg:mx-6">
            {/* Close button */}
            <button
              onClick={() => setProjectModal(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-3 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Cover Image - Left Side (no background) */}
            <div className="shrink-0 lg:flex-1 flex items-center justify-center min-h-[40vh] lg:min-h-0 p-4 pt-16 lg:p-0">
              <img
                src={projectModal.series.photos[projectModal.series.coverIndex]?.src}
                alt={projectModal.series.photos[projectModal.series.coverIndex]?.alt}
                className="max-h-[50vh] lg:max-h-[80vh] w-auto object-contain max-w-[90vw] lg:max-w-full"
              />
            </div>
            
            {/* Content - Right Side (with card background) */}
            <div 
              ref={(el) => { 
                if (el) {
                  el.scrollTop = 0;
                  // Smooth scroll to top on open
                  el.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }
              }}
              className="shrink-0 lg:w-80 bg-card/95 backdrop-blur-md border-t lg:border-t-0 lg:border border-border/30 p-6 md:p-8 overflow-y-auto max-h-[80vh] rounded-lg lg:rounded-none scroll-smooth"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent block mb-4">
                Commentaire
              </span>
              
              <h3 className="font-(--font-bebas) text-3xl md:text-4xl tracking-tight mb-2">
                {projectModal.series.title}
              </h3>
              <p className="font-mono text-xs text-muted-foreground mb-6">
                {projectModal.series.medium} • {projectModal.series.year}
              </p>
              
              <div className="w-12 h-px bg-accent/40 mb-6" />
              
              <div className="font-mono text-sm text-muted-foreground leading-relaxed overflow-y-auto max-h-[40vh] pr-3 scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent hover:scrollbar-thumb-border/80 scrollbar-thumb-rounded">
                {parseMarkdown(projectModal.series.description)}
              </div>
              
              <div className="mt-6 pt-4 border-t border-border/20">
                <Link
                  href={`/series/${projectModal.series.slug}`}
                  className="inline-flex items-center font-mono text-xs uppercase tracking-widest text-accent hover:text-accent/80 transition-colors group"
                >
                  Voir le projet complet 
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WorkCard({
  item,
  index,
  persistHover = false,
  onPhotoClick,
  onProjectClick,
}: {
  item: { photo: Photo; series: Series; span: string }
  index: number
  persistHover?: boolean
  onPhotoClick: () => void
  onProjectClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const [isScrollActive, setIsScrollActive] = useState(false)

  useEffect(() => {
    if (!persistHover || !cardRef.current) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: "top 80%",
        onEnter: () => setIsScrollActive(true),
      })
    }, cardRef)

    return () => ctx.revert()
  }, [persistHover])

  const isActive = isHovered || isScrollActive

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative border border-border/40 flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden",
        item.span,
        isActive && "border-accent/60",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={item.photo.src}
          alt={item.photo.alt}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isActive
            ? "bg-gradient-to-t from-black/80 via-black/40 to-black/10"
            : "bg-gradient-to-t from-black/70 via-black/30 to-transparent",
        )} />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 p-5 flex flex-col justify-between h-full">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
            {item.series.medium}
          </span>
        </div>

        <div>
          {/* Series title - clickable link */}
          <Link
            href={`/series/${item.series.slug}`}
            className={cn(
              "font-[var(--font-bebas)] text-2xl md:text-4xl tracking-tight transition-colors duration-300 hover:underline underline-offset-4 block",
              isActive ? "text-white/90" : "text-white/70",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {item.series.title}
          </Link>

          {/* Description - reveals on hover */}
          <div
            className={cn(
              "font-mono text-xs text-white/70 leading-relaxed transition-all duration-500 max-w-[280px] mt-2",
              isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            )}
          >
            {parseMarkdownPreview(item.series.description, 100)}
          </div>

          {/* Click for intention note */}
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              // Use project modal for video/projects, photo lightbox for photos
              const medium = item.series.medium.toLowerCase()
              if (medium.includes('vidéo') || medium.includes('cinéma') || medium.includes('audio')) {
                onProjectClick();
              } else {
                onPhotoClick();
              }
            }}
            className={cn(
              "font-mono text-[10px] uppercase tracking-widest text-accent/80 hover:text-accent mt-3 transition-all duration-300",
              isActive ? "opacity-100" : "opacity-0",
            )}
          >
            Voir le commentaire →
          </button>
        </div>
      </div>

      {/* Index marker */}
      <span
        className={cn(
          "absolute bottom-4 right-4 font-mono text-[10px] transition-colors duration-300 z-10",
          isActive ? "text-accent" : "text-white/30",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Corner line */}
      <div
        className={cn(
          "absolute top-0 right-0 w-12 h-12 transition-all duration-500 z-10",
          isActive ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="absolute top-0 right-0 w-full h-[1px] bg-accent" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-accent" />
      </div>
    </article>
  )
}
