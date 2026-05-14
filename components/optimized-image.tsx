"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
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
  /** Priority loading for above-fold images */
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  wrapperClassName = "",
  loading = "lazy",
  objectFit = "cover",
  fadeDuration = 400,
  sizes,
  priority,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const isExternal = src.startsWith("http") || src.startsWith("//")
  const isDataUri = src.startsWith("data:")
  const useNative = isExternal || isDataUri || (!fill && (!width || !height))

  const baseClass = cn(
    className,
    objectFit === "cover" ? "object-cover" : "object-contain",
    "transition-opacity ease-out",
    isLoaded ? "opacity-100" : "opacity-0",
  )

  const transitionStyle = { transitionDuration: `${fadeDuration}ms` } as React.CSSProperties

  if (useNative) {
    return (
      <div className={cn("overflow-hidden", wrapperClassName)}>
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={baseClass}
          style={transitionStyle}
        />
      </div>
    )
  }

  if (fill) {
    return (
      <div className={cn("overflow-hidden relative", wrapperClassName)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? "eager" : loading}
          sizes={sizes}
          onLoad={() => setIsLoaded(true)}
          className={baseClass}
          style={transitionStyle}
        />
      </div>
    )
  }

  return (
    <div className={cn("overflow-hidden", wrapperClassName)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={priority ? "eager" : loading}
        sizes={sizes}
        onLoad={() => setIsLoaded(true)}
        className={baseClass}
        style={transitionStyle}
      />
    </div>
  )
}
