import api from './api';

interface PostCreateData {
  content: string;
  media?: Array<{
    type: string;
    url: string;
    thumbnail_url?: string;
  }>;
}

export const getPosts = async (page = 1, limit = 10): Promise<any> => {
  const response = await api.get(`/posts?page=${page}&limit=${limit}`);
  return response.data;
};

export const getPostById = async (postId: string): Promise<any> => {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
};

export const getUserPosts = async (userId: string, page = 1, limit = 10): Promise<any> => {
  const response = await api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const createPost = async (postData: PostCreateData): Promise<any> => {
  const response = await api.post('/posts', postData);
  return response.data;
};

export const updatePost = async (postId: string, content: string): Promise<any> => {
  const response = await api.put(`/posts/${postId}`, { content });
  return response.data;
};

export const deletePost = async (postId: string): Promise<any> => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

export const resharePost = async (postId: string, content?: string): Promise<any> => {
  const response = await api.post(`/posts/${postId}/reshare`, { content });
  return response.data;
};

export const getComments = async (postId: string): Promise<any> => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
};

export const createComment = async (postId: string, content: string): Promise<any> => {
  const response = await api.post(`/posts/${postId}/comments`, { content });
  return response.data;
};
