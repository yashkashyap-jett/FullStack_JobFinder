import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, LayoutDashboard, FileText, Bookmark,
  User, LogOut, ChevronDown, Menu, X, Bell, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Badge from './Badge';

const candidateLinks = [
  { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/candidate/jobs',      icon: Briefcase,       label: 'Browse Jobs' },
  { to: '/candidate/applications', icon: FileText,     label: 'Applications' },
  { to: '/candidate/bookmarks', icon: Bookmark,        label: 'Bookmarks' },
  { to: '/candidate/profile',   icon: User,            label: 'Profile' },
];

const recruiterLinks = [
  { to: '/recruiter/dashboard', icon: LayoutDashboard,  label: 'Dashboard' },
  { to: '/recruiter/jobs',      icon: Building2,        label: 'My Jobs' },
  { to: '/recruiter/profile',   icon: User,             label: 'Profile' },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const links = user?.role === 'recruiter' ? recruiterLinks : candidateLinks;

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-surface-800/80 bg-surface-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-100 text-lg tracking-tight">
              Job<span className="gradient-text">Finder</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    id="nav-profile-btn"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-surface-700 hover:border-surface-600 hover:bg-surface-800 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-medium text-slate-200 leading-none">{user?.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        <Badge variant={user?.role}>{user?.role}</Badge>
                      </p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 glass-card border border-surface-700 shadow-xl shadow-black/40 p-1.5 origin-top-right"
                      >
                        <div className="px-3 py-2 mb-1">
                          <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <div className="border-t border-surface-800 my-1" />
                        <button
                          id="nav-logout-btn"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile hamburger */}
                <button
                  id="nav-mobile-menu-btn"
                  className="md:hidden btn-ghost p-2"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-surface-800 bg-surface-950/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-600/15 text-brand-400'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-surface-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
              <div className="border-t border-surface-800 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
