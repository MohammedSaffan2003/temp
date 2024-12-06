import React from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';
import type { Video, Comment } from '../types';

// Mock data
const video: Video = {
  id: '1',
  title: 'Beautiful Coastal Sunrise - Nature Documentary',
  description: 'Experience the stunning views of coastal sunrise in this breathtaking documentary. Watch as we explore the magnificent coastline and witness nature\'s most spectacular show.',
  thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  duration: '10:32',
  views: 1234567,
  createdAt: '2 weeks ago',
  creator: {
    name: 'Nature Channel',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
  },
};

const comments: Comment[] = [
  {
    id: '1',
    content: 'This is absolutely stunning! The cinematography is breathtaking.',
    user: {
      name: 'Jane Smith',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    },
    createdAt: '2 days ago',
  },
  {
    id: '2',
    content: 'I\'ve been to this location, it\'s even more beautiful in person!',
    user: {
      name: 'Mike Johnson',
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    },
    createdAt: '1 day ago',
  },
];

export default function VideoPage() {
  const { id } = useParams();

  return (
    <div>
      <VideoPlayer video={video} />
      <CommentSection videoId={id!} initialComments={comments} />
    </div>
  );
}