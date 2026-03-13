import express from 'express';
import { getAuth } from '@clerk/express';
import { requireClerkAuth, attachUser } from '../middleware/auth.middleware.js';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/sync  — called after Clerk sign-up to create/sync DB user
router.post('/sync', requireClerkAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { email, firstName, lastName, phone, profileImageUrl } = req.body;

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // Check if this is the very first user → make them admin
      const userCount = await User.countDocuments();
      const isFirstUser = userCount === 0;

      user = await User.create({
        clerkId: userId,
        email,
        firstName,
        lastName,
        phone,
        profileImageUrl,
        role: isFirstUser ? 'admin' : 'member',
        status: isFirstUser ? 'approved' : 'pending',
      });

      return res.status(201).json({
        success: true,
        message: isFirstUser
          ? 'Admin account created successfully.'
          : 'Registration successful. Await admin approval.',
        user: sanitizeUser(user),
      });
    }

    // Sync profile updates from Clerk
    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.profileImageUrl = profileImageUrl || user.profileImageUrl;
    await user.save();

    res.json({ success: true, message: 'Profile synced.', user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me — get current user profile
router.get('/me', requireClerkAuth, attachUser, (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

function sanitizeUser(user) {
  const { __v, ...safe } = user.toObject({ virtuals: true });
  return safe;
}

export default router;
