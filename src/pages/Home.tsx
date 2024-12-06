import React from 'react';
import VideoCard from '../components/VideoCard';
import type { Video } from '../types';

const videos: Video[] = [
  {
    id: '1',
    title: 'Beautiful Coastal Sunrise - Nature Documentary',
    description: 'Experience the stunning views of coastal sunrise.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '10:32',
    views: 1234567,
    createdAt: '2 weeks ago',
    creator: {
      name: 'Nature Channel',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    },
  },
  {
    id: '2',
    title: 'Urban Photography Tips & Tricks - Complete Guide 2024',
    description: 'Learn professional urban photography techniques.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '15:45',
    views: 892345,
    createdAt: '5 days ago',
    creator: {
      name: 'Photo Academy',
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    },
  },
  {
    id: '3',
    title: 'Mountain Adventure - Epic Hiking Journey',
    description: 'Join us on an incredible mountain expedition.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '22:18',
    views: 567890,
    createdAt: '1 week ago',
    creator: {
      name: 'Adventure Time',
      avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12',
    },
  },
];

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}