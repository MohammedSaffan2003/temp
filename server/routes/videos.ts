import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Video from '../models/Video';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Search videos
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const searchQuery = q ? { $text: { $search: q as string } } : {};
    
    const videos = await Video.find(searchQuery)
      .populate('creator', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error searching videos' });
  }
});

// Get user's videos
router.get('/user', auth, async (req, res) => {
  try {
    const videos = await Video.find({ creator: req.user.userId })
      .populate('creator', 'username avatarUrl')
      .sort({ createdAt: -1 });
      
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user videos' });
  }
});

// Rest of the routes remain the same...

export default router;