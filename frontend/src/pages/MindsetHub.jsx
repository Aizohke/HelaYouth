import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useAppUser } from '../context/UserContext';
import { getArticles, getSiteContent, createArticle } from '../services/api';
import { LoadingScreen, formatDate, Alert, Modal, Spinner, EmptyState } from '../components/shared';
import { BookOpen, PenLine, Eye, Heart, Clock, Tag, Quote, Plus } from 'lucide-react';

const CATEGORIES = ['all', 'mindset', 'finance', 'entrepreneurship', 'news', 'motivation', 'other'];

export default function MindsetHub() {
  const { isSignedIn } = useAuth();
  const { isApproved, isAdmin } = useAppUser();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [quote, setQuote] = useState(null);
  const [writeModal, setWriteModal] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, q] = await Promise.allSettled([
        getArticles({ category: category === 'all' ? undefined : category }),
        getSiteContent('quote_of_week'),
      ]);
      if (a.status === 'fulfilled') setArticles(a.value.data.articles || []);
      if (q.status === 'fulfilled') setQuote(q.value.data.content);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category]);

  const canWrite = isSignedIn && isApproved;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="section-title mb-2">Billionaire Mindset Hub</h1>
          <p className="text-stone-500 text-sm">Articles, insights, and wisdom from our community.</p>
        </div>
        {canWrite && (
          <button onClick={() => setWriteModal(true)} className="btn-primary">
            <PenLine className="w-4 h-4" /> Write Article
          </button>
        )}
      </div>

      {msg && <div className="mb-6"><Alert type={msg.type}>{msg.text}</Alert></div>}

      {/* Quote */}
      {quote?.text && (
        <div className="bg-gradient-to-r from-brand-50 to-amber-50 border border-brand-100 rounded-2xl p-5 mb-8 flex items-start gap-3">
          <Quote className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1.5">Quote of the Week</p>
            <blockquote className="font-display text-lg italic text-stone-800">"{quote.text}"</blockquote>
            <p className="text-sm text-stone-500 mt-1">— {quote.author}</p>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 capitalize ${
              category === cat ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {loading ? <LoadingScreen message="Loading articles…" /> : articles.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No articles yet"
          description={canWrite ? "Be the first to share your insights!" : "Check back soon for articles."}
          action={canWrite && (
            <button onClick={() => setWriteModal(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Write First Article
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}

      {writeModal && (
        <WriteArticleModal
          onClose={() => setWriteModal(false)}
          onSuccess={() => { setWriteModal(false); load(); setMsg({ type: 'success', text: 'Article published!' }); }}
        />
      )}
    </div>
  );
}

function ArticleCard({ article }) {
  const categoryColors = {
    mindset: 'bg-purple-100 text-purple-700',
    finance: 'bg-green-100 text-green-700',
    entrepreneurship: 'bg-blue-100 text-blue-700',
    news: 'bg-orange-100 text-orange-700',
    motivation: 'bg-yellow-100 text-yellow-700',
    other: 'bg-stone-100 text-stone-600',
  };

  return (
    <Link to={`/mindset/${article.slug}`}
      className="card p-5 flex flex-col hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
      {/* Category */}
      <div className="flex items-center justify-between mb-3">
        <span className={`badge capitalize text-xs ${categoryColors[article.category] || categoryColors.other}`}>
          <Tag className="w-3 h-3 mr-1" />{article.category}
        </span>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Clock className="w-3 h-3" />{article.readTime}m
        </div>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-stone-800 text-base leading-snug mb-2 group-hover:text-brand-700 transition-colors line-clamp-2">
        {article.title}
      </h3>

      {/* Excerpt */}
      <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 flex-1 mb-4">
        {article.excerpt}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
        <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-brand-700 text-[10px] font-bold">
            {article.author?.firstName?.[0]}{article.author?.lastName?.[0]}
          </span>
        </div>
        <span className="text-xs text-stone-500 flex-1 truncate">
          {article.author?.firstName} {article.author?.lastName}
        </span>
        <div className="flex items-center gap-2.5 text-xs text-stone-400">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views}</span>
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.likes?.length || 0}</span>
        </div>
      </div>
    </Link>
  );
}

function WriteArticleModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', content: '', category: 'mindset', readTime: 3 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required.'); return; }
    setLoading(true);
    try {
      await createArticle(form);
      onSuccess();
    } catch (err) { setError(err.response?.data?.message || 'Failed to publish.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open title="Write Article" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Title</label>
          <input className="input text-lg font-display" placeholder="Your article title…" required
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Category</label>
            <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Read Time (min)</label>
            <input type="number" min="1" max="60" className="input" value={form.readTime}
              onChange={(e) => setForm({ ...form, readTime: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Content</label>
          <textarea className="input min-h-[240px] resize-y font-body text-sm leading-relaxed" placeholder="Share your thoughts, insights, and wisdom with the community…"
            required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Spinner size="sm" /> : 'Publish Article'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
