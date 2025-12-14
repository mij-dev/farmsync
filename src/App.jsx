import { useEffect, useMemo, useRef, useState } from "react";
import WeatherBackground from "./components/WeatherBackground";

const LOCATIONS = [
  { label: "Kedah, MY", q: "Kedah,MY" },
  { label: "Alor Setar, Kedah, MY", q: "Alor Setar,MY" },
  { label: "Penang (George Town), MY", q: "George Town,MY" },
  { label: "Ipoh, Perak, MY", q: "Ipoh,MY" },
  { label: "Kuala Lumpur, MY", q: "Kuala Lumpur,MY" },
  { label: "Putrajaya, MY", q: "Putrajaya,MY" },
  { label: "Shah Alam, Selangor, MY", q: "Shah Alam,MY" },
  { label: "Johor Bahru, MY", q: "Johor Bahru,MY" },
  { label: "Kuantan, Pahang, MY", q: "Kuantan,MY" },
  { label: "Kuala Terengganu, MY", q: "Kuala Terengganu,MY" },
  { label: "Kota Bharu, Kelantan, MY", q: "Kota Bharu,MY" },
  { label: "Kota Kinabalu, Sabah, MY", q: "Kota Kinabalu,MY" },
  { label: "Kuching, Sarawak, MY", q: "Kuching,MY" },
  { label: "Singapore, SG", q: "Singapore,SG" },
  { label: "Bangkok, TH", q: "Bangkok,TH" },
];

function formatTime(unixSeconds, tzOffsetSeconds) {
  const d = new Date((unixSeconds + tzOffsetSeconds) * 1000);
  return d.toUTCString().slice(17, 22);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export default function App() {
  const apiKey = import.meta.env.VITE_OWM_API_KEY;

  // Weather state
  const [selectedQ, setSelectedQ] = useState(LOCATIONS[0].q);
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  function triggerThunderSound() {
  const r = audioRef.current;
  const ctx = r.ctx;
  if (!ctx || !r.master) return;

  const t = ctx.currentTime;

  const rumble = ctx.createOscillator();
  rumble.type = "sine";
  rumble.frequency.value = 48;

  const g = ctx.createGain();
  g.gain.value = 0;

  rumble.connect(g);
  g.connect(r.master);

  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.55, t + 0.12);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

  rumble.frequency.setValueAtTime(58, t);
  rumble.frequency.linearRampToValueAtTime(38, t + 1.4);

  rumble.start(t);
  rumble.stop(t + 1.9);
}

  // Audio UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50); // 0-100

  // Background preference state
  const [preferVideo, setPreferVideo] = useState(false);
  const [enableDynamicBackground, setEnableDynamicBackground] = useState(true);

  // Web Audio refs
  const audioRef = useRef({
    ctx: null,
    master: null,
    noiseSrc: null,
    noiseGain: null,
    filter: null,
    osc: null,
    oscGain: null,
    thunderTimer: null,
  });

  const selectedLabel = useMemo(
    () => LOCATIONS.find((l) => l.q === selectedQ)?.label ?? selectedQ,
    [selectedQ]
  );

  // Fetch weather when location changes
  useEffect(() => {
    async function load() {
      if (!apiKey) {
        setStatus("error");
        setError("Missing VITE_OWM_API_KEY in .env");
        return;
      }

      setStatus("loading");
      setError("");

      try {
        const url =
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(selectedQ)}` +
          `&units=metric&appid=${apiKey}`;

        const res = await fetch(url);
        const json = await res.json();

        if (!res.ok) throw new Error(json?.message || "Weather API error");

        setData(json);
        setStatus("ok");
      } catch (e) {
        setStatus("error");
        setError(String(e.message || e));
      }
    }

    load();
  }, [apiKey, selectedQ]);

  const temp = data ? Math.round(data.main.temp) : null;
  const feels = data ? Math.round(data.main.feels_like) : null;
  const wind = data ? Math.round(data.wind.speed) : null;
  const humidity = data ? Math.round(data.main.humidity) : null;
  const desc = data?.weather?.[0]?.description ?? "";
  const hi = data ? Math.round(data.main.temp_max) : null;
  const lo = data ? Math.round(data.main.temp_min) : null;

  const tz = data?.timezone ?? 0;
  const sunrise = data?.sys?.sunrise ? formatTime(data.sys.sunrise, tz) : "--:--";
  const sunset = data?.sys?.sunset ? formatTime(data.sys.sunset, tz) : "--:--";

  // OpenWeather icon
  const iconCode = data?.weather?.[0]?.icon;
  const iconUrl = iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : "";

  // Decide ambience mode
  const ambience = useMemo(() => {
    const main = (data?.weather?.[0]?.main ?? "").toLowerCase();
    const windSpeed = Number(data?.wind?.speed ?? 0);

    const rain1h = Number(data?.rain?.["1h"] ?? 0);
    const rain3h = Number(data?.rain?.["3h"] ?? 0);
    const rainAmount = Math.max(rain1h, rain3h);

    if (main.includes("thunder")) return { key: "thunder", label: "Thunderstorm" };

    if (main.includes("rain") || main.includes("drizzle")) {
      if (rainAmount >= 6) return { key: "heavy-rain", label: "Heavy Rain" };
      return { key: "rain", label: "Rain" };
    }

    if (windSpeed >= 8) return { key: "wind", label: "Windy" };
    if (main.includes("clear")) return { key: "sunny", label: "Sunny" };
    if (main.includes("cloud")) return { key: "cloud", label: "Cloudy" };

    return { key: "neutral", label: "Neutral" };
  }, [data]);

  // Theme class for CSS animated bg (fallback when dynamic background is disabled)
  const themeClass = useMemo(() => {
    if (ambience.key === "thunder") return "ios-thunder";
    if (ambience.key === "rain" || ambience.key === "heavy-rain") return "ios-rain";
    if (ambience.key === "wind") return "ios-wind";
    if (ambience.key === "sunny") return "ios-clear";
    if (ambience.key === "cloud") return "ios-clouds";
    return "ios-neutral";
  }, [ambience.key]);

  // Giphy API key (optional, can use public beta key if not provided)
  const giphyApiKey = import.meta.env.VITE_GIPHY_API_KEY || null;

  // Volume curve
  function setMasterVolume(v0to100) {
    const r = audioRef.current;
    if (!r.master) return;
    const t = r.ctx?.currentTime ?? 0;

    const x = clamp(v0to100 / 100, 0, 1);
    const gain = x === 0 ? 0 : Math.pow(x, 1.8);
    r.master.gain.setTargetAtTime(gain, t, 0.03);
  }

  // Create audio context once
  function ensureAudio() {
    const r = audioRef.current;
    if (r.ctx) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    r.ctx = ctx;
    r.master = master;

    setMasterVolume(volume);
  }

  function stopAll() {
    const r = audioRef.current;
    if (!r.ctx) return;

    if (r.thunderTimer) {
      clearInterval(r.thunderTimer);
      r.thunderTimer = null;
    }

    if (r.noiseSrc) {
      try { r.noiseSrc.stop(); } catch {}
      r.noiseSrc.disconnect();
      r.noiseSrc = null;
    }
    if (r.noiseGain) {
      r.noiseGain.disconnect();
      r.noiseGain = null;
    }
    if (r.filter) {
      r.filter.disconnect();
      r.filter = null;
    }

    if (r.osc) {
      try { r.osc.stop(); } catch {}
      r.osc.disconnect();
      r.osc = null;
    }
    if (r.oscGain) {
      r.oscGain.disconnect();
      r.oscGain = null;
    }
  }

  function createNoiseSource(ctx) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const ch = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) ch[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
  }

  // Distinct ambience sounds
  function startAmbience(modeKey) {
    const r = audioRef.current;
    const ctx = r.ctx;
    if (!ctx || !r.master) return;

    stopAll();
    const now = ctx.currentTime;

    // SUNNY (warm pad)
    if (modeKey === "sunny") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 196;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      osc.connect(gain);
      gain.connect(r.master);

      gain.gain.linearRampToValueAtTime(0.22, now + 1.2);

      osc.start();

      r.osc = osc;
      r.oscGain = gain;
      return;
    }

    // Base noise bed
    const noiseSrc = createNoiseSource(ctx);
    const filter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();

    noiseGain.gain.value = 0;

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(r.master);

    noiseSrc.start();

    r.noiseSrc = noiseSrc;
    r.filter = filter;
    r.noiseGain = noiseGain;

    // LIGHT RAIN
    if (modeKey === "rain") {
      filter.type = "bandpass";
      filter.frequency.value = 1800;
      filter.Q.value = 0.6;

      noiseGain.gain.linearRampToValueAtTime(0.35, now + 0.8);
      return;
    }

    // HEAVY RAIN (super heavy)
    if (modeKey === "heavy-rain") {
      filter.type = "bandpass";
      filter.frequency.value = 2200;
      filter.Q.value = 0.85;

      noiseGain.gain.linearRampToValueAtTime(0.75, now + 0.5);

      const rumble = ctx.createOscillator();
      rumble.type = "triangle";
      rumble.frequency.value = 55;

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0;

      rumble.connect(rumbleGain);
      rumbleGain.connect(r.master);

      rumbleGain.gain.linearRampToValueAtTime(0.32, now + 0.9);

      rumble.start();

      r.osc = rumble;
      r.oscGain = rumbleGain;
      return;
    }

    // WIND
    if (modeKey === "wind") {
      filter.type = "lowpass";
      filter.frequency.value = 500;

      noiseGain.gain.linearRampToValueAtTime(0.45, now + 0.8);
      return;
    }

    // THUNDER (NO buzz: deep rumble only)
    if (modeKey === "thunder") {
      filter.type = "bandpass";
      filter.frequency.value = 1700;
      filter.Q.value = 0.7;

      noiseGain.gain.linearRampToValueAtTime(0.45, now + 0.6);

      r.thunderTimer = setInterval(() => {
        const t = ctx.currentTime;

        const rumble = ctx.createOscillator();
        rumble.type = "triangle";
        rumble.frequency.value = 48;

        const g = ctx.createGain();
        g.gain.value = 0;

        rumble.connect(g);
        g.connect(r.master);

        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.55, t + 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

        rumble.frequency.setValueAtTime(58, t);
        rumble.frequency.linearRampToValueAtTime(38, t + 1.4);

        rumble.start(t);
        rumble.stop(t + 1.9);
      }, 6000);

      return;
    }

    // CLOUD / NEUTRAL
    filter.type = "lowpass";
    filter.frequency.value = modeKey === "cloud" ? 1200 : 900;
    noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.8);
  }

  async function handleTogglePlay() {
    ensureAudio();
    const r = audioRef.current;
    if (!r.ctx) return;

    if (r.ctx.state === "suspended") {
      await r.ctx.resume();
    }

    if (!isPlaying) {
      setIsPlaying(true);
      setMasterVolume(volume);
      startAmbience(ambience.key);
    } else {
      setIsPlaying(false);
      stopAll();
      const t = r.ctx.currentTime;
      r.master.gain.setTargetAtTime(0, t, 0.03);
    }
  }

  // Volume updates live
  useEffect(() => {
    ensureAudio();
    setMasterVolume(volume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume]);

  // Auto-switch ambience when weather changes
  useEffect(() => {
    if (!isPlaying) return;
    startAmbience(ambience.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambience.key, isPlaying]);

  return (
    <div className={enableDynamicBackground ? "" : `ios-bg ${themeClass}`} style={{ minHeight: "100vh", position: "relative" }}>
      {/* Dynamic Weather Background */}
      {enableDynamicBackground && status === "ok" && ambience.key && (
        <WeatherBackground
          weatherKey={ambience.key}
          weatherDescription={desc}
          preferVideo={preferVideo}
          giphyApiKey={giphyApiKey}
        />
      )}

      <div
        style={{
          minHeight: "100vh",
          padding: 18,
          fontFamily: "system-ui",
          color: "white",
          background: enableDynamicBackground
            ? "transparent" // Transparent when using dynamic background (overlay is in WeatherBackground)
            : "linear-gradient(135deg, rgba(2,6,23,0.25), rgba(11,18,32,0.25) 45%, rgba(2,6,23,0.25))",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, opacity: 0.8 }}>FarmSync</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Weather</div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ fontSize: 12, opacity: 0.85 }}>Location</label>
              <select
                value={selectedQ}
                onChange={(e) => setSelectedQ(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "white",
                  padding: "10px 12px",
                  borderRadius: 12,
                }}
              >
                {LOCATIONS.map((l) => (
                  <option key={l.q} value={l.q} style={{ color: "black" }}>
                    {l.label}
                  </option>
                ))}
              </select>

              {/* Background Toggle */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 12, opacity: 0.85, display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={enableDynamicBackground}
                    onChange={(e) => setEnableDynamicBackground(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  Dynamic BG
                </label>
              </div>
            </div>
          </div>

          {/* Card */}
          <div
            style={{
              marginTop: 16,
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ padding: 18 }}>
              {status === "loading" && <div>Loading weather…</div>}
              {status === "error" && <div style={{ color: "#fca5a5" }}>{error}</div>}

              {status === "ok" && data && (
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
                    <div style={cardStyle}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.2 }}>{selectedLabel}</div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 10,
                            marginTop: 6,
                          }}
                        >
                          {iconUrl && (
                            <img
                              src={iconUrl}
                              alt="weather icon"
                              style={{
                                width: 52,
                                height: 52,
                                filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.35))",
                              }}
                            />
                          )}
                          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1 }}>{temp}°</div>
                        </div>

                        <div style={{ textTransform: "capitalize", opacity: 0.9, marginTop: 6, fontSize: 16 }}>{desc}</div>

                        <div style={{ marginTop: 10, opacity: 0.85, fontSize: 14 }}>
                          H: <b>{hi}°</b> &nbsp;&nbsp; L: <b>{lo}°</b> &nbsp;&nbsp; • &nbsp;&nbsp; Feels like{" "}
                          <b>{feels}°</b>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Metric title="Wind" value={`${wind ?? "--"} m/s`} />
                      <Metric title="Humidity" value={`${humidity ?? "--"}%`} />
                      <Metric title="Sunrise" value={sunrise} />
                      <Metric title="Sunset" value={sunset} />
                    </div>
                  </div>

                  {/* Sound controls */}
                  <div style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 14, opacity: 0.85 }}>Ambient Sound</div>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>{ambience.label}</div>
                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>(Play requires a click due to browser audio rules)</div>
                      </div>

                      {/* Background Preferences (shown when dynamic background is enabled) */}
                      {enableDynamicBackground && (
                        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, opacity: 0.85 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={preferVideo}
                              onChange={(e) => setPreferVideo(e.target.checked)}
                              style={{ cursor: "pointer" }}
                            />
                            Prefer Video
                          </label>
                        </div>
                      )}

                      <button
                        onClick={handleTogglePlay}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 14,
                          background: isPlaying ? "rgba(34,197,94,0.22)" : "rgba(255,255,255,0.10)",
                          border: "1px solid rgba(255,255,255,0.16)",
                          color: "white",
                          fontWeight: 800,
                          cursor: "pointer",
                          minWidth: 90,
                        }}
                      >
                        {isPlaying ? "Pause" : "Play"}
                      </button>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.85 }}>
                        <span>Volume</span>
                        <span>{volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        style={{ width: "100%", marginTop: 6 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "12px 18px",
                borderTop: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.18)",
                fontSize: 12,
                opacity: 0.9,
              }}
            >
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  borderRadius: 18,
  padding: 16,
  background: "rgba(0,0,0,0.20)",
  border: "1px solid rgba(255,255,255,0.10)",
};

function Metric({ title, value }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
