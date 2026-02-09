// Hook personnalisé pour détecter si l'appareil est mobile
// Utilise l'API matchMedia pour écouter les changements de taille de fenêtre
// Retourne true si la largeur est inférieure au breakpoint mobile (768px)

import * as React from 'react'

// Seuil de largeur en pixels en dessous duquel l'appareil est considéré comme mobile
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // undefined au départ (rendu serveur), puis booléen après le montage
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Création d'une media query pour surveiller le breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // Écoute des changements de taille et détection initiale
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  // Conversion en booléen (false si undefined)
  return !!isMobile
}
