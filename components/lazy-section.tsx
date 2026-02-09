"use client"

import { useRef, useState, useEffect, type ReactNode } from "react"

interface LazySectionProps {
  children: ReactNode
  /** How far before the section enters viewport to start loading (px) */
  rootMargin?: string
  /** Minimum height placeholder to prevent layout shift */
  minHeight?: string
  /** CSS class for the wrapper */
  className?: string
  /** Fade-in animation duration in ms */
  fadeDuration?: number
}

export function LazySection({
  children,
  rootMargin = "200px",
  minHeight = "100px",
  className = "",
  fadeDuration = 500,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  useEffect(() => {
    if (isVisible) {
      // Small delay to let the component mount before fading in
      const timer = requestAnimationFrame(() => setHasLoaded(true))
      return () => cancelAnimationFrame(timer)
    }
  }, [isVisible])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: isVisible ? undefined : minHeight,
        opacity: hasLoaded ? 1 : 0,
        transition: `opacity ${fadeDuration}ms ease-out`,
        willChange: isVisible && !hasLoaded ? "opacity" : "auto",
      }}
    >
      {isVisible ? children : null}
    </div>
  )
}
