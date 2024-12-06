import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import ffmpeg from 'fluent-ffmpeg';
import Video from '../models/Video';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!uploadedFiles.video?.[0] || !uploadedFiles.thumbnail?.[0]) {
      return res.status(400).json({ message: 'Video and thumbnail are required' });
    }

    // Generate HLS segments
    const videoPath = uploadedFiles.video[0].path;
    const outputDir = path.join(uploadsDir, uuidv4());
    fs.mkdirSync(outputDir, { recursive: true });

    const hlsPromise = new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .addOptions([
          '-profile:v baseline',
          '-level 3.0',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls'
        ])
        .output(path.join(outputDir, 'playlist.m3u8'))
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    await hlsPromise;

    // Upload HLS segments to Cloudinary
    const segmentFiles = fs.readdirSync(outputDir);
    const segmentUploadPromises = segmentFiles.map(file => 
      cloudinary.uploader.upload(path.join(outputDir, file), {
        resource_type: 'raw',
        folder: `videos/${path.basename(outputDir)}`
      })
    );

    const uploadedSegments = await Promise.all(segmentUploadPromises);

    // Upload thumbnail
    const thumbnailResult = await cloudinary.uploader.upload(uploadedFiles.thumbnail[0].path, {
      folder: 'thumbnails'
    });

    // Create video document
    const video = new Video({
      title,
      description,
      videoUrl: uploadedSegments.find(f => f.public_id.endsWith('playlist.m3u8'))?.secure_url,
      thumbnailUrl: thumbnailResult.secure_url,
      creator: req.user.userId,
      views: 0,
      likes: []
    });

    await video.save();

    // Cleanup
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.unlinkSync(videoPath);
    fs.unlinkSync(uploadedFiles.thumbnail[0].path);

    res.status(201).json(video);
  } catch (error) {
    console.error('Upload error:', error);
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
