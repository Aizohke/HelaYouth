import { requireAuth, getAuth } from '@clerk/express';
import User from '../models/User.js';

// Require valid Clerk session
export const requireClerkAuth = requireAuth({
  signInUrl: '/sign-in',
});

// Attach our MongoDB user to req.user
export const attachUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found. Please complete registration.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Require approved status
export const requireApproved = (req, res, next) => {
  if (req.user.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending approval by an administrator.',
    });
  }
  next();
};

// Require Admin role
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator role required.',
    });
  }
  next();
};

// Shorthand: full protected chain
export const protectedRoute = [requireClerkAuth, attachUser, requireApproved];
export const adminRoute = [requireClerkAuth, attachUser, requireApproved, requireAdmin];
