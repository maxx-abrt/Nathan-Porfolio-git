# PDF Support for Portfolio Projects

This portfolio now supports attaching PDF documents to individual projects/series.

## How it Works

1. **Place PDF files** in your project folder: `public/series/{slug}/`
2. **Reference them** in the `series.json` file under the `pdfs` key
3. **View them** on the project page - they appear in a "Documents" section below the photos

## series.json Schema

```json
{
  "title": "Your Project Title",
  "description": "Project description...",
  "medium": "Photographie numérique & Documents",
  "year": "2024",
  "cover": "cover-photo-id",
  "pdfs": {
    "filename-without-extension": {
      "title": "Display Title",
      "description": "Optional description of the document"
    }
  },
  "photos": { ... }
}
```

## Example Structure

```
public/series/
└── mon-projet/
    ├── series.json          # Metadata including PDF references
    ├── photo1.webp
    ├── photo2.webp
    ├── dossier-presse.pdf   # Referenced in series.json
    └── catalogue.pdf        # Referenced in series.json
```

## series.json Example with PDFs

```json
{
  "title": "Exposition Photographique",
  "description": "Une série de photographies explorant la lumière naturelle.",
  "medium": "Photographie numérique",
  "year": "2024",
  "cover": "cover-photo",
  "pdfs": {
    "dossier-presse": {
      "title": "Dossier de Presse",
      "description": "Présentation complète du projet et biographie"
    },
    "catalogue-exposition": {
      "title": "Catalogue",
      "description": "Catalogue complet de l'exposition"
    }
  },
  "photos": {
    "cover-photo": {
      "title": "Photo de couverture",
      "width": 1200,
      "height": 800
    }
  }
}
```

## User Experience

- PDFs appear in a "Documents" section on the project page
- Each PDF card shows:
  - A document icon
  - The document title
  - An optional description
  - A link to open in a new browser tab
- Clicking a PDF opens it in the browser's built-in PDF viewer
- The layout is responsive (1-3 columns depending on screen size)

## Technical Details

- PDF files are auto-discovered from the series directory
- The system matches PDF filenames to entries in `series.json` → `pdfs`
- PDFs without metadata entries will use the filename as the title
- PDFs are served directly from the public folder and can be viewed in-browser
