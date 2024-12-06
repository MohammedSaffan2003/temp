import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Comment } from '../types';

interface CommentSectionProps {
  videoId: string;
  initialComments: Comment[];
}

export default function CommentSection({ videoId, initialComments }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      createdAt: 'Just now',
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h3 className="text-xl font-semibold mb-6">{comments.length} Comments</h3>
      
      {user && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex space-x-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-4">
            <img
              src={comment.user.avatarUrl}
              alt={comment.user.name}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{comment.user.name}</span>
                <span className="text-gray-500 text-sm">{comment.createdAt}</span>
              </div>
              <p className="mt-1 text-gray-800">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}