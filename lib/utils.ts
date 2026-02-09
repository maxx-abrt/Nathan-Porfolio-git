// Utilitaire de fusion de classes CSS
// Combine clsx (concaténation conditionnelle) et tailwind-merge (résolution des conflits Tailwind)
// Utilisé dans tout le projet pour composer proprement les classes CSS dynamiques

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Fusionne et déduplique les classes Tailwind en gérant les conflits de priorité
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
