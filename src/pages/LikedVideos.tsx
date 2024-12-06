import React from 'react';
import VideoCard from '../components/VideoCard';
import type { Video } from '../types';

const likedVideos: Video[] = [
  {
    id: '1',
    title: 'Liked Video Example',
    description: 'This is a video you liked.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
    videoUrl: 'https://example.com/video1',
    duration: '12:34',
    views: 1234,
    createdAt: '1 hour ago',
    creator: {
      name: 'Video Creator',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    },
  },
];

export default function LikedVideos() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Liked Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {likedVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}