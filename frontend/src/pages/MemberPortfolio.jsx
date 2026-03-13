import React, { useEffect, useState } from 'react';
import { getMyPortfolio } from '../services/api';
import { useAppUser } from '../context/UserContext';
import { StatCard, LoadingScreen, formatCurrency, formatDate, Alert, EmptyState } from '../components/shared';
import { TrendingUp, Calendar, Receipt, PiggyBank, BarChart3, User } from 'lucide-react';

export default function MemberPortfolio() {
  const { dbUser } = useAppUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyPortfolio()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load portfolio'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading your portfolio…" />;
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Alert type="error" title="Error">{error}</Alert>
    </div>
  );

  const { contributions = [], totalSavings = 0, monthlyBreakdown = [] } = data || {};

  const typeColors = {
    monthly: 'bg-brand-100 text-brand-700',
    special: 'bg-purple-100 text-purple-700',
    fine: 'bg-red-100 text-red-700',
    registration: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {dbUser?.profileImageUrl ? (
          <img src={dbUser.profileImageUrl} alt="" className="w-14 h-14 rounded-2xl object-cover shadow" />
        ) : (
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center">
            <span className="text-brand-700 font-display font-bold text-xl">
              {dbUser?.firstName?.[0]}{dbUser?.lastName?.[0]}
            </span>
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">
            {dbUser?.firstName} {dbUser?.lastName}
          </h1>
          <p className="text-sm text-stone-500 capitalize">{dbUser?.role} · Member since {formatDate(dbUser?.joinedAt)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Savings"
          value={formatCurrency(totalSavings)}
          icon={PiggyBank}
          color="brand"
          subtext="Cumulative contributions"
        />
        <StatCard
          label="Total Entries"
          value={contributions.length}
          icon={Receipt}
          color="gold"
          subtext="Contribution records"
        />
        <StatCard
          label="This Month"
          value={formatCurrency(
            contributions
              .filter((c) => new Date(c.contributionDate).getMonth() === new Date().getMonth())
              .reduce((s, c) => s + c.amount, 0)
          )}
          icon={Calendar}
          color="blue"
          subtext={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly breakdown chart (visual bars) */}
        <div className="card p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-stone-800">Monthly Trend</h2>
          </div>
          {monthlyBreakdown.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-2">
              {monthlyBreakdown.slice(-8).map((m) => {
                const month = new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' });
                const max = Math.max(...monthlyBreakdown.map((x) => x.total));
                const pct = max > 0 ? (m.total / max) * 100 : 0;
                return (
                  <div key={`${m._id.year}-${m._id.month}`} className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 w-8 flex-shrink-0">{month}</span>
                    <div className="flex-1 h-5 bg-stone-100 rounded-md overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-md flex items-center justify-end pr-1.5 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      >
                        {pct > 30 && <span className="text-[10px] text-white font-medium">{formatCurrency(m.total)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contribution history */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 p-5 border-b border-stone-100">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-stone-800">Contribution History</h2>
          </div>

          {contributions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No contributions yet"
              description="Your contribution history will appear here once entries are recorded by the admin."
            />
          ) : (
            <div className="divide-y divide-stone-50">
              {contributions.map((c) => (
                <div key={c._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 transition-colors">
                  <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-stone-800">{formatCurrency(c.amount)}</p>
                      <span className={`badge text-[10px] capitalize ${typeColors[c.type] || 'bg-stone-100 text-stone-600'}`}>
                        {c.type}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {formatDate(c.contributionDate)} · #{c.receiptNumber}
                      {c.description && ` · ${c.description}`}
                    </p>
                  </div>
                  <p className="text-xs text-stone-400 hidden sm:block flex-shrink-0">
                    by {c.recordedBy?.firstName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bio section */}
      {(dbUser?.bio || dbUser?.phone) && (
        <div className="card p-5 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-brand-600" />
            <h3 className="font-semibold text-stone-800">Profile Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {dbUser.email && (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-0.5">Email</p>
                <p className="text-stone-700">{dbUser.email}</p>
              </div>
            )}
            {dbUser.phone && (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-0.5">Phone</p>
                <p className="text-stone-700">{dbUser.phone}</p>
              </div>
            )}
            {dbUser.bio && (
              <div className="sm:col-span-2">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-0.5">Bio</p>
                <p className="text-stone-700">{dbUser.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
