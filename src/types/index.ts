export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  views: number;
  createdAt: string;
  creator: {
    name: string;
    avatarUrl: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'user' | 'admin';
}

export interface Comment {
  id: string;
  content: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  createdAt: string;
}