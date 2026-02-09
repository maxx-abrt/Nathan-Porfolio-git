// Fichier de définition des types TypeScript et des données statiques du portfolio
// Contient les interfaces Photo, Series, Experience et les données d'expériences professionnelles

// Interface décrivant une photo individuelle dans une série
export interface Photo {
  id: string
  src: string
  alt: string
  width: number
  height: number
  orientation: "landscape" | "portrait" | "square"
  seriesId: string
  intentionNote?: string
  technical?: string
  date?: string
}

// Interface décrivant une série photographique complète
export interface Series {
  id: string
  slug: string
  title: string
  description: string
  medium: string
  year: string
  link?: string
  linkText?: string
  photos: Photo[]
  coverIndex: number
  biggerIndex: number // Index of the large "Couverture" image in project detail
  pdfFiles?: PDFFile[]
  videoFiles?: VideoFile[]
  audioFiles?: AudioFile[]
  hasJson: boolean // Indicates if this series has a series.json file
}

// Interface décrivant un fichier PDF attaché à une série
export interface PDFFile {
  id: string
  src: string
  title: string
  description?: string
}

// Interface décrivant un fichier vidéo attaché à une série
export interface VideoFile {
  id: string
  src: string
  title: string
  description?: string
  thumbnail?: string
  duration?: string
}

// Interface décrivant un fichier audio attaché à une série
export interface AudioFile {
  id: string
  src: string
  title: string
  description?: string
  duration?: string
}

// Interface décrivant une expérience professionnelle ou académique
export interface Experience {
  period: string
  title: string
  place: string
  description: string
}

// Données statiques des expériences affichées dans la section Parcours
export const experiences: Experience[] = [
  {
    period: "2025 - 2026",
    title: "Étudiant, deuxième année",
    place: "École nationale supérieure d'art et de design - ENSAD (Dijon)",
    description: "Cursus Art avec **ARC (Atelier de Recherche et Création) documentaire** : *Filmer aux limites*, **option vidéo** : *construction vidéo* et **option photographie** : *fragment d'un lieu familier*."
  },
  {
  period: "2024 - 2025",
    title: "Étudiant, première année",
    place: "École nationale supérieure d'art et de design - ENSAD (Dijon)",
    description: "Cursus général art et design d'espace. "
  },
    {

    period: "2024",
    title: "Créateur de contenus audiovisuels",
    place: "Beaune",
    description: "Création de contenus pour les réseaux sociaux de l'artiste beaunois __Patrick Cambolin__.",
  },
  {
    period: "2024",
    title: "Designer graphique",
    place: "Beaune",
    description: "Création de l'affiche publicitaire pour l'évènement beaunois *Les Vinéales* en colaboration avec les étudiants du BTS technico-commercial du lycée viticole de Beaune.",
  },
  {
    period: "2023 - 2024",
    title: "Étudiant",
    place: "École des Beaux-Arts, classe préparatoire (Beaune)",
    description: "Cursus préparatoire aux grandes écoles des Beaux-Arts.",
  },
]
