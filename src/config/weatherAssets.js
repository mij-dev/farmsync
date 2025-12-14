/**
 * Curated Weather Assets Configuration
 * 
 * This file maps weather types to professional, curated background assets.
 * Assets can be:
 * - Local files in /public/assets/weather/ (recommended for production)
 * - CDN URLs (for reliable hosting)
 * - null (will use API fallback)
 * 
 * To update assets, simply modify the URLs/paths in this object.
 * 
 * Asset naming convention:
 * - GIFs: {weatherType}.gif (e.g., "rain.gif")
 * - Videos: {weatherType}.mp4 (e.g., "sunny.mp4")
 * - Static images: {weatherType}.jpg or {weatherType}.png
 */

// Base path for local assets (relative to public folder)
const ASSETS_BASE_PATH = '/assets/weather/';

/**
 * Curated asset mapping
 * Each entry can be:
 * - A string URL/path to a GIF, video, or image
 * - An object with { gif, video, image } for format options
 * - null to use API fallback
 */
export const CURATED_ASSETS = {
  // Thunderstorm
  thunder: {
    gif: `${ASSETS_BASE_PATH}thunder.gif`,
    video: `${ASSETS_BASE_PATH}thunder.mp4`,
    image: `${ASSETS_BASE_PATH}thunder.jpg`, // Static fallback
  },
  
  // Heavy Rain
  'heavy-rain': {
    gif: `${ASSETS_BASE_PATH}heavy-rain.gif`,
    video: `${ASSETS_BASE_PATH}heavy-rain.mp4`,
    image: `${ASSETS_BASE_PATH}heavy-rain.jpg`,
  },
  
  // Light Rain
  rain: {
    gif: `${ASSETS_BASE_PATH}rain.gif`,
    video: `${ASSETS_BASE_PATH}rain.mp4`,
    image: `${ASSETS_BASE_PATH}rain.jpg`,
  },
  
  // Windy
  wind: {
    gif: `${ASSETS_BASE_PATH}wind.gif`,
    video: `${ASSETS_BASE_PATH}wind.mp4`,
    image: `${ASSETS_BASE_PATH}wind.jpg`,
  },
  
  // Clear/Sunny
  sunny: {
    gif: `${ASSETS_BASE_PATH}sunny.gif`,
    video: `${ASSETS_BASE_PATH}sunny.mp4`,
    image: `${ASSETS_BASE_PATH}sunny.jpg`,
  },
  
  // Cloudy
  cloud: {
    gif: `${ASSETS_BASE_PATH}cloudy.gif`,
    video: `${ASSETS_BASE_PATH}cloudy.mp4`,
    image: `${ASSETS_BASE_PATH}cloudy.jpg`,
  },
  
  // Neutral/Default
  neutral: {
    gif: `${ASSETS_BASE_PATH}neutral.gif`,
    video: `${ASSETS_BASE_PATH}neutral.mp4`,
    image: `${ASSETS_BASE_PATH}neutral.jpg`,
  },
  
  // Snow (if needed)
  snow: {
    gif: `${ASSETS_BASE_PATH}snow.gif`,
    video: `${ASSETS_BASE_PATH}snow.mp4`,
    image: `${ASSETS_BASE_PATH}snow.jpg`,
  },
  
  // Fog/Mist
  fog: {
    gif: `${ASSETS_BASE_PATH}fog.gif`,
    video: `${ASSETS_BASE_PATH}fog.mp4`,
    image: `${ASSETS_BASE_PATH}fog.jpg`,
  },
};

/**
 * Static fallback images (used when all else fails)
 * These are high-quality static images from Unsplash or similar
 */
export const STATIC_FALLBACK_IMAGES = {
  thunder: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format',
  'heavy-rain': 'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?w=1920&q=80&auto=format',
  rain: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1920&q=80&auto=format',
  wind: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1920&q=80&auto=format',
  sunny: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format',
  cloud: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80&auto=format',
  neutral: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format',
  snow: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1920&q=80&auto=format',
  fog: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80&auto=format',
};

/**
 * Giphy search queries for fallback (deterministic, professional)
 * These are used when curated assets are not available
 */
export const GIPHY_FALLBACK_QUERIES = {
  thunder: 'thunderstorm lightning seamless loop animation',
  'heavy-rain': 'heavy rain storm seamless loop animation',
  rain: 'rain weather seamless loop animation',
  wind: 'windy weather seamless loop animation',
  sunny: 'clear sky sunny seamless loop animation',
  cloud: 'cloudy sky seamless loop animation',
  neutral: 'weather nature seamless loop animation',
  snow: 'snow falling seamless loop animation',
  fog: 'fog mist seamless loop animation',
};

/**
 * Get curated asset URL for a weather type
 * @param {string} weatherKey - Weather condition key
 * @param {boolean} preferVideo - Whether to prefer video format
 * @returns {string|null} Asset URL or null if not available
 */
export function getCuratedAsset(weatherKey, preferVideo = false) {
  const asset = CURATED_ASSETS[weatherKey];
  if (!asset) return null;
  
  // If asset is a string, return it directly
  if (typeof asset === 'string') {
    return asset;
  }
  
  // If asset is an object, return preferred format
  if (typeof asset === 'object') {
    if (preferVideo && asset.video) return asset.video;
    if (asset.gif) return asset.gif;
    if (asset.video) return asset.video;
    if (asset.image) return asset.image;
  }
  
  return null;
}

/**
 * Get static fallback image for a weather type
 * @param {string} weatherKey - Weather condition key
 * @returns {string} Fallback image URL
 */
export function getStaticFallback(weatherKey) {
  return STATIC_FALLBACK_IMAGES[weatherKey] || STATIC_FALLBACK_IMAGES.neutral;
}

/**
 * Get Giphy search query for a weather type
 * @param {string} weatherKey - Weather condition key
 * @returns {string} Search query
 */
export function getGiphyQuery(weatherKey) {
  return GIPHY_FALLBACK_QUERIES[weatherKey] || GIPHY_FALLBACK_QUERIES.neutral;
}
