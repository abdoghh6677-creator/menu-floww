/**
 * Advanced Image Preloading System
 * Handles automatic preloading of critical images with priority management
 */

const preloadCache = new Set()
const preloadErrors = new Map()

/**
 * Clear all cached preload data
 */
export function clearPreloadCache() {
  preloadCache.clear()
  preloadErrors.clear()
}

/**
 * Preload an image with retry logic
 */
export async function preloadImageWithRetry(url, options = {}) {
  if (!url || preloadCache.has(url)) return Promise.resolve()

  const { retries = 2, timeout = 5000 } = options

  return new Promise((resolve) => {
    let attempts = 0

    const tryLoad = () => {
      const img = new Image()
      const timer = setTimeout(() => {
        img.src = '' // Abort
        attempts++
        if (attempts < retries) {
          tryLoad()
        } else {
          preloadErrors.set(url, 'timeout')
          resolve()
        }
      }, timeout)

      img.onload = () => {
        clearTimeout(timer)
        preloadCache.add(url)
        resolve()
      }

      img.onerror = () => {
        clearTimeout(timer)
        attempts++
        if (attempts < retries) {
          tryLoad()
        } else {
          preloadErrors.set(url, 'error')
          resolve()
        }
      }

      img.src = url
    }

    tryLoad()
  })
}

/**
 * Preload multiple images with priority levels
 * Priority: 'high' > 'medium' > 'low'
 */
export async function preloadImagesWithPriority(imageGroups = {}) {
  // Load high priority images first and wait
  if (imageGroups.high && imageGroups.high.length > 0) {
    await Promise.all(
      imageGroups.high.map(url => 
        preloadImageWithRetry(url, { retries: 3, timeout: 8000 })
      )
    )
  }

  // Load medium priority images
  if (imageGroups.medium && imageGroups.medium.length > 0) {
    Promise.all(
      imageGroups.medium.map(url => 
        preloadImageWithRetry(url, { retries: 2, timeout: 5000 })
      )
    ).catch(() => {})
  }

  // Load low priority images in background
  if (imageGroups.low && imageGroups.low.length > 0) {
    setTimeout(() => {
      imageGroups.low.forEach(url => {
        preloadImageWithRetry(url, { retries: 1, timeout: 3000 }).catch(() => {})
      })
    }, 1000)
  }
}

/**
 * Dynamically preload images when they appear in viewport (Intersection Observer)
 */
export function setupLazyLoadObserver(imageSelector = 'img[data-preload]') {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const dataSrc = img.getAttribute('data-preload')
        
        if (dataSrc && img.src !== dataSrc) {
          preloadImageWithRetry(dataSrc).then(() => {
            img.src = dataSrc
            img.removeAttribute('data-preload')
            observer.unobserve(img)
          })
        }
      }
    })
  }, {
    rootMargin: '50px'
  })

  // Observe all lazy-loadable images
  document.querySelectorAll(imageSelector).forEach(img => observer.observe(img))
  
  return observer
}

/**
 * Get preload status for analytics
 */
export function getPreloadStats() {
  return {
    totalPreloaded: preloadCache.size,
    preloadErrors: preloadErrors.size,
    failedUrls: Array.from(preloadErrors.entries())
  }
}

/**
 * Check if an image is already preloaded
 */
export function isImagePreloaded(url) {
  return preloadCache.has(url)
}

export default {
  clearPreloadCache,
  preloadImageWithRetry,
  preloadImagesWithPriority,
  setupLazyLoadObserver,
  getPreloadStats,
  isImagePreloaded
}
