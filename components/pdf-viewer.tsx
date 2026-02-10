// PDF Viewer component for displaying portfolio PDF
// Shows a modal with embedded PDF viewer and download option

"use client"

import { useState, useEffect, useMemo, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { X, Download, FileText, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface PDFViewerProps {
  pdfPath: string
  title?: string
  buttonClassName?: string
  renderTrigger?: (open: () => void) => ReactNode
}

export function PDFViewer({
  pdfPath,
  title = "Portfolio PDF",
  buttonClassName,
  renderTrigger,
}: PDFViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const previewUrl = useMemo(() => {
    return pdfPath
  }, [pdfPath])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setIsOpen(true))
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors duration-200",
            buttonClassName || "text-muted-foreground hover:text-accent"
          )}
        >
          <Eye className="w-4 h-4" />
          <span>Voir le portfolio PDF</span>
        </button>
      )}

      {/* Modal */}
      {isMounted && isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
            <button
              type="button"
              aria-label="Fermer"
              className="absolute inset-0 cursor-default"
              onClick={() => setIsOpen(false)}
            />
            <div className="relative w-full max-w-6xl h-[92vh] sm:h-[90vh] flex flex-col bg-card/95 border border-border/60 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border/70 bg-card/90">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-accent" />
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-medium truncate">{title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 border border-border/60 text-foreground/90 font-mono text-[10px] uppercase tracking-widest hover:border-accent/60 hover:text-accent transition-colors rounded-md"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ouvrir
                  </a>
                  <a
                    href={pdfPath}
                    download
                    className="inline-flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground font-mono text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-colors rounded-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 bg-muted/40">
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title={title}
                />
              </div>

              {/* Footer with info */}
              <div className="px-4 sm:px-6 py-3 border-t border-border/70 bg-card/90">
                <p className="font-mono text-[10px] text-muted-foreground">
                  Astuce: utilisez “Ouvrir” pour un aperçu plein écran si nécessaire.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
