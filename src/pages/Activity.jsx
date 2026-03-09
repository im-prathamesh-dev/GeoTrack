import { useState, useEffect, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Square, Loader2, Target } from 'lucide-react';
import api from '../services/api';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

// Fix Leaflet Default Icon Issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom User Marker Icon
const userIcon = (color) => new L.DivIcon({
  className: 'custom-user-marker',
  html: `<div class="w-4 h-4 border-2 border-white rounded-full animate-pulse" style="background-color: ${color || '#6366f1'}; box-shadow: 0 0 15px ${color || '#6366f1'}cc;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Other Player Marker Icon
const otherPlayerIcon = (profilePic, color) => new L.DivIcon({
  className: 'other-player-marker',
  html: `<div class="relative w-8 h-8 rounded-full border-2 overflow-hidden" style="border-color: ${color || '#4ade80'}; box-shadow: 0 0 15px ${color || '#4ade80'}80;">
           <img src="${profilePic || 'https://ui-avatars.com/api/?name=Player&background=random'}" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to recenter map when location changes
function MapRecenter({ position, tracking }) {
  const map = useMap();
  useEffect(() => {
    if (position && tracking) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, tracking, map]);
  return null;
}

export default function Activity() {
  const { user } = useAuthStore();
  const [position, setPosition] = useState(null);
  const [route, setRoute] = useState(() => {
    const saved = localStorage.getItem('activeRoute');
    return saved ? JSON.parse(saved) : [];
  });
  const [isTracking, setIsTracking] = useState(() => !!localStorage.getItem('activeActivityId'));
  const [activityId, setActivityId] = useState(() => localStorage.getItem('activeActivityId') || null);
  const [loading, setLoading] = useState(true);
  const watchIdRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  
  const [otherUsers, setOtherUsers] = useState({});
  const [territories, setTerritories] = useState([]);
  const socketRef = useRef(null);

  const fetchTerritories = async () => {
    try {
      const res = await api.get('/territory');
      setTerritories(res.data);
    } catch (err) {
      console.error("Failed to fetch territories", err);
    }
  };

  // Fetch initial territories on load
  useEffect(() => {
    fetchTerritories();
  }, []);

  // Setup Socket.IO for live multiplayer tracking
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('locationUpdate', (data) => {
      // Don't render ourselves as an "other" player
      if (user && (data.userId === user.id || data.userId === user._id)) return;
      
      setOtherUsers((prev) => {
        const existing = prev[data.userId] || { route: [] };
        return {
          ...prev,
          [data.userId]: {
            ...data,
            route: [...existing.route, [data.lat, data.lng]]
          }
        };
      });
    });

    socketRef.current.on('activityEnded', (data) => {
      setOtherUsers((prev) => {
        const newUsers = { ...prev };
        delete newUsers[data.userId];
        return newUsers;
      });
    });

    socketRef.current.on('territoryUpdate', () => {
      fetchTerritories();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // Initialize and get initial location SUPER FAST (low accuracy to bypass satellite lock delay)
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setLoading(false);
        },
        (err) => {
          console.error("Error getting initial location, falling back:", err);
          // Dummy data for testing if geolocation fails
          setPosition([51.505, -0.09]);
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity }
      );
    } else {
      setLoading(false);
    }

    return () => {
      // Do nothing here so we don't accidentally clear the background tracker
    };
  }, []);

  // Background Geolocation Watcher for Tracking
  useEffect(() => {
    if (isTracking && activityId && 'geolocation' in navigator) {
      if (!watchIdRef.current) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            const newPos = [latitude, longitude];
            setPosition(newPos);
            
            setRoute((prev) => {
              const newRoute = [...prev, newPos];
              localStorage.setItem('activeRoute', JSON.stringify(newRoute));
              return newRoute;
            });

            // Sync with backend
            try {
              await api.post('/activity/location', { activityId, lat: latitude, lng: longitude });
            } catch (err) {
              console.error("Failed to sync location", err);
            }
          },
          (err) => console.error("Error watching location:", err),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      }
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTracking, activityId]);

  const startActivity = async () => {
    try {
      if (!position) return;
      // GeoJSON requires [lng, lat] format
      const startGeoJson = [position[1], position[0]];
      
      const res = await api.post('/activity/start', { startLocation: startGeoJson });
      const newId = res.data._id;
      
      setActivityId(newId);
      localStorage.setItem('activeActivityId', newId);
      
      const initialRoute = [position];
      setRoute(initialRoute);
      localStorage.setItem('activeRoute', JSON.stringify(initialRoute));
      
      setIsTracking(true);
    } catch (err) {
      console.error("Failed to start activity", err);
    }
  };

  const stopActivity = async () => {
    try {
      setIsTracking(false);

      // Finish activity on backend
      if (activityId) {
        await api.post('/activity/end', { activityId });
      }
      
      setActivityId(null);
      setRoute([]);
      
      localStorage.removeItem('activeActivityId');
      localStorage.removeItem('activeRoute');
    } catch (err) {
      console.error("Failed to stop activity", err);
    }
  };

  const handleRecenter = () => {
    if (mapInstance && position) {
      mapInstance.flyTo(position, 16, { duration: 1.5 });
    }
  };

  return (
    <div className="relative h-full w-full bg-neutral-950 flex flex-col">
      {/* Top Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[400] bg-gradient-to-b from-neutral-950/90 to-transparent p-6 pt-24 md:pt-6 pointer-events-none">
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">Live Activity</h1>
        <p className="text-neutral-300 text-sm font-medium drop-shadow-md">
          {isTracking ? "Recording your route..." : "Ready to start capturing?"}
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white">
          <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
          <p className="font-medium">Acquiring GPS Signal...</p>
        </div>
      ) : (
        <div className="flex-1 relative z-10 w-full h-full">
          {position && (
            <MapContainer 
              center={position} 
              zoom={15} 
              className="w-full h-full"
              zoomControl={false}
              ref={setMapInstance}
            >
              <TileLayer
                // Dark theme map tiles (using CartoDB Dark Matter)
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <Marker position={position} icon={userIcon(user?.color)} />
              
              {route.length > 1 && (
                <Polyline 
                  positions={route} 
                  color={user?.color || "#6366f1"} 
                  weight={5}
                  opacity={0.8}
                  className="animate-dash" // Defined in global css
                />
              )}

              {/* Render Global Controlled Territories */}
              {territories.map((t) => {
                // GeoJSON Polygon uses [lng, lat], but react-leaflet Polygon expects [lat, lng].
                // We must map and reverse the coordinate pairs for Leaflet to understand them properly.
                const leafletPositions = t.polygon.map(coord => [coord[1], coord[0]]);
                
                return (
                  <Polygon 
                    key={t._id}
                    positions={leafletPositions}
                    pathOptions={{ 
                      color: t.color || '#10b981', 
                      fillColor: t.color || '#10b981', 
                      fillOpacity: 0.35,
                      weight: 2
                    }}
                  />
                );
              })}

              {/* Render Other Live Players */}
              {Object.values(otherUsers).map((player) => (
                <Fragment key={player.userId}>
                  {player.route && player.route.length > 1 && (
                    <Polyline 
                      positions={player.route} 
                      color={player.color || "#10b981"} 
                      weight={5}
                      opacity={0.8}
                      className="animate-dash" 
                    />
                  )}
                  <Marker 
                    position={[player.lat, player.lng]} 
                    icon={otherPlayerIcon(player.profilePic, player.color)} 
                  />
                </Fragment>
              ))}

              <MapRecenter position={position} tracking={isTracking} />
            </MapContainer>
          )}

          {/* Action Overlay */}
          <div className="absolute bottom-32 md:bottom-12 left-0 right-0 z-[400] px-6 flex flex-col items-center pointer-events-none">
            
            <AnimatePresence>
              {isTracking && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 mb-6 flex gap-8 items-center pointer-events-auto shadow-2xl"
                >
                  <div className="text-center">
                    <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">Distance</p>
                    <p className="text-2xl font-bold text-white tracking-tighter">
                      {(route.length * 0.015).toFixed(2)} <span className="text-sm font-medium text-neutral-500">km</span>
                    </p>
                  </div>
                  <div className="w-[1px] h-10 bg-white/10"></div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">Time</p>
                    <p className="text-2xl font-bold text-white tracking-tighter">
                      --:--
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 pointer-events-auto items-center">
              {/* Recenter Button */}
              <button 
                onClick={handleRecenter}
                className="w-12 h-12 bg-neutral-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-neutral-700 transition-colors shadow-lg"
              >
                <Target size={20} />
              </button>

              {!isTracking ? (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startActivity}
                  className="bg-indigo-500 text-white w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.6)] border-4 border-indigo-400 hover:bg-indigo-400 transition-colors"
                >
                  <Play size={28} fill="currentColor" className="ml-1 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Start</span>
                </motion.button>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopActivity}
                  className="bg-red-500 text-white w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)] border-4 border-red-400 hover:bg-red-400 transition-colors"
                >
                  <Square size={24} fill="currentColor" className="mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Stop</span>
                </motion.button>
              )}
              
              <div className="w-12"></div> {/* Spacer to balance the layout */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
