import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Settings, Film, Clock, ThumbsUp } from 'lucide-react';
import axios from 'axios';
import type { Video } from '../types';

export default function Profile() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'videos' | 'history' | 'liked'>('videos');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = '/api/videos/user';
        if (activeTab === 'history') {
          endpoint = '/api/users/history';
        } else if (activeTab === 'liked') {
          endpoint = '/api/users/liked';
        }

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVideos(response.data);
      } catch (err) {
        setError('Failed to fetch videos');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [activeTab, token]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center space-x-6">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-24 h-24 rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-4 flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                <Settings className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
              activeTab === 'videos'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Film className="h-5 w-5 mr-2" />
            Your Videos
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="h-5 w-5 mr-2" />
            Watch History
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
              activeTab === 'liked'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ThumbsUp className="h-5 w-5 mr-2" />
            Liked Videos
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-600 mt-8">{error}</div>
      ) : videos.length === 0 ? (
        <div className="text-center text-gray-600 mt-8">
          {activeTab === 'videos'
            ? "You haven't uploaded any videos yet"
            : activeTab === 'history'
            ? "You haven't watched any videos yet"
            : "You haven't liked any videos yet"}
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
