import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { ThumbsUp, MessageCircle, Share2, Loader } from 'lucide-react';
import type { Video } from '../types';

interface VideoPlayerProps {
  video: Video;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');

  useEffect(() => {
    if (!videoRef.current || !video.videoUrl) {
      setError('Video URL is invalid');
      setIsLoading(false);
      return;
    }

    const videoElement = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        autoStartLoad: true,
        startLevel: -1,
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 600
      });

      try {
        hls.loadSource(video.videoUrl);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          videoElement.play().catch(() => {
            console.warn('Playback failed, likely due to autoplay restrictions');
          });
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError('Failed to load video. Please try again later.');
            setIsLoading(false);
          }
        });

        return () => {
          hls.destroy();
        };
      } catch (err) {
        setError('Failed to initialize video player');
        setIsLoading(false);
      }
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari
      videoElement.src = video.videoUrl;
      videoElement.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        videoElement.play().catch(() => {
          console.warn('Playback failed, likely due to autoplay restrictions');
        });
      });
      videoElement.addEventListener('error', () => {
        setError('Failed to load video. Please try again later.');
        setIsLoading(false);
      });
    } else {
      setError('Your browser does not support HLS playback');
      setIsLoading(false);
    }
  }, [video.videoUrl]);

  const handleQualityChange = (quality: string) => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    if (Hls.isSupported()) {
      const hls = new Hls();
      const level = quality === 'auto' ? -1 : parseInt(quality);
      hls.currentLevel = level;
      setCurrentQuality(quality);
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
          <>
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              playsInline
              poster={video.thumbnailUrl}
            />
            <div className="absolute bottom-4 right-4">
              <select
                value={currentQuality}
                onChange={(e) => handleQualityChange(e.target.value)}
                className="bg-black bg-opacity-75 text-white px-2 py-1 rounded"
              >
                <option value="auto">Auto</option>
                <option value="2">1080p</option>
                <option value="1">720p</option>
                <option value="0">480p</option>
              </select>
            </div>
          </>
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
            <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100">
              <ThumbsUp className="h-5 w-5" />
              <span>Like</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100">
              <MessageCircle className="h-5 w-5" />
              <span>Comment</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100">
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-800">{video.description}</p>
        </div>
      </div>
    </div>
  );
}