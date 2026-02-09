// Chargeur de séries photo côté serveur (Node.js uniquement)
// Lit le système de fichiers pour découvrir automatiquement les séries et leurs photos.
//
// Structure attendue dans public/series/{slug}/ :
//   - series.json : métadonnées de la série + informations par photo
//   - *.webp : fichiers images réels
//
// Logique de découverte :
//   - Les fichiers .webp sont auto-détectés par scan du dossier
//   - Si un .webp a une entrée correspondante dans photos{} du JSON, ses métadonnées sont utilisées
//   - Si un .webp n'a pas d'entrée JSON, il apparaît quand même avec le nom de fichier comme titre
//   - Si une entrée JSON n'a pas de fichier .webp correspondant, un placeholder SVG est généré

import fs from "fs"
import path from "path"
import type { Photo, Series, PDFFile, VideoFile, AudioFile } from "./data"

// Normalise une chaîne en NFC pour éviter les problèmes NFD/NFC sur macOS
function nfc(s: string): string {
  return s.normalize("NFC")
}

// Convertit un texte en slug URL-safe (ASCII, minuscules, tirets)
// Élimine tous les problèmes d'encodage Unicode (NFD/NFC) dans les URLs
function slugify(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/æ/g, "ae")
    .replace(/[ç]/g, "c")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[ñ]/g, "n")
    .replace(/[òóôõö]/g, "o")
    .replace(/œ/g, "oe")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ýÿ]/g, "y")
    .replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Slugifie un chemin multi-segments (préserve la hiérarchie /)
function slugifyPath(fsPath: string): string {
  return fsPath.split("/").map(slugify).join("/")
}

// Encode chaque segment d'un chemin pour utilisation dans les URLs (src, href)
// Préserve les / comme séparateurs de chemin
function encodePathForUrl(filePath: string): string {
  return filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

// Chemin absolu vers le répertoire contenant tous les dossiers de séries
const SERIES_DIR = path.join(process.cwd(), "public", "series")

// Map slug URL-safe → chemin NFC du filesystem (peuplé par findSeriesDirs)
const slugToFsPath = new Map<string, string>()

// Interface décrivant le schéma JSON attendu dans chaque fichier series.json
interface SeriesJson {
  title?: string
  description?: string
  medium?: string
  year?: string
  link?: string
  linkText?: string
  cover?: string
  bigger?: string // Image to display as the large "Couverture" in project detail
  pdfs?: Record<
    string,
    {
      title?: string
      description?: string
    }
  >
  videos?: Record<
    string,
    {
      title?: string
      description?: string
      thumbnail?: string
      duration?: string
    }
  >
  audios?: Record<
    string,
    {
      title?: string
      description?: string
      duration?: string
    }
  >
  photos?: Record<
    string,
    {
      title?: string
      intentionNote?: string
      technical?: string
      date?: string
      width?: number
      height?: number
    }
  >
}

// Génère un SVG placeholder encodé en data URI (affiché quand aucun fichier .webp n'existe)
// Crée un rectangle coloré avec les dimensions affichées au centre
function placeholderSvg(w: number, h: number, hue: number): string {
  const bg = `hsl(${hue}, 15%, ${30 + ((hue * 7) % 15)}%)`
  return (
    `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'%3E` +
    `%3Crect width='${w}' height='${h}' fill='${encodeURIComponent(bg)}'/%3E` +
    `%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' ` +
    `fill='%23888' font-family='monospace' font-size='14'%3E${w}×${h}%3C/text%3E%3C/svg%3E`
  )
}

// Normalise un nom de fichier pour la correspondance avec les clés JSON
// Ex: "Corps 01" → "corps01", "corps01" → "corps01"
function normalizePhotoName(name: string): string {
  return name.toLowerCase().replace(/[\s_-]+/g, "")
}

// Détermine l'orientation d'une photo selon le ratio largeur/hauteur
function orientationOf(w: number, h: number): "landscape" | "portrait" | "square" {
  const ratio = w / h
  if (ratio > 1.05) return "landscape"
  if (ratio < 0.95) return "portrait"
  return "square"
}

// Charge une série unique à partir de son slug URL-safe
// Retourne null si le dossier n'existe pas ou ne contient pas de médias
export function getSeriesBySlug(slug: string): Series | null {
  // S'assurer que la map slug→fsPath est peuplée
  if (slugToFsPath.size === 0) {
    findSeriesDirs(SERIES_DIR)
  }

  // Trouver le chemin filesystem correspondant au slug
  const nfcPath = slugToFsPath.get(slug)
  if (!nfcPath) return null

  // Résoudre le chemin réel sur le disque (le filesystem peut utiliser NFD)
  const resolvedDir = resolveSeriesPath(nfcPath)
  if (!resolvedDir) return null
  const seriesDir = resolvedDir

  // nfcPath est utilisé pour les chemins src (pointant vers les fichiers réels)
  // slug est utilisé pour le routage URL

  const jsonPath = path.join(seriesDir, "series.json")
  let json: SeriesJson = {}

  // Charger le JSON s'il existe
  if (fs.existsSync(jsonPath)) {
    try {
      json = JSON.parse(fs.readFileSync(jsonPath, "utf-8"))
    } catch {
      console.error(`[series-loader] Failed to parse ${jsonPath}`)
    }
  }

  // Découverte des fichiers .webp présents sur le disque
  const webpFiles: string[] = fs.existsSync(seriesDir)
    ? fs.readdirSync(seriesDir).filter((f) => f.endsWith(".webp")).sort()
    : []

  // Découverte des fichiers vidéo présents sur le disque (.mp4, .mov, .webm)
  const videoExtensions = [".mp4", ".mov", ".webm"]
  const videoFiles: string[] = fs.existsSync(seriesDir)
    ? fs.readdirSync(seriesDir).filter((f) => videoExtensions.some((ext) => f.toLowerCase().endsWith(ext))).sort()
    : []

  // Découverte des fichiers audio présents sur le disque (.mp3, .wav, .m4a, .ogg)
  const audioExtensions = [".mp3", ".wav", ".m4a", ".ogg", ".aac"]
  const audioFiles: string[] = fs.existsSync(seriesDir)
    ? fs.readdirSync(seriesDir).filter((f) => audioExtensions.some((ext) => f.toLowerCase().endsWith(ext))).sort()
    : []

  // Si pas de JSON et pas de médias, ce n'est pas une série valide
  const hasAnyMedia = webpFiles.length > 0 || videoFiles.length > 0 || audioFiles.length > 0
  if (!fs.existsSync(jsonPath) && !hasAnyMedia) return null

  // Découverte des fichiers PDF présents sur le disque
  const pdfFiles: string[] = fs.existsSync(seriesDir)
    ? fs.readdirSync(seriesDir).filter((f) => f.endsWith(".pdf")).sort()
    : []

  // Ensemble des noms déjà traités pour éviter les doublons
  const handledNames = new Set<string>()

  // Construction des fichiers PDF à partir des fichiers réels
  // src utilise nfcPath (chemin filesystem réel), slug est pour le routage
  const pdfs: PDFFile[] = pdfFiles.map((file) => {
    const name = nfc(file.replace(/\.pdf$/, ""))
    const meta = json.pdfs?.[name]
    return {
      id: `${slug}-${name}`,
      src: encodePathForUrl(`/series/${nfcPath}/${nfc(file)}`),
      title: meta?.title ?? name,
      description: meta?.description,
    }
  })

  // Construction des fichiers vidéo à partir des fichiers réels
  const videos: VideoFile[] = videoFiles.map((file) => {
    const name = nfc(file.replace(/\.(mp4|mov|webm)$/i, ""))
    const meta = json.videos?.[name]
    return {
      id: `${slug}-${name}`,
      src: encodePathForUrl(`/series/${nfcPath}/${nfc(file)}`),
      title: meta?.title ?? name,
      description: meta?.description,
      thumbnail: meta?.thumbnail,
      duration: meta?.duration,
    }
  })

  // Construction des fichiers audio à partir des fichiers réels
  const audios: AudioFile[] = audioFiles.map((file) => {
    const name = nfc(file.replace(/\.(mp3|wav|m4a|ogg|aac)$/i, ""))
    const meta = json.audios?.[name]
    return {
      id: `${slug}-${name}`,
      src: encodePathForUrl(`/series/${nfcPath}/${nfc(file)}`),
      title: meta?.title ?? name,
      description: meta?.description,
      duration: meta?.duration,
    }
  })
  const normalizedJsonKeys = new Map<string, string>()
  if (json.photos) {
    for (const key of Object.keys(json.photos)) {
      normalizedJsonKeys.set(normalizePhotoName(key), key)
    }
  }

  // 1. Construction des photos à partir des fichiers .webp réels
  const photos: Photo[] = webpFiles.map((file, idx) => {
    const name = nfc(file.replace(/\.webp$/, ""))
    const normalized = normalizePhotoName(name)
    // Recherche de la clé JSON correspondante via le nom normalisé
    const jsonKey = normalizedJsonKeys.get(normalized) ?? name
    handledNames.add(jsonKey)
    const meta = json.photos?.[jsonKey]
    const w = meta?.width ?? 1200
    const h = meta?.height ?? 800
    return {
      id: `${slug}-${name}`,
      src: encodePathForUrl(`/series/${nfcPath}/${nfc(file)}`),
      alt: meta?.title ?? name,
      width: w,
      height: h,
      orientation: orientationOf(w, h),
      seriesId: slug,
      intentionNote: meta?.intentionNote,
      technical: meta?.technical,
      date: meta?.date,
    }
  })

  // 2. Photos déclarées dans le JSON mais sans fichier .webp → génération de placeholders
  if (json.photos) {
    let hueBase = 210
    Object.entries(json.photos).forEach(([name, meta]) => {
      if (handledNames.has(name)) return
      const w = meta.width ?? 1200
      const h = meta.height ?? 800
      photos.push({
        id: `${slug}-${name}`,
        src: placeholderSvg(w, h, hueBase),
        alt: meta.title ?? name,
        width: w,
        height: h,
        orientation: orientationOf(w, h),
        seriesId: slug,
        intentionNote: meta.intentionNote,
        technical: meta.technical,
        date: meta.date,
      })
      hueBase += 12
    })
  }

  // Extraction du nom de la série depuis le chemin filesystem (dernier segment)
  const fsParts = nfcPath.split(/[/\\]/)
  const folderName = fsParts[fsParts.length - 1] ?? nfcPath

  // Utiliser le titre du JSON ou le nom du dossier
  const seriesTitle = json.title ?? folderName
  const seriesMedium = json.medium ?? ""
  const seriesYear = json.year ?? ""
  const seriesDescription = json.description ?? ""
  const seriesLink = json.link
  const seriesLinkText = json.linkText

  // Détermination de l'index de la photo de couverture
  const coverPhotoId = json.cover ? `${slug}-${json.cover}` : null
  const coverIndex = coverPhotoId
    ? Math.max(0, photos.findIndex((p) => p.id === coverPhotoId))
    : 0

  // Détermination de l'index de la photo "bigger" (grande couverture)
  // Si non spécifié, utilise la couverture par défaut
  const biggerPhotoId = json.bigger ? `${slug}-${json.bigger}` : null
  const biggerIndex = biggerPhotoId
    ? Math.max(0, photos.findIndex((p) => p.id === biggerPhotoId))
    : coverIndex

  return {
    id: slug,
    slug,
    title: seriesTitle,
    description: seriesDescription,
    medium: seriesMedium,
    year: seriesYear,
    link: seriesLink,
    linkText: seriesLinkText,
    coverIndex,
    biggerIndex,
    photos,
    pdfFiles: pdfs.length > 0 ? pdfs : undefined,
    videoFiles: videos.length > 0 ? videos : undefined,
    audioFiles: audios.length > 0 ? audios : undefined,
    hasJson: fs.existsSync(jsonPath), // Track if series has a JSON file
  }
}

// Résout un chemin NFC vers le chemin réel sur le disque (qui peut être NFD sur macOS)
// Parcourt segment par segment en comparant les noms normalisés NFC
function resolveSeriesPath(nfcSlug: string): string | null {
  if (!nfcSlug) return null

  const segments = nfcSlug.split("/")
  let currentDir = SERIES_DIR

  for (const segment of segments) {
    if (!fs.existsSync(currentDir)) return null
    const entries = fs.readdirSync(currentDir)
    // Trouver l'entrée dont le nom NFC correspond au segment demandé
    const match = entries.find((e) => nfc(e) === segment)
    if (!match) return null
    currentDir = path.join(currentDir, match)
  }

  // Vérifier que le chemin final existe et est un dossier
  if (!fs.existsSync(currentDir) || !fs.statSync(currentDir).isDirectory()) return null
  return currentDir
}

// Récursivement trouve tous les dossiers contenant des séries (avec series.json ou médias)
// Retourne des slugs URL-safe et peuple la map slugToFsPath
function findSeriesDirs(baseDir: string, currentPath: string = ""): string[] {
  const fullPath = path.join(baseDir, currentPath)
  if (!fs.existsSync(fullPath)) return []

  const entries = fs.readdirSync(fullPath, { withFileTypes: true })
  const results: string[] = []

  // Vérifier si ce dossier contient une série (series.json ou fichiers médias)
  const hasJson = entries.some((e) => e.isFile() && e.name === "series.json")
  const hasWebp = entries.some((e) => e.isFile() && e.name.endsWith(".webp"))
  const hasVideo = entries.some((e) => e.isFile() && /\.(mp4|mov|webm)$/i.test(e.name))
  const hasAudio = entries.some((e) => e.isFile() && /\.(mp3|wav|m4a|ogg|aac)$/i.test(e.name))
  const hasPDF = entries.some((e) => e.isFile() && e.name.endsWith(".pdf"))

  // C'est une série si : il y a un JSON, ou des médias (mais pas que des PDF)
  if (hasJson || hasWebp || hasVideo || hasAudio) {
    const nfcPath = nfc(currentPath)
    const urlSlug = slugifyPath(nfcPath)
    // Enregistrer le mapping slug → chemin filesystem NFC
    slugToFsPath.set(urlSlug, nfcPath)
    results.push(urlSlug)
  }

  // Explorer les sous-dossiers récursivement
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "Icon" && !entry.name.startsWith("Icon\r")) {
      // Utiliser le nom réel du filesystem pour le chemin
      const subPath = currentPath ? `${currentPath}/${entry.name}` : entry.name
      results.push(...findSeriesDirs(baseDir, subPath))
    }
  }

  return results
}

// Charge toutes les séries trouvées dans public/series/ (récursivement)
export function getAllSeries(): Series[] {
  if (!fs.existsSync(SERIES_DIR)) return []

  const slugs = findSeriesDirs(SERIES_DIR)

  const results: Series[] = []
  for (const slug of slugs) {
    const s = getSeriesBySlug(slug)
    if (s) results.push(s)
  }
  return results
}
