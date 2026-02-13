export function getOptimizedImage(url, opts = {}) {
  if (!url) return url
  const { w = 800, q = 75 } = opts
  const cdn = process.env.NEXT_PUBLIC_IMAGE_CDN || ''

  // If no CDN configured, return original URL
  if (!cdn) return url

  try {
    const parsed = new URL(url)
    // Prefer preserving pathname; allow CDN to serve by path
    return `${cdn}${parsed.pathname}${parsed.search ? parsed.search + '&' : '?'}w=${w}&q=${q}`
  } catch (e) {
    // relative path
    return `${cdn}${url}${url.includes('?') ? '&' : '?'}w=${w}&q=${q}`
  }
}

export default getOptimizedImage
