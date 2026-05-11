import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Navigation } from 'lucide-react';
import useToast from '../../hooks/useToast';

export default function ARCameraView({ trip, onClose }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const videoRef = useRef(null);
  const toast = useToast();
  
  // Dummy data for memory pins if trip has none
  const memoryPins = trip?.memoryPins?.length > 0 ? trip.memoryPins : [
    { id: '1', title: 'Amazing pasta here!', note: 'We loved this little spot.', lat: 0, lng: 0, pseudoAngle: 45 },
    { id: '2', title: 'Great view', note: 'Sunset was incredible.', lat: 0, lng: 0, pseudoAngle: -30 },
  ];

  const requestPermissions = async () => {
    try {
      // 1. Camera Access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // 2. Device Orientation Access (iOS requires user interaction)
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          setHasPermission(true);
        } else {
          toast.error("Orientation access denied. Cannot use AR.");
        }
      } else {
        // Non-iOS or older devices
        window.addEventListener('deviceorientation', handleOrientation);
        setHasPermission(true);
      }
    } catch (err) {
      toast.error('Failed to access camera for AR view: ' + err.message);
    }
  };

  const handleOrientation = (event) => {
    // alpha: compass heading (0-360)
    // beta: front-to-back tilt (-180 to 180)
    // gamma: left-to-right tilt (-90 to 90)
    setOrientation({
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    });
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col">
      <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <h2 className="text-white font-display font-semibold flex items-center gap-2">
          <Camera size={20} className="text-accent" />
          AR Memory Drops
        </h2>
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors backdrop-blur-sm">
          <X size={20} />
        </button>
      </div>

      {!hasPermission ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white relative z-10">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-6">
            <Camera size={40} className="text-accent" />
          </div>
          <h3 className="text-2xl font-display font-bold mb-3">Enable AR Lens</h3>
          <p className="text-white/70 mb-8 max-w-sm">
            We need camera and motion permissions to overlay memory drops in the real world.
          </p>
          <button onClick={requestPermissions} className="btn-primary w-full max-w-xs py-4 text-lg">
            Grant Permissions
          </button>
        </div>
      ) : (
        <div className="relative flex-1">
          {/* Camera Feed */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* AR Overlay Container */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* 
              This is a simplified AR simulation. 
              In reality, you'd calculate the bearing to the pin's lat/lng, 
              compare it to event.alpha (compass heading), and translate X/Y.
              For hackathon visuals, we use the device's alpha/gamma to shift elements.
            */}
            {memoryPins.map((pin, i) => {
              // Simulate position based on orientation changes
              // We'll create a simple parallax effect using gamma and beta
              const xOffset = (orientation.gamma * 5) + (pin.pseudoAngle || (i * 40 - 20));
              const yOffset = (orientation.beta - 90) * 3;

              return (
                <motion.div
                  key={pin.id || i}
                  className="absolute left-1/2 top-1/2 pointer-events-auto"
                  animate={{
                    x: xOffset,
                    y: yOffset,
                    scale: 1 - Math.abs(yOffset) / 500
                  }}
                  transition={{ type: "spring", damping: 30, stiffness: 200 }}
                  style={{
                    opacity: Math.abs(xOffset) < 300 ? 1 : 0, // Fade out if "behind" or far off screen
                  }}
                >
                  <div className="glass-card bg-white/20 backdrop-blur-xl border-white/40 p-4 w-48 rounded-2xl shadow-2xl -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:bg-white/30 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center mb-2 shadow-lg">
                      <Navigation size={14} className="fill-current" />
                    </div>
                    <h4 className="font-display font-bold text-white text-sm mb-1 drop-shadow-md">{pin.title}</h4>
                    {pin.note && <p className="text-xs text-white/90 drop-shadow-md line-clamp-2">{pin.note}</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="absolute bottom-10 inset-x-0 flex justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white/80 text-sm flex items-center gap-3">
              <span className="animate-pulse w-2 h-2 rounded-full bg-accent"></span>
              Look around to find memories
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
