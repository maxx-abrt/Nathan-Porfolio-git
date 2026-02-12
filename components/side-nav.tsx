// Navigation latérale fixe à gauche de la page d'accueil
// Affiche des points de navigation correspondant à chaque section
// Utilise l'IntersectionObserver pour détecter la section active au scroll
// Le label de chaque point apparaît au survol

"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

// Définition des sections navigables avec leur id DOM et label affiché
const navItems = [
  { id: "hero", label: "Accueil" },
  { id: "last-project", label: "Dernier projet" },
  { id: "photographies", label: "Photographies" },
  { id: "cinema-videos", label: "Cinéma/vidéos" },
  { id: "autres-projets", label: "Autres projets" },
  { id: "projets-personnels", label: "Projets personnels" },
  { id: "portfolio", label: "Portfolios" },
  { id: "cv", label: "Parcours" },
  { id: "contact", label: "Contact" },
  { id: "informations", label: "Informations" },
]

export function SideNav() {
  // Section actuellement visible dans le viewport
  const [activeSection, setActiveSection] = useState("hero")

  // Observe chaque section pour détecter laquelle est visible (à 30% de visibilité)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.15 },
    )

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  // Défilement fluide vers la section cliquée
  const scrollToSection = (id: string) => {
    const nextHash = `#${id}`
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash)
    }
    window.dispatchEvent(new HashChangeEvent("hashchange"))

    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav className="fixed left-0 top-0 z-50 h-screen w-16 md:w-20 hidden md:flex flex-col justify-center border-r border-border/30 bg-background/95">
      <div className="flex flex-col gap-4 md:gap-6 px-4">
        {navItems.map(({ id, label }) => (
          <button key={id} onClick={() => scrollToSection(id)} className="group relative flex items-center gap-3">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                activeSection === id ? "bg-accent scale-125" : "bg-muted-foreground/40 group-hover:bg-foreground/60",
              )}
            />
            <span
              className={cn(
                "absolute left-6 font-mono text-[10px] uppercase tracking-widest opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:left-8 whitespace-nowrap",
                activeSection === id ? "text-accent" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
