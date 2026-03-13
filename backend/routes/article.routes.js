import express from 'express';
import { Article } from '../models/index.js';
import { protectedRoute, adminRoute, requireClerkAuth, attachUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/articles — public list
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category } = req.query;
    const filter = { isPublished: true };
    if (category && category !== 'all') filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('author', 'firstName lastName profileImageUrl role')
        .select('-content')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Article.countDocuments(filter),
    ]);

    res.json({ success: true, articles, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) { next(error); }
});

// GET /api/articles/:slug — single article
router.get('/:slug', async (req, res, next) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'firstName lastName profileImageUrl role bio');

    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });
    res.json({ success: true, article });
  } catch (error) { next(error); }
});

// POST /api/articles — member or admin can post
router.post('/', ...protectedRoute, async (req, res, next) => {
  try {
    const article = await Article.create({ ...req.body, author: req.user._id });
    res.status(201).json({ success: true, article });
  } catch (error) { next(error); }
});

// PUT /api/articles/:id — author or admin can edit
router.put('/:id', ...protectedRoute, async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });

    const isAuthor = article.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this article.' });
    }

    Object.assign(article, req.body);
    await article.save();
    res.json({ success: true, article });
  } catch (error) { next(error); }
});

// DELETE /api/articles/:id — admin only, or own article
router.delete('/:id', requireClerkAuth, attachUser, async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });

    const isAuthor = article.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await article.deleteOne();
    res.json({ success: true, message: 'Article deleted.' });
  } catch (error) { next(error); }
});

// POST /api/articles/:id/like — toggle like
router.post('/:id/like', ...protectedRoute, async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Not found.' });

    const idx = article.likes.indexOf(req.user._id);
    if (idx > -1) {
      article.likes.splice(idx, 1);
    } else {
      article.likes.push(req.user._id);
    }
    await article.save();
    res.json({ success: true, likes: article.likes.length, liked: idx === -1 });
  } catch (error) { next(error); }
});

export default router;
