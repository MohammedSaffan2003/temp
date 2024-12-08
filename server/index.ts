import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v2 as cloudinary } from 'cloudinary';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import videoRoutes from './routes/videos.js';
import chatRoutes from './routes/chat.js';
import userRoutes from './routes/users.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173","http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

// Store online users
const onlineUsers = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Cloudinary configuration
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// MongoDB connection with increased timeout
mongoose
  .connect(config.mongoUri, {
    ...config.mongodb.options,
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  const { userId, username, avatarUrl } = socket.handshake.auth;
  
  // Add user to online users
  onlineUsers.set(userId, { userId, username, avatarUrl });
  
  // Broadcast online users to all connected clients
  io.emit('users:online', Array.from(onlineUsers.values()));
  
  // Notify others that a new user connected
  socket.broadcast.emit('user:connected', { userId, username, avatarUrl });

  console.log('User connected:', username);

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${username} joined chat ${chatId}`);
  });

  socket.on('leave-chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${username} left chat ${chatId}`);
  });

  socket.on('send-message', ({ chatId, message }) => {
    io.to(chatId).emit('receive-message', message);
  });

  socket.on('disconnect', () => {
    // Remove user from online users
    onlineUsers.delete(userId);
    
    // Notify others that user disconnected
    io.emit('user:disconnected', userId);
    
    console.log('User disconnected:', username);
  });
});

const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}`);
  console.log(`Health check endpoint at http://localhost:${PORT}/health`);
});

export default app;
