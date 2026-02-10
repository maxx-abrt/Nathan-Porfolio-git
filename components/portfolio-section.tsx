// Section Portfolio PDF à afficher avant le parcours/expériences
// Design inspiré des cartes PDF des pages de projet
// 3 portfolios : Classe prépa Beaune, ENSAD Dijon année 1, ENSAD Dijon année 2

"use client"

import { useRef, useEffect, useState } from "react"
import { FileText, Download, Eye, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PDFViewer } from "@/components/pdf-viewer"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface PortfolioItem {
  id: string
  fileName: string
  title: string
  subtitle: string
  description: string
}

const portfolios: PortfolioItem[] = [
  {
    id: "1",
    fileName: "portfolio1",
    title: "Portfolio",
    subtitle: "Classe préparatoire",
    description: "École des Beaux-Arts, classe préparatoire (Beaune)"
  },
  {
    id: "2",
    fileName: "portfolio2",
    title: "Portfolio",
    subtitle: "ENSAD Dijon",
    description: "École nationale supérieure d'art et de design - ENSAD (Dijon), Année 1"
  },
  {
    id: "3",
    fileName: "portfolio3",
    title: "Portfolio",
    subtitle: "ENSAD Dijon",
    description: "École nationale supérieure d'art et de design - ENSAD (Dijon), Photographies et vidéos"
  }
]

function PortfolioCard({ portfolio, index }: { portfolio: PortfolioItem; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      })
    }, cardRef)

    return () => ctx.revert()
  }, [index])

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden border border-border/40 bg-card/30 transition-all duration-500",
        isHovered ? "bg-card/50 border-accent/40" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 md:p-8">
        {/* Header avec numéro et icône */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent" />
            </div>
          </div>
          
          {/* Accent décoratif en coin */}
          <div
            className={cn(
              "w-8 h-8 transition-all duration-500",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute top-0 right-0 w-full h-px bg-accent" />
            <div className="absolute top-0 right-0 w-px h-full bg-accent" />
          </div>
        </div>
        
        {/* Contenu */}
        <div className="mb-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
            {portfolio.subtitle}
          </span>
          <h3 className="font-(--font-bebas) text-3xl md:text-4xl tracking-tight mb-3">
            {portfolio.title}
          </h3>
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
            {portfolio.description}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <PDFViewer
            pdfPath={`/${portfolio.fileName}.pdf`}
            title={`${portfolio.title} — ${portfolio.subtitle}`}
            renderTrigger={(open) => (
              <button
                type="button"
                onClick={open}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-accent/40 font-mono text-[10px] uppercase tracking-widest text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Voir</span>
              </button>
            )}
          />
          
          <a
            href={`/${portfolio.fileName}.pdf`}
            download
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground font-mono text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all duration-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger</span>
          </a>
        </div>
      </div>
      
      {/* Ligne décorative en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/20 to-transparent" />
    </div>
  )
}

export function PortfolioSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="portfolio" className="relative py-16 sm:py-24 pl-4 sm:pl-6 md:pl-28 pr-4 sm:pr-6 md:pr-12">
      <div className="max-w-6xl">
        {/* En-tête de section */}
        <div ref={headerRef} className="mb-12">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent block mb-4">
            02½ / Portfolios
          </span>
          <h2 className="font-(--font-bebas) text-3xl sm:text-4xl md:text-6xl tracking-tight">
            PORTFOLIOS PDF
          </h2>
          <p className="mt-4 max-w-xl font-mono text-sm text-muted-foreground leading-relaxed">
            Téléchargez ou consultez les versions PDF des portfolios par année et/ou visée.
          </p>
        </div>
        
        {/* Grille des portfolios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio, index) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} index={index} />
          ))}
        </div>
        
        {/* Info secondaire */}
        <div className="mt-12 flex items-center gap-4">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            3 portfolios disponibles
          </span>
          <div className="h-px flex-1 max-w-xs bg-border/40" />
          <a 
            href="#work" 
            className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
          >
            <span>Voir les projets en ligne</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  )
}
