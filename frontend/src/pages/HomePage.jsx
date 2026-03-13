import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppUser } from '../context/UserContext';
import { getFundSummary, getProjects, getEvents, getSiteContent } from '../services/api';
import { StatCard, ProgressBar, LoadingScreen, formatCurrency, formatDate, StatusBadge } from '../components/shared';
import {
  Users, TrendingUp, Briefcase, CalendarDays, ArrowRight,
  Quote, Star, ChevronRight, Award, Target
} from 'lucide-react';

export default function HomePage() {
  const { isAdmin } = useAppUser();
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [quote, setQuote] = useState(null);
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p, e, q, h] = await Promise.allSettled([
          getFundSummary(),
          getProjects(),
          getEvents(),
          getSiteContent('quote_of_week'),
          getSiteContent('hero_content'),
        ]);
        if (s.status === 'fulfilled') setSummary(s.value.data);
        if (p.status === 'fulfilled') setProjects(p.value.data.projects || []);
        if (e.status === 'fulfilled') setEvents(e.value.data.events || []);
        if (q.status === 'fulfilled') setQuote(q.value.data.content);
        if (h.status === 'fulfilled') setHero(h.value.data.content);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingScreen message="Loading Hela Youth…" />;

  const heroText = hero || {
    title: 'Building Wealth, Community & Legacy',
    subtitle: 'Hela Youth Self Help Group — The Billionaire Club. A platform for ambitious young people to save, invest, and grow together.',
  };

  const defaultQuote = {
    text: 'The secret to getting ahead is getting started.',
    author: 'Mark Twain',
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white overflow-hidden">
        {/* decorative */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-brand-800/60 border border-brand-700 rounded-full px-4 py-1.5 text-xs font-medium text-brand-300 mb-6">
              <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
              The Billionaire Club
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
              {heroText.title}
            </h1>

            <p className="text-lg text-brand-200 leading-relaxed mb-8 max-w-2xl">
              {heroText.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/sign-up" className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-brand-950 font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95">
                <Award className="w-4 h-4" />
                Join the Club
              </Link>
              <Link to="/mindset" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200">
                Mindset Hub
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Members"
            value={summary?.memberCount ?? '—'}
            icon={Users}
            color="brand"
            subtext="Approved members"
          />
          <StatCard
            label="Total Funds Saved"
            value={summary?.totalFunds ? formatCurrency(summary.totalFunds) : 'KES 0'}
            icon={TrendingUp}
            color="gold"
            subtext="Cumulative contributions"
          />
          <StatCard
            label="Active Projects"
            value={projects.filter((p) => p.status === 'ongoing').length}
            icon={Briefcase}
            color="blue"
            subtext="Ongoing initiatives"
          />
        </div>
      </section>

      {/* Quote of the Week */}
      {(quote || defaultQuote) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-gradient-to-r from-brand-50 to-amber-50 border border-brand-100 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Quote className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Quote of the Week</p>
                <blockquote className="font-display text-xl sm:text-2xl text-stone-800 italic leading-snug mb-3">
                  "{(quote || defaultQuote).text}"
                </blockquote>
                <p className="text-sm text-stone-500 font-medium">— {(quote || defaultQuote).author}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ongoing Projects */}
      {projects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Our Projects</h2>
            <StatusBadge status="ongoing" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.slice(0, 4).map((project) => (
              <div key={project._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-stone-800 mb-0.5">{project.title}</h3>
                    <p className="text-xs text-stone-400 capitalize">{project.category}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-stone-600 mb-4 line-clamp-2">{project.description}</p>
                <ProgressBar
                  value={project.raisedAmount}
                  max={project.targetAmount}
                  label={`${formatCurrency(project.raisedAmount)} of ${formatCurrency(project.targetAmount)}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Upcoming Events</h2>
            <CalendarDays className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <div key={event._id} className="card p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="w-14 h-14 bg-brand-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-brand-100">
                  <span className="text-xs font-bold text-brand-700 uppercase leading-none">
                    {new Date(event.eventDate).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-xl font-display font-bold text-brand-800 leading-none">
                    {new Date(event.eventDate).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-stone-800 text-sm truncate">{event.title}</h4>
                  <p className="text-xs text-stone-400 mt-0.5">{event.location || (event.isOnline ? 'Online' : 'TBA')}</p>
                </div>
                <span className="badge bg-stone-100 text-stone-600 capitalize text-xs hidden sm:inline-flex">
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-brand-600 py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Target className="w-10 h-10 text-brand-200 mx-auto mb-4" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Build Your Future?
          </h2>
          <p className="text-brand-200 mb-6">
            Join the Hela Youth Self Help Group and start your journey toward financial freedom.
          </p>
          <Link to="/recruitment" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors">
            Learn More <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
