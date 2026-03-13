import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useAppUser } from '../context/UserContext';
import { getArticle, likeArticle, deleteArticle } from '../services/api';
import { LoadingScreen, formatDate, Alert } from '../components/shared';
import { ArrowLeft, Heart, Eye, Clock, Trash2, Tag } from 'lucide-react';

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { dbUser, isAdmin, isApproved } = useAppUser();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    getArticle(slug)
      .then((r) => {
        setArticle(r.data.article);
        setLikeCount(r.data.article.likes?.length || 0);
        if (dbUser) setLiked(r.data.article.likes?.includes(dbUser._id));
      })
      .catch(() => setError('Article not found.'))
      .finally(() => setLoading(false));
  }, [slug, dbUser]);

  const handleLike = async () => {
    if (!isSignedIn || !isApproved) return;
    try {
      const r = await likeArticle(article._id);
      setLiked(r.data.liked);
      setLikeCount(r.data.likes);
    } catch {}
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this article? This cannot be undone.')) return;
    try {
      await deleteArticle(article._id);
      navigate('/mindset');
    } catch { alert('Failed to delete.'); }
  };

  if (loading) return <LoadingScreen />;
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <Alert type="error" title="Not Found">{error}</Alert>
      <Link to="/mindset" className="btn-secondary mt-4 inline-flex">← Back to Hub</Link>
    </div>
  );

  const isAuthor = dbUser && article.author?._id === dbUser._id;
  const canDelete = isAdmin || isAuthor;

  const categoryColors = {
    mindset: 'bg-purple-100 text-purple-700',
    finance: 'bg-green-100 text-green-700',
    entrepreneurship: 'bg-blue-100 text-blue-700',
    news: 'bg-orange-100 text-orange-700',
    motivation: 'bg-yellow-100 text-yellow-700',
    other: 'bg-stone-100 text-stone-600',
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <Link to="/mindset" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Mindset Hub
      </Link>

      {/* Category & meta */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className={`badge capitalize text-xs ${categoryColors[article.category] || categoryColors.other}`}>
          <Tag className="w-3 h-3 mr-1" />{article.category}
        </span>
        <span className="flex items-center gap-1 text-xs text-stone-400">
          <Clock className="w-3.5 h-3.5" /> {article.readTime} min read
        </span>
        <span className="flex items-center gap-1 text-xs text-stone-400">
          <Eye className="w-3.5 h-3.5" /> {article.views} views
        </span>
      </div>

      {/* Title */}
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 leading-tight mb-6">
        {article.title}
      </h1>

      {/* Author */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
            <span className="text-brand-700 font-bold text-sm">
              {article.author?.firstName?.[0]}{article.author?.lastName?.[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-stone-800 text-sm">
              {article.author?.firstName} {article.author?.lastName}
            </p>
            <p className="text-xs text-stone-400">
              {formatDate(article.createdAt)} · {article.author?.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={!isSignedIn || !isApproved}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              liked
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            } disabled:opacity-40`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
            {likeCount}
          </button>

          {canDelete && (
            <button onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-stone max-w-none">
        {article.content.split('\n').map((para, i) =>
          para.trim() ? (
            <p key={i} className="text-stone-700 leading-relaxed mb-4 text-base">
              {para}
            </p>
          ) : <br key={i} />
        )}
      </div>

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs">#{tag}</span>
          ))}
        </div>
      )}

      {!isSignedIn && (
        <div className="mt-8 p-5 bg-brand-50 border border-brand-100 rounded-2xl text-center">
          <p className="text-stone-700 font-medium mb-3">Join the Billionaire Club to like and comment on articles.</p>
          <Link to="/sign-up" className="btn-primary text-sm">Join Now</Link>
        </div>
      )}
    </article>
  );
}
