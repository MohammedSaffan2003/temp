import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import type { Video, Comment } from '../types';

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
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`/api/videos/${id}`);
        setVideo(response.data);
      } catch (err) {
        setError('Failed to load video');
        console.error('Error fetching video:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVideo();
    }
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600 mt-8">{error}</div>;
  if (!video) return <div className="text-center text-gray-600 mt-8">Video not found</div>;

  return (
    <div>
      <VideoPlayer video={video} />
      <CommentSection videoId={id!} initialComments={comments} />
    </div>
  );
}
