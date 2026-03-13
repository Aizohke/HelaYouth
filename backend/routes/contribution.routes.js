import express from 'express';
import Contribution from '../models/Contribution.js';
import User from '../models/User.js';
import { protectedRoute, adminRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/contributions/my — member's own contributions
router.get('/my', ...protectedRoute, async (req, res, next) => {
  try {
    const contributions = await Contribution.find({ member: req.user._id })
      .sort({ contributionDate: -1 })
      .populate('recordedBy', 'firstName lastName');

    const total = contributions.reduce((sum, c) => sum + c.amount, 0);

    res.json({ success: true, contributions, total, currency: 'KES' });
  } catch (error) {
    next(error);
  }
});

// GET /api/contributions/summary — total fund stats (public-ish)
router.get('/summary', async (req, res, next) => {
  try {
    const result = await Contribution.aggregate([
      {
        $group: {
          _id: null,
          totalFunds: { $sum: '$amount' },
          totalContributions: { $count: {} },
        },
      },
    ]);

    const memberCount = await User.countDocuments({ status: 'approved' });

    res.json({
      success: true,
      totalFunds: result[0]?.totalFunds || 0,
      totalContributions: result[0]?.totalContributions || 0,
      memberCount,
      currency: 'KES',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/contributions — admin adds contribution for a member
router.post('/', ...adminRoute, async (req, res, next) => {
  try {
    const { memberId, amount, type, description, contributionDate } = req.body;

    if (!memberId || !amount) {
      return res.status(400).json({ success: false, message: 'memberId and amount are required.' });
    }

    const member = await User.findById(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

    const contribution = await Contribution.create({
      member: memberId,
      amount: Number(amount),
      type: type || 'monthly',
      description,
      contributionDate: contributionDate || new Date(),
      recordedBy: req.user._id,
    });

    await contribution.populate('member', 'firstName lastName email');
    await contribution.populate('recordedBy', 'firstName lastName');

    res.status(201).json({ success: true, contribution });
  } catch (error) {
    next(error);
  }
});

// GET /api/contributions/member/:id — admin views specific member's contributions
router.get('/member/:id', ...adminRoute, async (req, res, next) => {
  try {
    const contributions = await Contribution.find({ member: req.params.id })
      .sort({ contributionDate: -1 })
      .populate('recordedBy', 'firstName lastName');

    const total = contributions.reduce((sum, c) => sum + c.amount, 0);
    res.json({ success: true, contributions, total });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/contributions/:id — admin only
router.delete('/:id', ...adminRoute, async (req, res, next) => {
  try {
    const contribution = await Contribution.findByIdAndDelete(req.params.id);
    if (!contribution) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Contribution deleted.' });
  } catch (error) {
    next(error);
  }
});

export default router;
