import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  Users, TrendingUp, Shield, BookOpen, Download,
  CheckCircle, ArrowRight, Star, Coins, Target, Heart
} from 'lucide-react';

const BENEFITS = [
  { icon: TrendingUp, title: 'Collective Savings', desc: 'Pool resources and grow wealth together through disciplined monthly contributions.' },
  { icon: Shield, title: 'Member Protection', desc: 'Welfare support for members during difficult times — because we look out for each other.' },
  { icon: BookOpen, title: 'Financial Education', desc: 'Access workshops, articles, and mentorship to build lasting financial literacy.' },
  { icon: Target, title: 'Investment Projects', desc: 'Participate in group investments and community projects with real returns.' },
  { icon: Users, title: 'Powerful Network', desc: 'Connect with like-minded young people committed to building generational wealth.' },
  { icon: Heart, title: 'Community Impact', desc: 'Give back and make a difference in our local community together.' },
];

const REQUIREMENTS = [
  'Be between 18–35 years of age',
  'Commit to monthly contributions (minimum KES 200)',
  'Attend at least 75% of group meetings',
  'Abide by the group constitution and bylaws',
  'Pay a one-time registration fee',
  'Maintain respectful conduct with all members',
];

const STEPS = [
  { num: '01', title: 'Register Online', desc: 'Create your account and fill in the membership application.' },
  { num: '02', title: 'Admin Review', desc: 'Our team reviews your application within 2–3 business days.' },
  { num: '03', title: 'Pay Registration', desc: 'Complete your one-time registration fee to activate your membership.' },
  { num: '04', title: 'Start Building', desc: 'Access your member portfolio, attend meetings, and start contributing.' },
];

export default function RecruitmentPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-brand-200 mb-6">
            <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
            Now Accepting New Members
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5 leading-tight">
            Join The Billionaire Club
          </h1>
          <p className="text-brand-200 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Hela Youth Self Help Group is a community of ambitious young people committed to financial discipline, collective growth, and lasting impact.
          </p>
          {!isSignedIn ? (
            <Link to="/sign-up" className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold px-8 py-3.5 rounded-xl transition-all duration-200 text-lg active:scale-95">
              <Coins className="w-5 h-5" /> Apply Now
            </Link>
          ) : (
            <Link to="/portfolio" className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-all">
              View My Portfolio <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title text-center mb-10">Why Join Hela Youth?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="font-semibold text-stone-800 mb-2">{title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-stone-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-10">How to Join</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center font-mono font-bold text-lg mx-auto mb-3 shadow-sm">
                  {num}
                </div>
                <h3 className="font-semibold text-stone-800 mb-1.5">{title}</h3>
                <p className="text-sm text-stone-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="section-title text-center mb-8">Membership Requirements</h2>
        <div className="card p-6">
          <ul className="space-y-3">
            {REQUIREMENTS.map((req) => (
              <li key={req} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <span className="text-stone-700 text-sm leading-relaxed">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Download Constitution */}
      <section className="bg-brand-50 py-12 border-y border-brand-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Shield className="w-10 h-10 text-brand-600 mx-auto mb-3" />
          <h2 className="font-display text-2xl font-bold text-stone-900 mb-3">Our Constitution</h2>
          <p className="text-stone-600 text-sm mb-5 max-w-xl mx-auto">
            Download the official Hela Youth Self Help Group constitution to understand our rules, values, and governance framework before applying.
          </p>
          <a
            href="/hela-youth-constitution.pdf"
            download="Hela-Youth-Constitution.pdf"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download Constitution (PDF)
          </a>
          <p className="text-xs text-stone-400 mt-3">PDF · Updated 2024</p>
        </div>
      </section>

      {/* Final CTA */}
      {!isSignedIn && (
        <section className="py-14 bg-white">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold text-stone-900 mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-stone-500 mb-6">
              Create your account today and take the first step toward financial freedom.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/sign-up" className="btn-primary px-8 py-3 text-base">
                Create Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/sign-in" className="btn-secondary px-8 py-3 text-base">
                Already a Member? Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
