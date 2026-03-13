import express from 'express';
import User from '../models/User.js';
import Contribution from '../models/Contribution.js';
import { protectedRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/members/me — full portfolio
router.get('/me', ...protectedRoute, async (req, res, next) => {
  try {
    const contributions = await Contribution.find({ member: req.user._id })
      .sort({ contributionDate: -1 })
      .populate('recordedBy', 'firstName lastName');

    const total = contributions.reduce((sum, c) => sum + c.amount, 0);

    // Monthly breakdown for chart
    const monthly = await Contribution.aggregate([
      { $match: { member: req.user._id } },
      {
        $group: {
          _id: { year: { $year: '$contributionDate' }, month: { $month: '$contributionDate' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      user: req.user,
      contributions,
      totalSavings: total,
      monthlyBreakdown: monthly,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/members/me — update own profile (bio, phone)
router.patch('/me', ...protectedRoute, async (req, res, next) => {
  try {
    const allowed = ['bio', 'phone'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key))
    );

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

export default router;
