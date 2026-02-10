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
  /** Section ids that should force mount when the hash matches */
  anchorIds?: string[]
}

export function LazySection({
  children,
  rootMargin = "200px",
  minHeight = "100px",
  className = "",
  fadeDuration = 500,
  anchorIds = [],
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const pendingAnchorRef = useRef<string | null>(null)

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
    if (anchorIds.length === 0) return
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash && anchorIds.includes(hash)) {
        pendingAnchorRef.current = hash
        setIsVisible(true)
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [anchorIds])

  useEffect(() => {
    if (isVisible) {
      // Small delay to let the component mount before fading in
      const timer = requestAnimationFrame(() => setHasLoaded(true))
      return () => cancelAnimationFrame(timer)
    }
  }, [isVisible])

  useEffect(() => {
    const anchorId = pendingAnchorRef.current
    if (!anchorId || !isVisible) return

    let attempts = 0
    const attemptScroll = () => {
      const target = document.getElementById(anchorId)
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" })
        pendingAnchorRef.current = null
        return
      }
      attempts += 1
      if (attempts < 10) {
        setTimeout(attemptScroll, 120)
      }
    }

    attemptScroll()
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
