import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Map, LayoutDashboard, History, Trophy, LogOut, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const { isAuthenticated, user, logout, isChecking } = useAuthStore();
  const location = useLocation();

  if (isChecking) {
    return (
      <div className="flex h-screen w-full bg-neutral-950 items-center justify-center pointer-events-none">
        <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Activity', path: '/activity', icon: <Map size={20} /> },
    { label: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
    { label: 'History', path: '/history', icon: <History size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-neutral-900/80 backdrop-blur-xl border-t border-white/10 z-50 px-6 py-3 pb-safe flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                isActive ? 'text-indigo-400' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-neutral-900/50 backdrop-blur-3xl border-r border-white/5 p-6 h-full shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Map className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 tracking-tight">GeoTrack</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'text-white' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/0 rounded-2xl opacity-100" />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
                <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-indigo-400' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                <span className="font-semibold tracking-wide relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-6">
          <div className="flex items-center gap-4 mb-6 px-4">
            <img 
              src={user?.profilePic || "https://ui-avatars.com/api/?name=User&background=random"} 
              alt="Avatar" 
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full border-2 border-white/10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || "User Name"}</p>
              <p className="text-xs text-neutral-400 truncate">{user?.email || "user@example.com"}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 relative overflow-y-auto overflow-x-hidden scroll-smooth ${location.pathname === '/activity' ? '' : 'md:pb-0 pb-24 md:pt-0 pt-20'}`}>
        {/* Mobile Top Header (Profile & Logout) */}
        <header className="md:hidden fixed top-0 w-full bg-neutral-900/80 backdrop-blur-xl border-b border-white/10 z-50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Map className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 tracking-tight">GeoTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <img 
              src={user?.profilePic || "https://ui-avatars.com/api/?name=User&background=random"} 
              alt="Profile" 
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full border border-white/20"
            />
            <button 
              onClick={logout}
              className="p-2 text-neutral-400 hover:text-white bg-white/5 rounded-full"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950 pointer-events-none" />
        <div className="relative z-10 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
