export interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration?: string;
  views: number;
  createdAt: string;
  creator: {
    _id: string;
    username: string;
    avatarUrl: string;
  };
  likes: string[];
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
