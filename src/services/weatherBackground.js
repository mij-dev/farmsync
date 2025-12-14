/**
 * Weather Background Service
 * 
 * Provides professional, consistent weather backgrounds using a tiered approach:
 * 1. Curated assets (local/CDN) - highest quality, most reliable
 * 2. Giphy API fallback - deterministic, professional queries
 * 3. Static image fallback - graceful degradation
 */

import {
  getCuratedAsset,
  getStaticFallback,
  getGiphyQuery,
} from '../config/weatherAssets';

// Cache for storing fetched GIF URLs by weather type (for API fallbacks)
const apiFallbackCache = new Map();

// Cache for asset availability checks
const assetAvailabilityCache = new Map();

/**
 * Checks if an asset URL is accessible
 * @param {string} url - Asset URL to check
 * @returns {Promise<boolean>} True if asset is accessible
 */
async function checkAssetAvailability(url) {
  // Check cache first
  if (assetAvailabilityCache.has(url)) {
    return assetAvailabilityCache.get(url);
  }

  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
    const isAvailable = response.ok;
    assetAvailabilityCache.set(url, isAvailable);
    return isAvailable;
  } catch (error) {
    assetAvailabilityCache.set(url, false);
    return false;
  }
}

/**
 * Fetches a deterministic GIF from Giphy API (used as fallback)
 * Uses limit=1 and always returns the same result for a given weather type
 * @param {string} weatherKey - The weather condition key
 * @param {string} apiKey - Giphy API key
 * @param {boolean} preferVideo - Whether to prefer video format
 * @returns {Promise<string|null>} URL of the GIF/video or null if not found
 */
async function fetchGiphyFallback(weatherKey, apiKey, preferVideo = false) {
  // Check cache first
  if (apiFallbackCache.has(weatherKey)) {
    return apiFallbackCache.get(weatherKey);
  }

  const searchQuery = getGiphyQuery(weatherKey);

  try {
    // Use videos endpoint if preferVideo, otherwise gifs
    const endpoint = preferVideo ? 'videos/search' : 'gifs/search';
    // Limit to 1 for deterministic results (always same GIF for same weather type)
    const url = `https://api.giphy.com/v1/${endpoint}?api_key=${apiKey}&q=${encodeURIComponent(searchQuery)}&limit=1&rating=g&lang=en`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Giphy API error for ${weatherKey}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      let mediaUrl;

      if (preferVideo && data.data[0].images) {
        // Use video URL if available
        const videoData = data.data[0].images;
        mediaUrl = videoData.original_mp4?.mp4 || videoData.original?.url || data.data[0].images.original.url;
      } else {
        // Use GIF URL (deterministic - always first result)
        mediaUrl = data.data[0].images.original.url;
      }

      // Cache the result
      apiFallbackCache.set(weatherKey, mediaUrl);
      return mediaUrl;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to fetch Giphy fallback for ${weatherKey}:`, error);
    return null;
  }
}

/**
 * Gets the best available background asset for a weather condition
 * Uses tiered fallback: Curated -> Giphy -> Static Image
 * 
 * @param {string} weatherKey - The weather condition key (e.g., 'rain', 'sunny')
 * @param {string} giphyApiKey - Giphy API key (optional, for fallback)
 * @param {boolean} preferVideo - Whether to prefer video format
 * @returns {Promise<{url: string, type: 'curated' | 'api' | 'static', format: 'gif' | 'video' | 'image'}>}
 */
export async function getWeatherBackground(weatherKey, giphyApiKey = null, preferVideo = false) {
  if (!weatherKey) {
    const staticUrl = getStaticFallback('neutral');
    return {
      url: staticUrl,
      type: 'static',
      format: 'image',
    };
  }

  // Tier 1: Try curated assets first
  const curatedAsset = getCuratedAsset(weatherKey, preferVideo);
  if (curatedAsset) {
    // Check if curated asset is accessible
    const isAvailable = await checkAssetAvailability(curatedAsset);
    if (isAvailable) {
      // Determine format from URL
      let format = 'image';
      if (curatedAsset.includes('.gif')) format = 'gif';
      else if (curatedAsset.includes('.mp4') || curatedAsset.includes('.webm')) format = 'video';

      return {
        url: curatedAsset,
        type: 'curated',
        format,
      };
    }
    // If curated asset not available, try static image from curated assets
    const curatedAssetObj = getCuratedAsset(weatherKey, false);
    if (typeof curatedAssetObj === 'object' && curatedAssetObj.image) {
      const imageAvailable = await checkAssetAvailability(curatedAssetObj.image);
      if (imageAvailable) {
        return {
          url: curatedAssetObj.image,
          type: 'curated',
          format: 'image',
        };
      }
    }
  }

  // Tier 2: Try Giphy API fallback (deterministic)
  const apiKey = giphyApiKey || import.meta.env.VITE_GIPHY_API_KEY;
  if (apiKey) {
    const giphyUrl = await fetchGiphyFallback(weatherKey, apiKey, preferVideo);
    if (giphyUrl) {
      const format = preferVideo && (giphyUrl.includes('.mp4') || giphyUrl.includes('/mp4')) ? 'video' : 'gif';
      return {
        url: giphyUrl,
        type: 'api',
        format,
      };
    }
  }

  // Tier 3: Use static fallback image
  const staticUrl = getStaticFallback(weatherKey);
  return {
    url: staticUrl,
    type: 'static',
    format: 'image',
  };
}

/**
 * Preloads background for a weather condition
 * @param {string} weatherKey - The weather condition key
 * @param {string} giphyApiKey - Optional Giphy API key
 * @param {boolean} preferVideo - Whether to prefer video format
 */
export async function preloadWeatherBackground(weatherKey, giphyApiKey = null, preferVideo = false) {
  await getWeatherBackground(weatherKey, giphyApiKey, preferVideo);
}

/**
 * Clears all caches (useful for testing or forcing refresh)
 */
export function clearBackgroundCache() {
  apiFallbackCache.clear();
  assetAvailabilityCache.clear();
}

/**
 * Gets cached API fallback URL if available
 * @param {string} weatherKey - The weather condition key
 * @returns {string|null} Cached URL or null
 */
export function getCachedApiFallback(weatherKey) {
  return apiFallbackCache.get(weatherKey) || null;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getWeatherBackground instead
 */
export async function fetchWeatherGif(weatherKey, giphyApiKey = null, preferVideo = false) {
  const result = await getWeatherBackground(weatherKey, giphyApiKey, preferVideo);
  return result.url;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getWeatherBackground instead
 */
export function getCachedBackground(weatherKey) {
  // Check curated assets first
  const curated = getCuratedAsset(weatherKey, false);
  if (curated) return curated;
  
  // Check API cache
  return getCachedApiFallback(weatherKey);
}
