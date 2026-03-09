import { motion } from 'framer-motion';
import { History as HistoryIcon, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';

import { useState, useEffect } from 'react';
import api from '../services/api';

export default function History() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/user/history');
        setActivities(res.data);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="p-10 flex justify-center text-white"><span className="animate-pulse">Loading History...</span></div>;

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-4xl mx-auto min-h-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <HistoryIcon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Activity History</h1>
          <p className="text-neutral-400">Your past conquests and routes</p>
        </div>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4 text-neutral-500">
              <MapPin size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Activities Yet</h3>
            <p className="text-neutral-400 max-w-sm">
              Your history is empty. Head over to the Activity tab and start conquering some territory!
            </p>
          </div>
        ) : (
          activities.map((activity, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              key={activity.id}
              className="group block relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
              <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 hover:border-white/10 p-5 md:p-6 rounded-3xl flex flex-col md:flex-row md:items-center gap-6 cursor-pointer transition-all duration-300">
                
                {/* Fake Map Preview */}
                <div className="w-full md:w-48 h-32 md:h-full min-h-[100px] rounded-2xl bg-neutral-800 shrink-0 relative overflow-hidden border border-white/5">
                  <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/15/16374/10895.png')] opacity-30 invert hue-rotate-[180deg] bg-cover bg-center mix-blend-screen" />
                  {/* SVG Route Graphic (abstract mock) */}
                  <svg className="absolute inset-0 w-full h-full p-4 overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <path 
                      d="M10,25 Q30,5 50,25 T90,25" 
                      fill="none" 
                      stroke={`var(--${activity.color}-500, #818cf8)`} 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                    />
                    <circle cx="90" cy="25" r="4" fill="#fff" className={`shadow-[0_0_10px_var(--${activity.color}-500)]`} />
                  </svg>
                </div>
  
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {activity.title}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 group-hover:bg-indigo-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                      <ArrowRight size={16} />
                    </div>
                  </div>
  
                  <div className="flex flex-wrap gap-4 text-sm text-neutral-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-neutral-500" />
                      <span>{activity.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-neutral-500" />
                      <span>{activity.duration}</span>
                    </div>
                  </div>
  
                  <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Distance</p>
                      <p className="font-semibold text-white">{activity.distance}</p>
                    </div>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Area Captured</p>
                      <p className="font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded text-sm -ml-2">
                        {activity.area}
                      </p>
                    </div>
                  </div>
                </div>
  
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
