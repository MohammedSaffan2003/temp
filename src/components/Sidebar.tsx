import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Compass, Clock, ThumbsUp, PlaySquare, Folder } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
}

const navigation = [
  { name: 'Home', icon: Home, path: '/', requireAuth: false },
  { name: 'Explore', icon: Compass, path: '/explore', requireAuth: false },
  { name: 'History', icon: Clock, path: '/history', requireAuth: true },
  { name: 'Liked Videos', icon: ThumbsUp, path: '/liked', requireAuth: true },
  { name: 'Your Videos', icon: PlaySquare, path: '/your-videos', requireAuth: true },
  { name: 'Library', icon: Folder, path: '/library', requireAuth: true },
];

export default function Sidebar({ isOpen }: SidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className={`fixed left-0 top-16 h-full bg-white border-r transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-20'
    }`}>
      <nav className="mt-4">
        {navigation.map((item) => {
          if (item.requireAuth && !user) return null;
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                isOpen ? '' : 'justify-center'
              }`}
            >
              <Icon className="h-5 w-5" />
              {isOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}