// Menu de navigation mobile - discret et artistique
// Bouton hamburger minimal qui ouvre un overlay avec texture grain
// Utilise les mêmes items de navigation que SideNav

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { id: "hero", label: "Accueil" },
  { id: "last-project", label: "Dernier projet" },
  { id: "photographies", label: "Photographies" },
  { id: "cinema-videos", label: "Cinéma/vidéos" },
  { id: "autres-projets", label: "Autres projets" },
  { id: "portfolio", label: "Portfolios" },
  { id: "cv", label: "Parcours" },
  { id: "contact", label: "Contact" },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [isPdfOpen, setIsPdfOpen] = useState(false)
  const router = useRouter()

  // Observe sections pour highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3 },
    )

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  // Lock scroll quand menu ouvert
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
    const handlePdfToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ isOpen: boolean }>
      setIsPdfOpen(Boolean(customEvent.detail?.isOpen))
    }
    setIsPdfOpen(document.body.classList.contains("pdf-viewer-open"))
    window.addEventListener("pdf-viewer-toggle", handlePdfToggle)
    return () => window.removeEventListener("pdf-viewer-toggle", handlePdfToggle)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    } else {
      // Navigate to home page with hash
      router.push(`/#${id}`)
    }
    setIsOpen(false)
  }

  return (
    <>
      {/* Bouton trigger - hautement visible */}
      {!isPdfOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "fixed top-5 left-3 z-100 md:hidden flex items-center gap-2 px-3 py-2.5 rounded-md border border-foreground/20 shadow-lg transition-all duration-300",
            isOpen 
              ? "bg-background border-accent" 
              : "bg-background"
          )}
          style={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <div className="flex flex-col gap-[5px]">
            <span
              className={cn(
                "w-5 h-[2px] bg-foreground transition-all duration-300",
                isOpen && "rotate-45 translate-y-[3.5px]"
              )}
            />
            <span
              className={cn(
                "w-3 h-[2px] bg-foreground transition-all duration-300",
                isOpen && "opacity-0 w-0"
              )}
            />
            <span
              className={cn(
                "w-5 h-[2px] bg-foreground transition-all duration-300",
                isOpen && "-rotate-45 -translate-y-[3.5px]"
              )}
            />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-foreground">
            {isOpen ? "Fermer" : "Menu"}
          </span>
        </button>
      )}

      {/* Overlay menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-99 md:hidden"
          >
            {/* Fond avec texture grain */}
            <div 
              className="absolute inset-0 bg-background"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: "200px 200px",
                opacity: 0.08,
              }}
            />
            
            {/* Contenu menu */}
            <motion.nav
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative h-full flex flex-col justify-start px-6 pt-16 pb-20 bg-background"
            >
              {/* Numéro de section courante - accent artistique */}
              <div className="mb-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Navigation
                </span>
                <div className="mt-2 font-(--font-bebas) text-4xl text-accent/20">
                  {String(navItems.findIndex(i => i.id === activeSection) + 1).padStart(2, "0")}
                </div>
              </div>

              {/* Items de navigation */}
              <div className="flex flex-col gap-1">
                {navItems.map(({ id, label }, index) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={cn(
                      "group flex items-baseline gap-2 py-1.5 text-left transition-all duration-300",
                      activeSection === id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="font-mono text-[10px] text-accent/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={cn(
                      "font-(--font-bebas) text-[1.6rem] tracking-tight transition-all duration-300",
                      activeSection === id && "text-accent"
                    )}>
                      {label}
                    </span>
                    {activeSection === id && (
                      <motion.span
                        layoutId="activeIndicator"
                        className="ml-auto w-8 h-px bg-accent shrink-0"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Ligne décorative en bas */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="h-px bg-border/50 w-full" />
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Nathan Dumont
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    2026
                  </span>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
