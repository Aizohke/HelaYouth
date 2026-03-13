import express from 'express';
import Project from '../models/Project.js';
import { Event, SiteContent } from '../models/index.js';
import { adminRoute, protectedRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// ─── PROJECTS ──────────────────────────────────────────────────────────────

router.get('/projects', async (req, res, next) => {
  try {
    const projects = await Project.find({ isPublic: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) { next(error); }
});

router.post('/projects', ...adminRoute, async (req, res, next) => {
  try {
    const project = await Project.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, project });
  } catch (error) { next(error); }
});

router.put('/projects/:id', ...adminRoute, async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, project });
  } catch (error) { next(error); }
});

router.delete('/projects/:id', ...adminRoute, async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (error) { next(error); }
});

// ─── EVENTS ────────────────────────────────────────────────────────────────

router.get('/events', async (req, res, next) => {
  try {
    const events = await Event.find({
      isPublic: true,
      eventDate: { $gte: new Date() },
    }).sort({ eventDate: 1 }).limit(10);
    res.json({ success: true, events });
  } catch (error) { next(error); }
});

router.get('/events/all', ...protectedRoute, async (req, res, next) => {
  try {
    const events = await Event.find().sort({ eventDate: -1 });
    res.json({ success: true, events });
  } catch (error) { next(error); }
});

router.post('/events', ...adminRoute, async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, event });
  } catch (error) { next(error); }
});

router.put('/events/:id', ...adminRoute, async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, event });
  } catch (error) { next(error); }
});

router.delete('/events/:id', ...adminRoute, async (req, res, next) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted.' });
  } catch (error) { next(error); }
});

// ─── SITE CONTENT (quote of the week, hero text, etc.) ─────────────────────

router.get('/site/:key', async (req, res, next) => {
  try {
    const content = await SiteContent.findOne({ key: req.params.key });
    res.json({ success: true, content: content?.value || null });
  } catch (error) { next(error); }
});

router.put('/site/:key', ...adminRoute, async (req, res, next) => {
  try {
    const { value } = req.body;
    const content = await SiteContent.findOneAndUpdate(
      { key: req.params.key },
      { value, updatedBy: req.user._id },
      { new: true, upsert: true }
    );
    res.json({ success: true, content: content.value });
  } catch (error) { next(error); }
});

export default router;
