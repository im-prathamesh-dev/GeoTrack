import { motion } from 'framer-motion';
import { Map, MapPin, Zap, Activity } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Floating animated pulse dots for the background
const PulseDot = ({ delay, color, x, y, size }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 3] }}
    transition={{ duration: 4, repeat: Infinity, delay: delay, ease: "easeOut" }}
    className={`absolute rounded-full pointer-events-none ${color}`}
    style={{ left: x, top: y, width: size, height: size }}
  />
);

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      navigate('/', { replace: true });
      checkAuth();
    } else if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [location.search, checkAuth, navigate, isAuthenticated]);

  const handleGoogleLogin = () => {
    window.location.href = 'https://geotrackbackend.onrender.com/api/v1/auth/google';
  };

  return (
    <div className="relative min-h-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* --- LAYER 1: Dynamic Background Effects --- */}
      {/* Massive radial gradients for mood */}
      <div className="absolute top-0 -left-[20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050505] to-[#050505] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[80%] h-[80%] bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Radar / GPS grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

      {/* Radar sweeper circle */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/[0.03] pointer-events-none"
      >
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-indigo-500/[0.02] rounded-r-full" />
      </motion.div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.05] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/[0.08] pointer-events-none" />

      {/* GPS Mock Pings */}
      <PulseDot delay={0} color="bg-indigo-500" x="25%" y="30%" size="8px" />
      <PulseDot delay={1.5} color="bg-emerald-500" x="75%" y="60%" size="6px" />
      <PulseDot delay={3} color="bg-purple-500" x="40%" y="80%" size="10px" />

      {/* --- LAYER 2: Main Login Interface --- */}
      <div className="z-10 w-full max-w-[440px] px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[2.5rem] p-[2px] overflow-hidden group"
        >
          {/* Animated border glow */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)] opacity-40 group-hover:opacity-100 transition-opacity duration-500"
          />

          {/* Actual Card Body */}
          <div className="relative bg-neutral-950/80 backdrop-blur-2xl rounded-[calc(2.5rem-2px)] p-10 flex flex-col items-center">
            
            {/* Header / Logo */}
            <div className="flex flex-col items-center mb-12 w-full">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
                className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center p-[2px] shadow-[0_0_40px_rgba(99,102,241,0.4)] mb-8"
              >
                <div className="w-full h-full bg-neutral-950 rounded-[calc(1.5rem-2px)] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-emerald-400/20" />
                  <MapPin className="text-white w-8 h-8 relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" strokeWidth={2.5} />
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-extrabold text-white tracking-tight mb-3"
              >
                GeoTrack
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-neutral-400 text-center font-medium"
              >
                The world is your territory. <br/> Claim it.
              </motion.p>
            </div>

            {/* Auth Action */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full space-y-6"
            >
              <button
                onClick={handleGoogleLogin}
                className="w-full group relative flex items-center justify-center gap-4 bg-white hover:bg-neutral-100 text-neutral-900 px-6 py-4 rounded-2xl font-bold text-[15px] tracking-wide transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
                
                {/* Button Inner Glow */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 pointer-events-none" />
              </button>

              <div className="flex items-center justify-center gap-3 text-neutral-500 font-medium text-sm">
                <Activity size={16} className="text-emerald-500 animate-pulse" />
                <span>Join <strong className="text-white">2.5M+</strong> active runners</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1 }}
           className="mt-10 flex flex-col items-center gap-2"
        >
          <p className="text-center text-neutral-600 text-[11px] uppercase tracking-widest font-semibold font-mono">
            Secure connection established
          </p>
          <div className="flex gap-1 mb-2">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" style={{ animationDelay: `${i * 0.2}s`}} />
             ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
