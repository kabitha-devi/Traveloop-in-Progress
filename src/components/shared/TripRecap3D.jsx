import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Ensure you have MAPBOX_ACCESS_TOKEN in your env or pass it securely
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1Ijoia3MtMzMzIiwiYSI6ImNtb3pibGhzYzBzNXoydHNkeWdteXYwZGcifQ.OiZ5Mq2MS80HMrgzW0SV1w';

export default function TripRecap3D({ trip, onClose }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  // Extract stops with coordinates, fallback if missing
  const stops = trip?.stops?.filter(s => s.lat && s.lng) || [
    { cityName: 'Paris', lat: 48.8566, lng: 2.3522, highlight: 'Ate croissants by the Seine' },
    { cityName: 'Rome', lat: 41.9028, lng: 12.4964, highlight: 'Visited the Colosseum' },
    { cityName: 'Venice', lat: 45.4408, lng: 12.3155, highlight: 'Gondola ride at sunset' }
  ];

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    const startCoord = stops[0] ? [stops[0].lng, stops[0].lat] : [0, 0];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: startCoord,
      zoom: 1.5,
      pitch: 0,
      bearing: 0,
      interactive: false // Cinematic mode
    });

    map.current.on('style.load', () => {
      // Add 3D terrain
      map.current.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });
      map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

      // Start the animation sequence after a short delay
      setTimeout(() => {
        setIsPlaying(true);
      }, 1000);
    });

    return () => map.current?.remove();
  }, [stops]);

  useEffect(() => {
    if (!isPlaying || !map.current || stops.length === 0) return;

    let isSubscribed = true;

    const playSequence = async () => {
      for (let i = currentStopIndex; i < stops.length; i++) {
        if (!isSubscribed || !isPlaying) break;
        
        setCurrentStopIndex(i);
        const stop = stops[i];
        
        // Fly to the stop
        map.current.flyTo({
          center: [stop.lng, stop.lat],
          zoom: 14,
          pitch: 60,
          bearing: 45,
          speed: 0.8,
          curve: 1,
          essential: true
        });

        // Wait for flight to finish (approximate or use 'moveend' event)
        await new Promise(resolve => {
          map.current.once('moveend', resolve);
        });

        // Rotate slowly around the point for a cinematic feel
        if (!isSubscribed || !isPlaying) break;
        
        const startBearing = map.current.getBearing();
        for (let j = 0; j < 60; j++) {
          if (!isSubscribed || !isPlaying) break;
          map.current.easeTo({ bearing: startBearing + (j * 1), duration: 100, easing: x => x });
          await new Promise(r => setTimeout(r, 100));
        }
      }
      
      // If we finished the sequence
      if (isSubscribed && isPlaying) {
        setIsPlaying(false);
        map.current.flyTo({
          center: [stops[0].lng, stops[0].lat],
          zoom: 2,
          pitch: 0,
          bearing: 0,
          speed: 1
        });
        setCurrentStopIndex(0);
      }
    };

    playSequence();

    return () => {
      isSubscribed = false;
    };
  }, [isPlaying, currentStopIndex, stops]);

  const currentStop = stops[currentStopIndex];

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col">
      <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-white font-display font-semibold flex items-center gap-2">
          <span className="text-xl">🌍</span>
          Trip Recap: {trip?.name || 'Your Journey'}
        </h2>
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors backdrop-blur-sm">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        
        {/* Cinematic Overlay Element */}
        {currentStop && isPlaying && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-sm px-4">
            <motion.div
              key={currentStop.cityName}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-black/40 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-center shadow-2xl"
            >
              <h3 className="text-3xl font-display font-bold text-white mb-2 drop-shadow-lg">
                {currentStop.cityName}
              </h3>
              {currentStop.highlight && (
                <p className="text-white/90 text-sm font-medium italic drop-shadow-md">
                  "{currentStop.highlight}"
                </p>
              )}
            </motion.div>
          </div>
        )}

        {/* Playback Controls */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center z-20">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}
