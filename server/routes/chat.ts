import express from 'express';
import { auth } from '../middleware/auth';
import Chat from '../models/Chat';
import User from '../models/User';

const router = express.Router();

// Get user's chat list
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.userId })
      .populate('participants', 'username avatarUrl')
      .sort({ lastMessage: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

// Get chat messages
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user.userId
    }).populate('messages.sender', 'username avatarUrl');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Create new chat
router.post('/', auth, async (req, res) => {
  try {
    const { participantId } = req.body;
    
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user.userId, participantId] }
    });
    
    if (existingChat) {
      return res.json(existingChat);
    }
    
    const chat = new Chat({
      participants: [req.user.userId, participantId],
      messages: []
    });
    
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat' });
  }
});

// Send message
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user.userId
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    chat.messages.push({
      sender: req.user.userId,
      content,
      timestamp: new Date()
    });
    
    chat.lastMessage = new Date();
    await chat.save();
    
    res.status(201).json(chat.messages[chat.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

export default router;