import { AuthResponse, StatsResponse, UserListResponse, SingleUserResponse } from '../types';

export const BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/add-user',
  GET_USER_STATS: '/get_user_stats',
  GET_TOP_USERS: '/get-top-engagemnet-rate',
  GET_ONE_USER: '/get-one-user-profile-data',
  SEARCH_USERS: '/search-influencers',
  GET_USER_PROFILE_BY_CREATOR_ID: '/get-one-user-profile-data-creatorId',
  EXCHANGE_CODE: '/exchange_code',
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('nexus_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  login: async (email: string, password: string, user_type: string): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, user_type }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  register: async (userData: any): Promise<any> => {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  getStats: async (): Promise<StatsResponse> => {
    // API uses POST for getting stats according to prompt
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.GET_USER_STATS}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  getTopCreators: async (platform: string): Promise<UserListResponse> => {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.GET_TOP_USERS}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ platform }),
    });
    if (!response.ok) throw new Error('Failed to fetch creators');
    return response.json();
  },

  searchCreators: async (query: string): Promise<UserListResponse> => {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.SEARCH_USERS}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },

  getUserProfile: async (id: string): Promise<SingleUserResponse> => {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.GET_ONE_USER}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  getUserProfileByCreatorId: async (creatorId: string, platform: string): Promise<SingleUserResponse> => {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.GET_USER_PROFILE_BY_CREATOR_ID}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ creatorId, platform }),
    });
    // A 404 might be a valid "not found" response, not necessarily a hard error.
    if (!response.ok) throw new Error(`Profile not found on ${platform}`);
    const result = await response.json();
    if (!result.data || result.data.length === 0) {
      throw new Error(`Profile not found on ${platform}`);
    }
    return result;
  },

  connectInstagram: async (code: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.EXCHANGE_CODE}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    if (!response.ok) throw new Error('Failed to connect Instagram');
    return response.json();
  }
};