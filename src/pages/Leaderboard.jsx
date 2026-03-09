import { motion } from 'framer-motion';
import { Trophy, Medal, Hexagon, ChevronUp } from 'lucide-react';

import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/user/leaderboard');
        // Ensure there are at least 3 players for the podium array slicing logic by padding with blanks if necessary
        let data = res.data;
        while(data.length < 3) {
           data.push({ id: `blank-${data.length}`, name: '---', area: '0.00', rank: data.length+1, points: 0, previousR: data.length+1 });
        }
        setLeaders(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="p-10 flex justify-center text-white"><span className="animate-pulse">Loading Leaderboard...</span></div>;

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-4xl mx-auto min-h-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
          <Trophy size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Leaderboard</h1>
          <p className="text-neutral-400">Top territory conquerors this month</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-2 md:gap-4 mb-16 mt-12 px-2">
        {/* 2nd Place */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center flex-1 order-1 max-w-[120px]"
        >
          <div className="relative mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-neutral-800 border-4 border-gray-400 overflow-hidden shadow-[0_0_20px_rgba(156,163,175,0.3)]">
              <img src={`https://ui-avatars.com/api/?name=${leaders[1].name}&background=random`} alt="2nd" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-400 text-neutral-900 rounded-full p-1 border-2 border-neutral-950">
              <Medal size={16} />
            </div>
          </div>
          <p className="font-bold text-white text-center truncate w-full px-2 text-sm">{leaders[1].name}</p>
          <p className="text-gray-400 text-xs font-semibold">{leaders[1].area} km²</p>
          <div className="w-full h-24 md:h-32 bg-gradient-to-t from-neutral-800 to-gray-700/50 rounded-t-2xl mt-4 border border-white/5 border-b-0 flex items-center justify-center">
            <span className="text-2xl font-black text-gray-400 opacity-50">2</span>
          </div>
        </motion.div>

        {/* 1st Place */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center flex-[1.2] order-2 max-w-[140px] z-10"
        >
          <div className="relative mb-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-neutral-800 border-4 border-yellow-500 overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.5)]">
              <img src={`https://ui-avatars.com/api/?name=${leaders[0].name}&background=random`} alt="1st" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-neutral-900 rounded-full p-1.5 border-2 border-neutral-950">
              <Trophy size={20} fill="currentColor" />
            </div>
          </div>
          <p className="font-bold text-white text-center truncate w-full px-2">{leaders[0].name}</p>
          <p className="text-yellow-500 text-sm font-bold">{leaders[0].area} km²</p>
          <div className="w-full h-32 md:h-40 bg-gradient-to-t from-neutral-800 to-yellow-600/40 rounded-t-2xl mt-4 border border-yellow-500/30 border-b-0 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <span className="text-4xl font-black text-yellow-500 opacity-80">1</span>
          </div>
        </motion.div>

        {/* 3rd Place */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center flex-1 order-3 max-w-[120px]"
        >
          <div className="relative mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-neutral-800 border-4 border-amber-700 overflow-hidden shadow-[0_0_20px_rgba(180,83,9,0.3)]">
              <img src={`https://ui-avatars.com/api/?name=${leaders[2].name}&background=random`} alt="3rd" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white rounded-full p-1 border-2 border-neutral-950">
              <Medal size={16} />
            </div>
          </div>
          <p className="font-bold text-white text-center truncate w-full px-2 text-sm">{leaders[2].name}</p>
          <p className="text-amber-600 text-xs font-semibold">{leaders[2].area} km²</p>
          <div className="w-full h-20 md:h-24 bg-gradient-to-t from-neutral-800 to-amber-700/40 rounded-t-2xl mt-4 border border-white/5 border-b-0 flex items-center justify-center">
            <span className="text-2xl font-black text-amber-700 opacity-50">3</span>
          </div>
        </motion.div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {leaders.slice(3).map((player, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
            key={player.id} 
            className={`flex items-center p-4 rounded-2xl border transition-all duration-300 group
              ${player.isUser 
                ? 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                : 'bg-neutral-900/40 border-white/5 hover:border-white/10 hover:bg-neutral-800/60'
              }`}
          >
            <div className="w-10 text-center font-bold text-neutral-500 text-lg">
              {player.rank}
            </div>
            
            <div className="flex-1 flex items-center gap-4 ml-2">
              <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                 <img src={`https://ui-avatars.com/api/?name=${player.name}&background=random`} alt={player.name} />
              </div>
              <div>
                <p className={`font-semibold text-base ${player.isUser ? 'text-indigo-400' : 'text-white'}`}>
                  {player.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                  <span className="flex items-center text-green-400">
                    <ChevronUp size={12} className="mr-0.5" /> 
                    {player.previousR - player.rank}
                  </span>
                  <span>•</span>
                  <span>{player.points.toLocaleString()} pts</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-white font-bold text-lg">
                <Hexagon size={16} className={player.isUser ? 'text-indigo-400' : 'text-neutral-400'} />
                {player.area}
              </div>
              <p className="text-xs text-neutral-500">km² captured</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
