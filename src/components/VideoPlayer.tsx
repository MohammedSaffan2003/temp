import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { ThumbsUp, MessageCircle, Share2, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface VideoPlayerProps {
  video: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    creator: {
      name: string;
      avatarUrl: string;
    };
    views: number;
    likes: string[];
    createdAt: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && video.likes) {
      setIsLiked(video.likes.includes(user.id));
    }
  }, [user, video.likes]);

  useEffect(() => {
    if (!videoRef.current || !video.videoUrl) return;

    const videoElement = videoRef.current;

    const initializeVideo = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      // Check if the URL is an HLS stream
      if (video.videoUrl.includes('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });

          hlsRef.current = hls;
          hls.loadSource(video.videoUrl);
          hls.attachMedia(videoElement);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            videoElement.play().catch(console.error);
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  setError('Failed to load video. Please try again later.');
                  setIsLoading(false);
                  break;
              }
            }
          });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari
          videoElement.src = video.videoUrl;
          videoElement.addEventListener('loadedmetadata', () => {
            setIsLoading(false);
            videoElement.play().catch(console.error);
          });
        }
      } else {
        // Regular video URL
        videoElement.src = video.videoUrl;
        videoElement.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          videoElement.play().catch(console.error);
        });
      }

      // Track view
      if (user && token) {
        axios.post(`/api/videos/${video.id}/view`, null, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(console.error);
      }
    };

    initializeVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      videoElement.removeEventListener('loadedmetadata', () => {});
    };
  }, [video.videoUrl, user, token, video.id]);

  const handleLike = async () => {
    if (!user || !token) return;

    try {
      await axios.post(`/api/videos/${video.id}/like`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Error liking video:', err);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Video link copied to clipboard!');
    } catch (err) {
      console.error('Error sharing video:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="aspect-video rounded-lg overflow-hidden bg-black relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Loader className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <p className="text-white text-center">{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            playsInline
            poster={video.thumbnailUrl}
          />
        )}
      </div>
      
      <div className="mt-4">
        <h1 className="text-2xl font-bold">{video.title}</h1>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <img
              src={video.creator.avatarUrl}
              alt={video.creator.name}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-3">
              <p className="font-medium">{video.creator.name}</p>
              <p className="text-sm text-gray-500">
                {video.views.toLocaleString()} views • {video.createdAt}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100 ${
                isLiked ? 'text-indigo-600' : ''
              }`}
            >
              <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>Like</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100">
              <MessageCircle className="h-5 w-5" />
              <span>Comment</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100"
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-800 whitespace-pre-wrap">{video.description}</p>
        </div>
      </div>
    </div>
  );
}
