// Bouton de basculement entre thème clair et sombre
// Affiche une icône Soleil (mode sombre actif) ou Lune (mode clair actif)
// Attend le montage côté client avant de s'afficher pour éviter un décalage d'hydratation

"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // État de montage : empêche le rendu côté serveur pour éviter les erreurs d'hydratation
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Ne rend rien tant que le composant n'est pas monté côté client
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="group relative inline-flex items-center gap-2 border border-border/40 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent/40 transition-all duration-300"
      aria-label="Basculer le thème"
    >
      {theme === "dark" ? (
        <Sun className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-rotate-12" />
      )}
      <span className="hidden sm:inline">{theme === "dark" ? "Lumière" : "Sombre"}</span>
    </button>
  )
}
