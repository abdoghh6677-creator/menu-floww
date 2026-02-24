/**
 * Generate optimized image URL with quality and width parameters
 * Supports multiple image formats (WebP, AVIF, JPEG)
 */
export function getOptimizedImage(url, opts = {}) {
  if (!url) return url
  const { w = 800, q = 75, format = 'webp' } = opts
  const cdn = process.env.NEXT_PUBLIC_IMAGE_CDN || ''

  // If no CDN configured, return original URL with compression hints
  if (!cdn) {
    // Add quality parameter for Supabase-hosted images
    if (url.includes('supabase')) {
      return `${url}${url.includes('?') ? '&' : '?'}q=${q}`
    }
    return url
  }

  try {
    const parsed = new URL(url)
    return `${cdn}${parsed.pathname}${parsed.search ? parsed.search + '&' : '?'}w=${w}&q=${q}&fm=${format}`
  } catch (e) {
    return `${cdn}${url}${url.includes('?') ? '&' : '?'}w=${w}&q=${q}&fm=${format}`
  }
}

/**
 * Generate blur placeholder (small, low-quality version for LQIP - Low Quality Image Placeholder)
 */
export function getBlurredImage(url, opts = {}) {
  if (!url) return null
  const { w = 50, q = 20 } = opts
  return getOptimizedImage(url, { w, q, format: 'webp' })
}

/**
 * Preload image for better perceived performance
 * Use this on component mount to start downloading images before they're visible
 */
export function preloadImage(url, options = {}) {
  if (typeof document === 'undefined' || !url) return

  try {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = getOptimizedImage(url, options)
    
    // Add imagesrcset for responsive images
    if (options.srcsets) {
      link.imagesrcset = options.srcsets
      link.imagesizes = options.sizes || '100vw'
    }
    
    document.head.appendChild(link)
  } catch (e) {
    console.warn('Failed to preload image:', e)
  }
}

/**
 * Generate responsive image srcset
 * Usage: srcSet={generateSrcSet(imageUrl)}
 */
export function generateSrcSet(url) {
  if (!url) return ''
  
  // Generate different sizes for responsive design
  const sizes = [320, 640, 960, 1280, 1920]
  return sizes.map(size => `${getOptimizedImage(url, { w: size })} ${size}w`).join(', ')
}

/**
 * Batch preload multiple images at once
 * Usage: batchPreloadImages([cover_url, logo_url, promo_urls...])
 */
export function batchPreloadImages(urls = [], priority = 'low') {
  if (typeof document === 'undefined') return

  urls.forEach(url => {
    if (url) {
      try {
        const img = new Image()
        img.src = getOptimizedImage(url, { w: 800 })
        
        // Optional: lower priority for background images
        if (priority === 'low' && 'fetchPriority' in img) {
          img.fetchPriority = 'low'
        }
      } catch (e) {
        console.warn('Failed to batch preload image:', e)
      }
    }
  })
}

export default getOptimizedImage
