import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useAppUser } from '../../context/UserContext';
import {
  Menu, X, TrendingUp, Home, BookOpen, Users,
  LayoutDashboard, LogOut, User, ChevronDown, Coins
} from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isSignedIn, signOut } = useAuth();
  const { dbUser, isAdmin } = useAppUser();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/mindset', label: 'Mindset Hub', icon: BookOpen },
    { to: '/recruitment', label: 'Join Us', icon: Users },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setOpen(false);
    setProfileOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200' : 'bg-white border-b border-stone-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-stone-900 leading-tight text-base">Hela Youth</p>
              <p className="text-[10px] text-brand-600 font-medium tracking-wider uppercase leading-tight">The Billionaire Club</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {isSignedIn && dbUser?.status === 'approved' && (
              <NavLink
                to="/portfolio"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`
                }
              >
                My Portfolio
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <Link to="/sign-in" className="text-sm text-stone-600 hover:text-stone-900 font-medium px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors">
                  Sign In
                </Link>
                <Link to="/sign-up" className="btn-primary text-sm py-2">
                  Join the Club
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  {dbUser?.profileImageUrl ? (
                    <img src={dbUser.profileImageUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                      <span className="text-brand-700 font-semibold text-sm">
                        {dbUser?.firstName?.[0]}{dbUser?.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-stone-800 leading-tight">{dbUser?.firstName}</p>
                    <p className="text-xs text-stone-500 capitalize leading-tight">{dbUser?.role || 'member'}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-800">{dbUser?.firstName} {dbUser?.lastName}</p>
                      <p className="text-xs text-stone-400 truncate">{dbUser?.email}</p>
                    </div>
                    {dbUser?.status === 'approved' && (
                      <Link to="/portfolio" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                        <TrendingUp className="w-4 h-4" /> My Portfolio
                      </Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-stone-100" />
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1 animate-slide-up">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-700 hover:bg-stone-50'
                }`
              }>
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
          {isSignedIn && dbUser?.status === 'approved' && (
            <NavLink to="/portfolio" onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-700 hover:bg-stone-50'
                }`
              }>
              <TrendingUp className="w-4 h-4" /> My Portfolio
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50">
              <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
            </NavLink>
          )}
          <div className="pt-2 border-t border-stone-100">
            {!isSignedIn ? (
              <div className="flex gap-2">
                <Link to="/sign-in" onClick={() => setOpen(false)} className="flex-1 btn-secondary justify-center text-sm py-2">Sign In</Link>
                <Link to="/sign-up" onClick={() => setOpen(false)} className="flex-1 btn-primary justify-center text-sm py-2">Join</Link>
              </div>
            ) : (
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
