# FarmSync - Weather Module

A React + Vite application featuring dynamic weather backgrounds and ambient sound generation based on real-time weather conditions.

## Features

- **Real-time Weather Data**: Fetches current weather from OpenWeatherMap API
- **Dynamic Weather Backgrounds**: Automatically displays weather-appropriate GIFs/videos as backgrounds
- **Ambient Sound Generation**: Web Audio API generates ambient sounds matching weather conditions
- **Location Selection**: Choose from multiple locations across Malaysia, Singapore, and Thailand
- **Caching**: Weather backgrounds are cached to minimize API calls and improve performance
- **Fallback Support**: Gracefully falls back to static images if API calls fail or no API key is provided

## Setup

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# OpenWeatherMap API Key (Required)
# Get your free API key at: https://openweathermap.org/api
VITE_OWM_API_KEY=your_openweathermap_api_key_here

# Giphy API Key (Optional - used as fallback when curated assets unavailable)
# Get your free API key at: https://developers.giphy.com/
# If not provided, the app will use static fallback images
VITE_GIPHY_API_KEY=your_giphy_api_key_here
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Weather Background Feature

The app uses a **professional, tiered background system** that ensures consistent, high-quality visuals:

### Background Selection Strategy

The app uses a three-tier fallback system:

1. **Curated Assets** (Primary) - Professional, seamless GIFs/videos hosted locally or via CDN
2. **Giphy API** (Fallback) - Deterministic, professional queries with consistent results
3. **Static Images** (Final Fallback) - High-quality static images for slow connections

### Weather Types Supported

- **Thunderstorm**: Lightning and storm visuals
- **Rain/Heavy Rain**: Rainy weather scenes
- **Wind**: Windy conditions
- **Sunny**: Clear, sunny skies
- **Cloudy**: Cloudy weather
- **Snow**: Snow falling
- **Fog**: Fog/mist conditions
- **Neutral**: Default weather scenes

### Background Options

- **Toggle Dynamic Background**: Enable/disable dynamic backgrounds (falls back to CSS gradients)
- **Prefer Video**: Option to prefer video formats over GIFs (when available)
- **Automatic Caching**: Backgrounds are cached per weather type to reduce API calls
- **Graceful Degradation**: Automatically falls back to static images on slow connections or load failures

### Adding Curated Assets

To add your own professional weather backgrounds:

1. **Prepare assets** following the guidelines in `public/assets/weather/README.md`
2. **Place files** in `public/assets/weather/` with proper naming:
   - `{weather-type}.gif` for animated GIFs
   - `{weather-type}.mp4` for videos
   - `{weather-type}.jpg` for static fallback images
3. **Update configuration** in `src/config/weatherAssets.js` if using custom paths or CDN URLs

Example:
```
public/assets/weather/
├── rain.gif
├── rain.mp4
├── rain.jpg
├── sunny.gif
└── ...
```

The app will automatically detect and use these assets. See `public/assets/weather/README.md` for detailed requirements and recommendations.

### Example: Background Selection Logic

The background selection follows this logic (from `src/services/weatherBackground.js`):

```javascript
// 1. Check curated assets first
const curatedAsset = getCuratedAsset(weatherKey, preferVideo);
if (curatedAsset && await checkAssetAvailability(curatedAsset)) {
  return { url: curatedAsset, type: 'curated', format: 'gif' };
}

// 2. Try Giphy API fallback (deterministic, limit=1)
if (giphyApiKey) {
  const giphyUrl = await fetchGiphyFallback(weatherKey, giphyApiKey);
  if (giphyUrl) {
    return { url: giphyUrl, type: 'api', format: 'gif' };
  }
}

// 3. Use static fallback image
return { url: getStaticFallback(weatherKey), type: 'static', format: 'image' };
```

### Example: Asset Configuration

The asset mapping in `src/config/weatherAssets.js` is easily configurable:

```javascript
export const CURATED_ASSETS = {
  rain: {
    gif: '/assets/weather/rain.gif',      // Local asset
    video: '/assets/weather/rain.mp4',    // Video version
    image: '/assets/weather/rain.jpg',    // Static fallback
  },
  sunny: {
    gif: 'https://cdn.example.com/sunny.gif',  // CDN URL
    video: 'https://cdn.example.com/sunny.mp4',
    image: 'https://cdn.example.com/sunny.jpg',
  },
  // ... other weather types
};
```

To update assets, simply modify the URLs in this configuration file.

## Project Structure

```
src/
├── components/
│   └── WeatherBackground.jsx    # Dynamic background component
├── config/
│   └── weatherAssets.js         # Curated assets configuration and mapping
├── services/
│   └── weatherBackground.js     # Background fetching and caching service
├── App.jsx                       # Main application component
└── index.css                     # Global styles and CSS animations

public/
└── assets/
    └── weather/                  # Curated weather background assets
        ├── README.md            # Asset requirements and guidelines
        ├── rain.gif / rain.mp4 / rain.jpg
        ├── sunny.gif / sunny.mp4 / sunny.jpg
        └── ... (other weather types)
```

## Technologies

- React 19
- Vite
- OpenWeatherMap API
- Giphy API (optional)
- Web Audio API (for ambient sounds)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
