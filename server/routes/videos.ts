import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Video from '../models/Video';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('creator', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos' });
  }
});

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

// Upload video
router.post('/', auth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Upload video to Cloudinary
    const videoResult = await cloudinary.uploader.upload(files.video[0].path, {
      resource_type: 'video',
      folder: 'videos'
    });

    // Upload thumbnail to Cloudinary
    const thumbnailResult = await cloudinary.uploader.upload(files.thumbnail[0].path, {
      folder: 'thumbnails'
    });

    const video = new Video({
      title,
      description,
      videoUrl: videoResult.secure_url,
      thumbnailUrl: thumbnailResult.secure_url,
      creator: req.user.userId,
      views: 0,
      likes: []
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading video' });
  }
});

// Like/unlike video
router.post('/:id/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const likeIndex = video.likes.indexOf(req.user.userId);
    if (likeIndex === -1) {
      video.likes.push(req.user.userId);
      await User.findByIdAndUpdate(req.user.userId, {
        $addToSet: { likedVideos: video._id }
      });
    } else {
      video.likes.splice(likeIndex, 1);
      await User.findByIdAndUpdate(req.user.userId, {
        $pull: { likedVideos: video._id }
      });
    }

    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error updating video likes' });
  }
});

// Track video view
router.post('/:id/view', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.views += 1;
    await video.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { watchHistory: video._id }
    });

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error tracking video view' });
  }
});

export default router;
