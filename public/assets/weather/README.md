# Weather Background Assets

This directory contains curated, professional weather background assets (GIFs, videos, and static images).

## Directory Structure

```
public/assets/weather/
├── README.md (this file)
├── thunder.gif / thunder.mp4 / thunder.jpg
├── heavy-rain.gif / heavy-rain.mp4 / heavy-rain.jpg
├── rain.gif / rain.mp4 / rain.jpg
├── wind.gif / wind.mp4 / wind.jpg
├── sunny.gif / sunny.mp4 / sunny.jpg
├── cloudy.gif / cloudy.mp4 / cloudy.jpg
├── neutral.gif / neutral.mp4 / neutral.jpg
├── snow.gif / snow.mp4 / snow.jpg
└── fog.gif / fog.mp4 / fog.jpg
```

## Asset Requirements

### Format Recommendations

1. **GIFs**: 
   - Seamless loops (no visible start/end)
   - Recommended resolution: 1920x1080 or higher
   - File size: Keep under 5MB for performance
   - Format: GIF (animated)

2. **Videos**:
   - Seamless loops
   - Recommended resolution: 1920x1080 or higher
   - Format: MP4 (H.264 codec) or WebM
   - Duration: 3-10 seconds for seamless loops
   - File size: Keep under 10MB for performance

3. **Static Images**:
   - High quality, professional photography
   - Recommended resolution: 1920x1080 or higher
   - Format: JPG (optimized) or PNG
   - File size: Keep under 2MB

### Naming Convention

- **GIFs**: `{weather-type}.gif` (e.g., `rain.gif`)
- **Videos**: `{weather-type}.mp4` (e.g., `sunny.mp4`)
- **Static Images**: `{weather-type}.jpg` (e.g., `thunder.jpg`)

### Weather Types

- `thunder` - Thunderstorm with lightning
- `heavy-rain` - Heavy rain/storm
- `rain` - Light to moderate rain
- `wind` - Windy conditions
- `sunny` - Clear, sunny sky
- `cloudy` - Cloudy/overcast
- `neutral` - Default/neutral weather
- `snow` - Snow falling
- `fog` - Fog/mist conditions

## Adding Assets

1. **Prepare your assets** following the requirements above
2. **Place files** in this directory with the correct naming convention
3. **Update configuration** if needed in `src/config/weatherAssets.js`
4. **Test** by running the app and checking each weather type

## Asset Sources

### Recommended Sources for Curated Assets

1. **Free Stock Video/GIF Sites**:
   - Pexels Videos (https://www.pexels.com/videos/)
   - Pixabay (https://pixabay.com/videos/)
   - Giphy (curated collections)
   - Unsplash (for static images)

2. **Premium Sources**:
   - Shutterstock
   - Adobe Stock
   - Envato Elements

3. **Custom Creation**:
   - Create seamless loops using After Effects, Premiere Pro, or similar
   - Use AI tools for generating weather animations

## CDN Alternative

Instead of hosting assets locally, you can use CDN URLs in `src/config/weatherAssets.js`:

```javascript
export const CURATED_ASSETS = {
  rain: {
    gif: 'https://your-cdn.com/assets/rain.gif',
    video: 'https://your-cdn.com/assets/rain.mp4',
    image: 'https://your-cdn.com/assets/rain.jpg',
  },
  // ...
};
```

## Performance Tips

1. **Optimize file sizes** - Use compression tools
2. **Use WebP** for static images if supported
3. **Lazy load** - Assets are loaded on demand
4. **CDN hosting** - Consider using a CDN for faster delivery
5. **Preload** - Critical assets can be preloaded in `index.html`

## Testing

After adding assets, test each weather type:
1. Change location to trigger different weather conditions
2. Verify assets load correctly
3. Check performance (loading time, file size)
4. Test fallback behavior (disable assets to test API fallback)
