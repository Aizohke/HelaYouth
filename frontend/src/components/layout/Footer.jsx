import React from 'react';
import { Link } from 'react-router-dom';
import { Coins, Heart, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-950 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm">Hela Youth</p>
                <p className="text-[10px] text-brand-400 tracking-wider uppercase">The Billionaire Club</p>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              A youth self-help group dedicated to building financial literacy, community wealth, and lasting legacy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/mindset', label: 'Mindset Hub' },
                { to: '/recruitment', label: 'Join the Club' },
                { to: '/sign-in', label: 'Member Login' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-stone-400 hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">Contact Us</h4>
            <div className="space-y-2.5">
              <a href="mailto:info@helayouth.org" className="flex items-center gap-2 text-sm text-stone-400 hover:text-brand-400 transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                helaselfhelpgroup2025@gmail.com
              </a>
              <a href="tel:+254700000000" className="flex items-center gap-2 text-sm text-stone-400 hover:text-brand-400 transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +254 719344027
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">© {year} Hela Youth Self Help Group. All rights reserved.</p>
          <p className="text-xs text-stone-500 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the community
          </p>
        </div>
      </div>
    </footer>
  );
}
