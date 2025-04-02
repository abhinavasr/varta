import api from './api';

export const likePost = async (postId: string): Promise<any> => {
  const response = await api.post(`/likes/posts/${postId}`);
  return response.data;
};

export const unlikePost = async (postId: string): Promise<any> => {
  const response = await api.delete(`/likes/posts/${postId}`);
  return response.data;
};

export const getPostLikes = async (postId: string): Promise<any> => {
  const response = await api.get(`/likes/posts/${postId}`);
  return response.data;
};

export const checkUserLike = async (postId: string): Promise<any> => {
  const response = await api.get(`/likes/posts/${postId}/check`);
  return response.data;
};
