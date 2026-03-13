import mongoose from 'mongoose';

// ─── Article / Blog Post ────────────────────────────────────────────────────
const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 300 },
    coverImage: { type: String },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['mindset', 'finance', 'entrepreneurship', 'news', 'motivation', 'other'],
      default: 'other',
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    isPublished: { type: Boolean, default: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 3 }, // minutes
    slug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// Auto-generate slug
articleSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80) + '-' + Date.now();
  }
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.replace(/<[^>]+>/g, '').substring(0, 280) + '...';
  }
  next();
});

export const Article = mongoose.model('Article', articleSchema);

// ─── Event ──────────────────────────────────────────────────────────────────
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 800 },
    eventDate: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, trim: true },
    isOnline: { type: Boolean, default: false },
    meetingLink: { type: String },
    type: {
      type: String,
      enum: ['meeting', 'event', 'deadline', 'workshop', 'social'],
      default: 'meeting',
    },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    color: { type: String, default: '#16a34a' },
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);

// ─── Site Content (singleton-style) ─────────────────────────────────────────
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SiteContent = mongoose.model('SiteContent', siteContentSchema);
