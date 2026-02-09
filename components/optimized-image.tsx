"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  /** Additional wrapper class */
  wrapperClassName?: string
  /** Loading strategy: eager for above-fold, lazy for below-fold */
  loading?: "lazy" | "eager"
  /** Object-fit style */
  objectFit?: "cover" | "contain"
  /** Fade-in duration in ms */
  fadeDuration?: number
  /** Responsive sizes hint for the browser */
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  loading = "lazy",
  objectFit = "cover",
  fadeDuration = 400,
  sizes,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(loading === "eager")
  const imgRef = useRef<HTMLImageElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver for truly lazy images — only load when near viewport
  useEffect(() => {
    if (loading === "eager") {
      setIsInView(true)
      return
    }

    const el = wrapperRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "300px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [loading])

  // Check if image is already cached (loaded instantly)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setIsLoaded(true)
    }
  }, [isInView])

  return (
    <div
      ref={wrapperRef}
      className={cn("overflow-hidden", wrapperClassName)}
    >
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          sizes={sizes}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            className,
            objectFit === "cover" ? "object-cover" : "object-contain",
            "transition-opacity ease-out",
          )}
          style={{
            opacity: isLoaded ? 1 : 0,
            transitionDuration: `${fadeDuration}ms`,
          }}
        />
      )}
    </div>
  )
}
