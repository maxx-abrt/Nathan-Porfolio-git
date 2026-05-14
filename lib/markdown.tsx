import type { ReactNode } from "react"

export function parseLine(line: string): ReactNode {
  const parts: ReactNode[] = []
  let remaining = line
  let key = 0

  while (remaining.length > 0) {
    const boldIdx = remaining.indexOf("**")
    const underlineIdx = remaining.indexOf("__")
    const italicIdx = remaining.indexOf("*")

    let firstIdx = Infinity
    let patternType: "bold" | "underline" | "italic" | null = null

    if (boldIdx !== -1 && boldIdx < firstIdx) {
      firstIdx = boldIdx
      patternType = "bold"
    }
    if (underlineIdx !== -1 && underlineIdx < firstIdx) {
      firstIdx = underlineIdx
      patternType = "underline"
    }
    if (italicIdx !== -1 && italicIdx < firstIdx) {
      if (remaining.substring(italicIdx, italicIdx + 2) !== "**") {
        firstIdx = italicIdx
        patternType = "italic"
      }
    }

    if (patternType === null) {
      parts.push(remaining)
      break
    }

    if (firstIdx > 0) {
      parts.push(remaining.substring(0, firstIdx))
    }

    let closeIdx = -1
    let content = ""
    let skipLength = 0

    if (patternType === "bold") {
      closeIdx = remaining.indexOf("**", firstIdx + 2)
      if (closeIdx !== -1) {
        content = remaining.substring(firstIdx + 2, closeIdx)
        parts.push(
          <strong key={key++} className="text-foreground font-semibold">
            {parseLine(content)}
          </strong>,
        )
        skipLength = closeIdx + 2
      }
    } else if (patternType === "underline") {
      closeIdx = remaining.indexOf("__", firstIdx + 2)
      if (closeIdx !== -1) {
        content = remaining.substring(firstIdx + 2, closeIdx)
        parts.push(
          <span key={key++} className="underline underline-offset-2">
            {parseLine(content)}
          </span>,
        )
        skipLength = closeIdx + 2
      }
    } else if (patternType === "italic") {
      closeIdx = remaining.indexOf("*", firstIdx + 1)
      if (closeIdx !== -1) {
        content = remaining.substring(firstIdx + 1, closeIdx)
        parts.push(
          <em key={key++} className="italic">
            {parseLine(content)}
          </em>,
        )
        skipLength = closeIdx + 1
      }
    }

    if (closeIdx === -1) {
      parts.push(remaining.substring(firstIdx))
      break
    }

    remaining = remaining.substring(skipLength)
  }

  return <>{parts}</>
}

export function parseMarkdown(text: string): ReactNode {
  if (!text) return <></>

  const normalizedText = text.replace(/\\n/g, "\n")
  const lines = normalizedText.split("\n")

  return (
    <>
      {lines.map((line, lineIndex) => {
        const elements = parseLine(line)
        return (
          <span key={lineIndex}>
            {elements}
            {lineIndex < lines.length - 1 && <br />}
          </span>
        )
      })}
    </>
  )
}

export function parseMarkdownPreview(text: string, maxLength: number): ReactNode {
  if (!text) return <></>

  const normalizedText = text.replace(/\\n/g, "\n")
  const buffer = 20
  const truncated =
    normalizedText.length > maxLength + buffer
      ? normalizedText.substring(0, maxLength + buffer)
      : normalizedText

  const lines = truncated.split("\n")
  const previewLines: ReactNode[] = []
  let currentLength = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (currentLength + line.length > maxLength && previewLines.length > 0) {
      break
    }

    if (i > 0) {
      previewLines.push(<br key={`br-${i}`} />)
      currentLength += 1
    }

    previewLines.push(<span key={`line-${i}`}>{parseLine(line)}</span>)
    currentLength += line.length

    if (currentLength >= maxLength) {
      break
    }
  }

  const isTruncated = normalizedText.length > maxLength

  return (
    <>
      {previewLines}
      {isTruncated && <span>…</span>}
    </>
  )
}
