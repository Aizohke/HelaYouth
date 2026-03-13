import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, Loader2 } from 'lucide-react';

// ─── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return <Loader2 className={`animate-spin text-brand-600 ${sizes[size]} ${className}`} />;
}

// ─── Loading Screen ──────────────────────────────────────────────────────────
export function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Spinner size="lg" />
      <p className="text-stone-500 text-sm">{message}</p>
    </div>
  );
}

// ─── Alert ───────────────────────────────────────────────────────────────────
const alertStyles = {
  info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', Icon: Info },
  success: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', Icon: CheckCircle },
  warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', Icon: AlertCircle },
  error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', Icon: XCircle },
};

export function Alert({ type = 'info', title, children, className = '' }) {
  const { bg, text, Icon } = alertStyles[type];
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${bg} ${className}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${text}`} />
      <div>
        {title && <p className={`font-semibold text-sm mb-1 ${text}`}>{title}</p>}
        <div className={`text-sm ${text}`}>{children}</div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-stone-400" />
        </div>
      )}
      <h3 className="font-semibold text-stone-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-stone-400 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, subtext, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand: { bg: 'bg-brand-50', icon: 'text-brand-600', value: 'text-brand-700' },
    gold: { bg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', value: 'text-blue-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', value: 'text-purple-700' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', value: 'text-red-700' },
  };
  const c = colors[color] || colors.brand;

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
            <Icon className={`w-4.5 h-4.5 ${c.icon}`} />
          </div>
        )}
      </div>
      <p className={`text-2xl font-display font-bold ${c.value}`}>{value}</p>
      {subtext && <p className="text-xs text-stone-400 mt-1">{subtext}</p>}
      {trend && <p className={`text-xs mt-1 font-medium ${trend.up ? 'text-green-600' : 'text-red-500'}`}>{trend.label}</p>}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, label, showPercent = true, color = 'brand' }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  const colors = {
    brand: 'bg-brand-500',
    gold: 'bg-amber-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="space-y-1.5">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-stone-600">{label}</span>}
          {showPercent && <span className="font-semibold text-stone-700">{pct}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color] || colors.brand} rounded-full progress-bar`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    rejected: 'bg-red-100 text-red-800',
    admin: 'bg-purple-100 text-purple-800',
    member: 'bg-stone-100 text-stone-700',
    ongoing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    planning: 'bg-amber-100 text-amber-800',
    paused: 'bg-stone-100 text-stone-600',
  };
  return (
    <span className={`badge ${map[status] || 'bg-stone-100 text-stone-600'}`}>
      {status}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-stone-100 flex-shrink-0">
            <h3 className="font-display font-bold text-stone-800 text-lg">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
              <XCircle className="w-5 h-5 text-stone-400" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Format helpers ───────────────────────────────────────────────────────────
export function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(date, fmt = 'medium') {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-KE', { dateStyle: fmt }).format(new Date(date));
}
