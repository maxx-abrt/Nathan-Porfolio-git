// Section Parcours / Expériences du portfolio
// Affiche les expériences professionnelles et académiques avec un alignement alterné gauche/droite
// Le dernier mot de chaque titre est mis en valeur avec le composant HighlightText
// Animations GSAP au scroll : glissement alterné depuis la gauche ou la droite

"use client"

import { useRef, useEffect, ReactNode } from "react"
import { HighlightText } from "@/components/highlight-text"
import { experiences } from "@/lib/data"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

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

export function PrinciplesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)

  // Animations GSAP au montage : titre + articles avec glissement alterné
  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !itemsRef.current) return

    const ctx = gsap.context(() => {
      // Animation du titre : glissement depuis la gauche
      gsap.from(headerRef.current, {
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })

      // Chaque expérience glisse en alternance depuis la gauche ou la droite
      const articles = itemsRef.current?.querySelectorAll("article")
      articles?.forEach((article, index) => {
        const isRight = index % 2 !== 0
        gsap.from(article, {
          x: isRight ? 80 : -80,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: article,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="cv" className="relative py-20 sm:py-32 pl-4 sm:pl-6 md:pl-28 pr-4 sm:pr-6 md:pr-12">
      {/* En-tête de la section avec numéro et titre */}
      <div ref={headerRef} className="mb-24">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">06 / Parcours</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-4xl sm:text-5xl md:text-7xl tracking-tight">EXPÉRIENCES</h2>
      </div>

      {/* Liste des expériences avec espacement et alignement alterné */}
      <div ref={itemsRef} className="space-y-24 md:space-y-32">
        {experiences.map((exp, index) => {
          const align = index % 2 === 0 ? "left" : "right"
          const titleWords = exp.title.split(" ")
          const highlightWord = titleWords[titleWords.length - 1]
          const restWords = titleWords.slice(0, -1).join(" ")

          return (
            <article
              key={index}
              className={`flex flex-col ${
                align === "right" ? "items-end text-right" : "items-start text-left"
              }`}
            >
              {/* Label annoté avec numéro et période */}
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
                {String(index + 1).padStart(2, "0")} / {exp.period}
              </span>

              <h3 className="font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-8xl tracking-tight leading-none">
                {restWords && <span>{restWords} </span>}
                <HighlightText parallaxSpeed={0.6}>
                  {highlightWord}
                </HighlightText>
              </h3>

              {/* Lieu de l'expérience */}
              <span className="mt-4 font-mono text-[10px] uppercase tracking-widest text-accent/70">
                {exp.place}
              </span>

              {/* Description détaillée */}
              <p className="mt-4 max-w-md font-mono text-sm text-muted-foreground leading-relaxed">
                {parseMarkdown(exp.description)}
              </p>

              {/* Ligne décorative séparatrice */}
              <div className={`mt-8 h-[1px] bg-border w-24 md:w-48 ${align === "right" ? "mr-0" : "ml-0"}`} />
            </article>
          )
        })}
      </div>
    </section>
  )
}
