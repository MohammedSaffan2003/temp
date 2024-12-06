import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { config } from '../config';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Create new user directly
    const user = new User({ 
      username, 
      email, 
      password,
      avatarUrl: `https://api.dicebear.com/7.x/avatars/svg?seed=${username}`,
      role: 'user'
    });

    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Return user data (excluding password) and token
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role
    };

    res.status(201).json({ user: userResponse, token });
  } catch (error: any) {
    console.error('Signup error:', error);
    // Send more specific error message
    res.status(400).json({ 
      message: error.code === 11000 
        ? 'Email or username already exists' 
        : error.message || 'Error creating user account'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { userId: user._id }, 
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('watchHistory')
      .populate('likedVideos');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

export default router;