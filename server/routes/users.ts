import express from 'express';
import { auth } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Get user's watch history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'watchHistory',
        populate: {
          path: 'creator',
          select: 'username avatarUrl'
        }
      })
      .select('watchHistory');

    res.json(user?.watchHistory || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching watch history' });
  }
});

// Get user's liked videos
router.get('/liked', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'likedVideos',
        populate: {
          path: 'creator',
          select: 'username avatarUrl'
        }
      })
      .select('likedVideos');

    res.json(user?.likedVideos || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching liked videos' });
  }
});

export default router;
