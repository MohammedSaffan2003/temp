import React from 'react';
import { Link } from 'react-router-dom';
import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Link to={`/video/${video._id}`} className="group cursor-pointer block">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="mt-3 flex">
        <img
          src={video.creator.avatarUrl}
          alt={video.creator.username}
          className="h-9 w-9 rounded-full"
        />
        <div className="ml-3">
          <h3 className="text-sm font-semibold line-clamp-2 text-gray-900">
            {video.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{video.creator.username}</p>
          <p className="text-xs text-gray-500">
            {video.views.toLocaleString()} views • {new Date(video.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
