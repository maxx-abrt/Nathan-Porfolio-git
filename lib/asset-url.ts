export function getAssetUrl(assetPath: string): string {
  if (/^https?:\/\//i.test(assetPath)) return assetPath
  const baseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "")
  const normalized = assetPath.startsWith("/") ? assetPath : `/${assetPath}`
  const encodedPath = normalized
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
  if (!baseUrl) return encodedPath
  return `${baseUrl}${encodedPath}`
}
