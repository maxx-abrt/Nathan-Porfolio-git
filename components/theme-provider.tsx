// Fournisseur de thème (clair/sombre) pour l'application
// Encapsule le ThemeProvider de next-themes pour centraliser la configuration
// Utilisé dans le layout racine pour envelopper toute l'application

'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

// Wrapper simple autour de NextThemesProvider, transmet toutes les props
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
