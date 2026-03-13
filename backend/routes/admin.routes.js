import express from 'express';
import User from '../models/User.js';
import Contribution from '../models/Contribution.js';
import { adminRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/admin/members — list all members with stats
router.get('/members', ...adminRoute, async (req, res, next) => {
  try {
    const { status, role, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [members, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    // Get savings totals for each member
    const memberIds = members.map((m) => m._id);
    const savingsTotals = await Contribution.aggregate([
      { $match: { member: { $in: memberIds } } },
      { $group: { _id: '$member', total: { $sum: '$amount' } } },
    ]);
    const savingsMap = Object.fromEntries(savingsTotals.map((s) => [s._id.toString(), s.total]));

    const enriched = members.map((m) => ({
      ...m.toObject({ virtuals: true }),
      totalSavings: savingsMap[m._id.toString()] || 0,
    }));

    res.json({ success: true, members: enriched, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/members/:id/status — approve/reject
router.patch('/members/:id/status', ...adminRoute, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const update = { status };
    if (status === 'approved') {
      update.approvedAt = new Date();
      update.approvedBy = req.user._id;
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: `Member ${status}.`, user });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/members/:id/role — change role
router.patch('/members/:id/role', ...adminRoute, async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['member', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    // Prevent self-demotion
    if (req.params.id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot demote yourself.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: `Role updated to ${role}.`, user });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/stats — dashboard overview stats
router.get('/stats', ...adminRoute, async (req, res, next) => {
  try {
    const [memberStats, fundStats, pendingCount] = await Promise.all([
      User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Contribution.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            thisMonth: {
              $sum: {
                $cond: [
                  { $gte: ['$contributionDate', new Date(new Date().setDate(1))] },
                  '$amount',
                  0,
                ],
              },
            },
          },
        },
      ]),
      User.countDocuments({ status: 'pending' }),
    ]);

    const statusMap = Object.fromEntries(memberStats.map((s) => [s._id, s.count]));

    res.json({
      success: true,
      stats: {
        totalMembers: (statusMap.approved || 0) + (statusMap.pending || 0) + (statusMap.rejected || 0),
        approvedMembers: statusMap.approved || 0,
        pendingMembers: statusMap.pending || 0,
        rejectedMembers: statusMap.rejected || 0,
        totalFunds: fundStats[0]?.total || 0,
        totalContributions: fundStats[0]?.count || 0,
        thisMonthFunds: fundStats[0]?.thisMonth || 0,
        pendingApprovals: pendingCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
