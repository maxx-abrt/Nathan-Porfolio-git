// PDF Viewer component for displaying portfolio PDF
// Shows a modal with embedded PDF viewer and download option

"use client"

import { useState, useEffect } from "react"
import { X, Download, FileText, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface PDFViewerProps {
  pdfPath: string
  title?: string
  buttonClassName?: string
}

export function PDFViewer({ pdfPath, title = "Portfolio PDF", buttonClassName }: PDFViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

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

  return (
    <>
      {/* Button to open PDF viewer */}
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

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-6xl h-[90vh] flex flex-col bg-card rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent" />
                <span className="font-mono text-sm font-medium">{title}</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Download button */}
                <a
                  href={pdfPath}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest hover:bg-accent/90 transition-colors rounded"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </a>
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-muted">
              <iframe
                src={pdfPath}
                className="w-full h-full"
                title={title}
              />
            </div>

            {/* Footer with info */}
            <div className="px-6 py-3 border-t border-border bg-card">
              <p className="font-mono text-[10px] text-muted-foreground">
                Si le PDF ne s&apos;affiche pas, vous pouvez le télécharger avec le bouton ci-dessus.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
