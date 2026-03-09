import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Play, TrendingUp, MapPin, Trophy, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ activities: 0, territoryArea: 0, rank: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, leaderboardRes] = await Promise.all([
          api.get('/user/stats'),
          api.get('/user/leaderboard')
        ]);
        
        setStats({
          activities: statsRes.data.activities,
          territoryArea: statsRes.data.territoryArea,
          rank: statsRes.data.rank
        });
        setRecentActivities(statsRes.data.recentActivities);
        // Ensure there are at least 3 players for the preview layout
        let playersData = leaderboardRes.data.slice(0, 3);
        while(playersData.length < 3) {
           playersData.push({ id: `blank-${playersData.length}`, name: '---', area: '0.00', rank: playersData.length+1 });
        }
        setTopPlayers(playersData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return <div className="p-10 flex justify-center text-white"><span className="animate-pulse">Loading Dashboard...</span></div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", bounce: 0.4 } }
  };

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-6xl mx-auto">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Runner'}!
            </h1>
            <p className="text-neutral-400">Ready to expand your territory?</p>
          </div>
          <div className="hidden md:block">
            <button 
              onClick={() => navigate('/activity')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Play size={18} fill="currentColor" />
              <span>Start Activity</span>
            </button>
          </div>
        </motion.div>

        {/* Floating Action Button for Mobile */}
        <div className="md:hidden fixed bottom-24 right-6 z-40">
          <button 
            onClick={() => navigate('/activity')}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:bg-indigo-400 active:scale-90 transition-transform"
          >
            <Play size={24} fill="currentColor" className="ml-1" />
          </button>
        </div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <Navigation size={20} />
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Activities</h3>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">{stats.activities}</p>
          </div>
          
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                <MapPin size={20} />
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Total Area</h3>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {stats.territoryArea} <span className="text-xl md:text-2xl text-neutral-500">km²</span>
            </p>
          </div>

          <div className="col-span-2 md:col-span-1 bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Trophy size={20} />
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Global Rank</h3>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              #{stats.rank} <span className="text-base font-normal text-green-400 align-middle ml-2 group-hover:-translate-y-1 transition-transform inline-block"><TrendingUp size={16} className="inline mr-1"/>Up 2</span>
            </p>
          </div>
        </motion.div>

        {/* Main Sections Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Activities Preview */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Recent Activities</h2>
              <Link to="/history" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">View all</Link>
            </div>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                  <MapPin className="text-neutral-600 mb-2" size={24} />
                  <p className="text-neutral-400 text-sm">No recent activities.</p>
                </div>
              ) : (
                recentActivities.map(activity => (
                  <div key={activity.id} className="bg-neutral-900/40 hover:bg-neutral-800/60 border border-white/5 hover:border-white/10 p-4 rounded-2xl transition-all duration-300 flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPin className="text-indigo-400" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{activity.title}</p>
                        <p className="text-xs text-neutral-500 mt-1">{activity.date}</p>
                      </div>
                    </div>
                    <div className="text-green-400 font-medium bg-green-400/10 px-3 py-1.5 rounded-lg whitespace-nowrap">
                      {activity.area}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Leaderboard Preview */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Top Players</h2>
              <Link to="/leaderboard" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">Full Leaderboard</Link>
            </div>
            <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-1 overflow-hidden">
              {topPlayers.map((player, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 ${idx !== 2 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                        idx === 1 ? 'bg-gray-400/20 text-gray-400' : 
                        'bg-amber-700/20 text-amber-600'}`
                    }>
                      #{player.rank}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden">
                         <img src={`https://ui-avatars.com/api/?name=${player.name}&background=random`} alt={player.name} />
                      </div>
                      <span className="font-medium text-white">{player.name}</span>
                    </div>
                  </div>
                  <span className="text-neutral-400 text-sm font-medium">{player.area} km²</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
