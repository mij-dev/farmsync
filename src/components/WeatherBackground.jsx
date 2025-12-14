import { useEffect, useState, useRef } from 'react';
import { getWeatherBackground, getCachedBackground } from '../services/weatherBackground';
import { getStaticFallback } from '../config/weatherAssets';

/**
 * WeatherBackground Component
 * Displays dynamic GIF/video background based on weather conditions
 * Uses tiered fallback: Curated assets -> Giphy API -> Static images
 * 
 * @param {string} weatherKey - Weather condition key (e.g., 'rain', 'sunny')
 * @param {string} weatherDescription - Full weather description for alt text
 * @param {boolean} preferVideo - Whether to prefer videos over GIFs
 * @param {string} giphyApiKey - Optional Giphy API key
 */
export default function WeatherBackground({ 
  weatherKey, 
  weatherDescription = '',
  preferVideo = false,
  giphyApiKey = null 
}) {
  const [backgroundData, setBackgroundData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useStaticFallback, setUseStaticFallback] = useState(false);
  const imgRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!weatherKey) {
      setIsLoading(false);
      return;
    }

    // Check cache first for instant display (legacy support)
    const cached = getCachedBackground(weatherKey);
    if (cached) {
      // If we have a cached URL, determine format
      const format = cached.includes('.mp4') || cached.includes('/mp4') ? 'video' : 
                     cached.includes('.gif') ? 'gif' : 'image';
      setBackgroundData({
        url: cached,
        type: 'cached',
        format,
      });
      setIsLoading(false);
      return;
    }

    // Fetch new background
    setIsLoading(true);
    setError(null);
    setUseStaticFallback(false);

    getWeatherBackground(weatherKey, giphyApiKey, preferVideo)
      .then((data) => {
        setBackgroundData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading weather background:', err);
        setError(err);
        setIsLoading(false);
        // On error, try static fallback
        setUseStaticFallback(true);
      });
  }, [weatherKey, giphyApiKey, preferVideo]);

  // Preload next image when URL changes for smooth transitions
  useEffect(() => {
    if (backgroundData?.url && backgroundData.format === 'image' && imgRef.current) {
      const img = new Image();
      img.src = backgroundData.url;
    }
  }, [backgroundData]);

  // Determine what to render based on format
  const renderMedia = () => {
    if (!backgroundData?.url) return null;

    const { url, format } = backgroundData;

    // Video format
    if (format === 'video' || (preferVideo && (url.includes('.mp4') || url.includes('/mp4')))) {
      return (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out',
          }}
          onLoadedData={() => {
            setIsLoading(false);
            setUseStaticFallback(false);
          }}
          onError={() => {
            console.warn('Video failed to load, falling back to static image');
            setUseStaticFallback(true);
            setIsLoading(false);
          }}
        >
          <source src={url} type="video/mp4" />
          <source src={url} type="video/webm" />
        </video>
      );
    }

    // GIF or Image format
    return (
      <img
        ref={imgRef}
        src={url}
        alt={`Weather background: ${weatherDescription || weatherKey}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
        }}
        onLoad={() => {
          setIsLoading(false);
          setUseStaticFallback(false);
        }}
        onError={() => {
          console.warn('Image/GIF failed to load, using static fallback');
          // If not already a static image, try to get static fallback
          if (backgroundData.type !== 'static') {
            setUseStaticFallback(true);
          }
          setIsLoading(false);
        }}
      />
    );
  };

  // Get static fallback URL if needed
  const getStaticFallbackUrl = () => {
    if (backgroundData?.type === 'static') {
      return backgroundData.url;
    }
    return getStaticFallback(weatherKey || 'neutral');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Background Media */}
      {backgroundData?.url && !useStaticFallback && renderMedia()}

      {/* Static Fallback (shown when media fails to load or useStaticFallback is true) */}
      {(useStaticFallback || error) && (
        <img
          src={getStaticFallbackUrl()}
          alt={`Weather background: ${weatherDescription || weatherKey}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out',
          }}
          onLoad={() => setIsLoading(false)}
        />
      )}

      {/* Loading indicator */}
      {isLoading && !backgroundData?.url && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #020617 0%, #0b1220 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8,
          }}
        />
      )}

      {/* Dark overlay for content readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(2,6,23,0.65) 0%, rgba(11,18,32,0.60) 50%, rgba(2,6,23,0.65) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Additional gradient overlay for better text contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(2,6,23,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
