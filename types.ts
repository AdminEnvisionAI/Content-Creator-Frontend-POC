export interface UserMetrics {
  engagement_rate_per_post: number;
  like_comment_ratio: number;
  post_frequency_per_week: number;
  sentiment_score: number;
  overall_score: number;
}

export interface Post {
  post_id: string;
  title: string;
  description: string;
  published_at: string;
  views: number;
  likes: number;
  comments_total: number;
  good_comments: number;
  bad_comments: number;
  category: string;
  content_based_category: string;
}

export interface Creator {
  _id: string;
  name: string;
  username: string;
  bio: string;
  profile_pic_url: string;
  platform: string;
  platform_id: string;
  followers: number;
  metrics: UserMetrics;
  posts: Post[];
  creatorId?: string;
  user_type?: 'creator' | 'brand';
}

export interface AuthResponse {
  message: string;
  data: {
    message: string;
    token: string;
    user: {
      id: string;
      email: string;
      user_type: string;
    };
  };
}

export interface StatsResponse {
  message: string;
  data: {
    total_creators: number;
    total_brands: number;
    total_users: number;
  };
}

export interface UserListResponse {
  message: string;
  data: Creator[];
}

export interface SingleUserResponse {
  message: string;
  data: Creator[]; // API returns an array even for single user based on prompt
}