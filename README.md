# StreamHub - Video Streaming Platform

StreamHub is a full-stack video streaming platform built with the MERN stack (MongoDB, Express.js, React, Node.js). It features adaptive bitrate streaming, real-time chat, user authentication, and more.

## Features

- 🎥 Video streaming with adaptive bitrate
- 👥 User authentication (admin and regular users)
- 💬 Real-time chat between users
- 🔍 Video search functionality
- ❤️ Like and comment on videos
- 📱 Responsive design
- 📊 Admin dashboard
- 📝 User watch history
- 📂 Personal playlists
- 🎯 Recommended videos

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/streamhub.git
cd streamhub
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

4. Start the development server:
```bash
npm run dev
```

The application will start running at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
streamhub/
├── src/                    # Frontend source files
│   ├── components/         # React components
│   ├── context/           # React context providers
│   ├── pages/             # Page components
│   └── types/             # TypeScript type definitions
├── server/                # Backend source files
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── middleware/        # Express middleware
└── public/                # Static files
```

## API Routes

### Authentication
- POST `/api/auth/signup` - Create new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Videos
- GET `/api/videos` - List all videos
- GET `/api/videos/:id` - Get video details
- POST `/api/videos` - Upload new video
- PUT `/api/videos/:id` - Update video
- DELETE `/api/videos/:id` - Delete video

### Chat
- GET `/api/chat` - Get user's chat list
- GET `/api/chat/:chatId` - Get chat messages
- POST `/api/chat` - Create new chat
- POST `/api/chat/:chatId/messages` - Send message

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [Cloudinary](https://cloudinary.com/)