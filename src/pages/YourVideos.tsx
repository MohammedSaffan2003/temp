import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { Video } from '../types';

export default function YourVideos() {
  const { token } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYourVideos = async () => {
      try {
        const response = await axios.get('/api/videos/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVideos(response.data);
      } catch (err) {
        setError('Failed to fetch your videos');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchYourVideos();
  }, [token]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600 mt-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Your Videos</h1>
      
      {videos.length === 0 ? (
        <div className="text-center text-gray-600 mt-8">
          You haven't uploaded any videos yet
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}