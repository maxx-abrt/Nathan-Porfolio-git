// Section "Dernier projet" — met en avant la dernière série marquée dans le JSON
// Affiche une carte à deux écrans (couverture + description) avec navigation par points

"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import type { Series } from "@/lib/data"
import { OptimizedImage } from "@/components/optimized-image"

function parseLine(line: string): ReactNode[] {
  const parts: ReactNode[] = []
  let remaining = line
  let key = 0

  while (remaining.length > 0) {
    const boldIdx = remaining.indexOf("**")
    const underlineIdx = remaining.indexOf("__")
    const italicIdx = remaining.indexOf("*")

    let firstIdx = Infinity
    let patternType: "bold" | "underline" | "italic" | null = null

    if (boldIdx !== -1 && boldIdx < firstIdx) {
      firstIdx = boldIdx
      patternType = "bold"
    }
    if (underlineIdx !== -1 && underlineIdx < firstIdx) {
      firstIdx = underlineIdx
      patternType = "underline"
    }
    if (italicIdx !== -1 && italicIdx < firstIdx) {
      if (remaining.substring(italicIdx, italicIdx + 2) !== "**") {
        firstIdx = italicIdx
        patternType = "italic"
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
    let content = ""
    let skipLength = 0

    if (patternType === "bold") {
      closeIdx = remaining.indexOf("**", firstIdx + 2)
      if (closeIdx !== -1) {
        content = remaining.substring(firstIdx + 2, closeIdx)
        parts.push(
          <strong key={key++} className="text-foreground font-semibold">
            {parseLine(content)}
          </strong>,
        )
        skipLength = closeIdx + 2
      }
    } else if (patternType === "underline") {
      closeIdx = remaining.indexOf("__", firstIdx + 2)
      if (closeIdx !== -1) {
        content = remaining.substring(firstIdx + 2, closeIdx)
        parts.push(
          <span key={key++} className="underline underline-offset-2">
            {parseLine(content)}
          </span>,
        )
        skipLength = closeIdx + 2
      }
    } else if (patternType === "italic") {
      closeIdx = remaining.indexOf("*", firstIdx + 1)
      if (closeIdx !== -1) {
        content = remaining.substring(firstIdx + 1, closeIdx)
        parts.push(
          <em key={key++} className="italic">
            {parseLine(content)}
          </em>,
        )
        skipLength = closeIdx + 1
      }
    }

    if (closeIdx === -1) {
      parts.push(remaining.substring(firstIdx))
      break
    }

    remaining = remaining.substring(skipLength)
  }

  return parts
}

function parseMarkdownPreview(text: string, maxLength: number) {
  if (!text) return null

  const normalizedText = text.replace(/\\n/g, "\n")
  const lines = normalizedText.split("\n")
  const previewLines: ReactNode[] = []
  let currentLength = 0

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (currentLength + line.length > maxLength && previewLines.length > 0) {
      break
    }

    if (i > 0) {
      previewLines.push(<br key={`br-${i}`} />)
      currentLength += 1
    }

    previewLines.push(<span key={`line-${i}`}>{parseLine(line)}</span>)
    currentLength += line.length

    if (currentLength >= maxLength) {
      break
    }
  }

  const isTruncated = normalizedText.length > maxLength

  return (
    <>
      {previewLines}
      {isTruncated && <span>…</span>}
    </>
  )
}

export function LastProjectSection({ series }: { series: Series }) {
  const coverPhoto = series.photos[series.coverIndex] ?? series.photos[0]
  const [activeSlide, setActiveSlide] = useState(0)
  if (!coverPhoto) return null

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0))
    }, 9000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      id="last-project"
      className="relative pt-10 sm:pt-14 pb-10 sm:pb-12 pl-4 sm:pl-6 md:pl-28 pr-4 sm:pr-6 md:pr-12"
    >
      <div className="mb-6 sm:mb-8 max-w-3xl">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          Dernier projet
        </span>
        <h2 className="mt-3 font-(--font-bebas) text-3xl md:text-5xl tracking-tight">
          DERNIER PROJET
        </h2>
       
      </div>

      <div className="max-w-5xl">
        <div className="group last-project relative overflow-hidden border border-border/40 bg-card/30">
          <div
            className="flex w-[200%] min-h-[220px] sm:min-h-[250px] transition-transform duration-700 ease-in-out"
            style={{ transform: activeSlide === 0 ? "translateX(0)" : "translateX(-50%)" }}
          >
          <div className="relative w-1/2">
            <div className="relative aspect-16/7 sm:aspect-16/6 overflow-hidden">
              <OptimizedImage
                src={coverPhoto.src}
                alt={coverPhoto.alt}
                className="w-full h-full object-cover object-center"
                wrapperClassName="w-full h-full"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-accent/70">
                    {series.medium} · {series.year}
                  </span>
                  <h3 className="mt-2 font-(--font-bebas) text-3xl sm:text-4xl text-white">
                    {series.title}
                  </h3>
                </div>
                <Link
                  href={`/series/${series.slug}`}
                  className="inline-flex w-fit items-center gap-2 border border-white/30 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white hover:border-accent hover:text-accent transition-colors"
                >
                  Aller au projet
                  <span className="text-accent">→</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="w-1/2 flex flex-col justify-between p-5 sm:p-6 md:p-8">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                Focus
              </span>
              <h3 className="mt-2 font-(--font-bebas) text-2xl sm:text-3xl tracking-tight">
                {series.title}
              </h3>
              <p className="mt-3 font-mono text-xs text-muted-foreground leading-relaxed">
                {parseMarkdownPreview(series.description, 220)}
              </p>
            </div>
            <Link
              href={`/series/${series.slug}`}
              className="mt-4 inline-flex w-fit items-center gap-2 border border-foreground/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              Aller au projet
              <span className="text-accent">→</span>
            </Link>
          </div>
        </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          {[0, 1].map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={index === 0 ? "Voir la couverture" : "Voir la description"}
              className={
                "h-2 w-2 rounded-full border transition-colors " +
                (activeSlide === index ? "border-accent bg-accent" : "border-border/60 bg-transparent")
              }
            />
          ))}
        </div>
      </div>

    </section>
  )
}
