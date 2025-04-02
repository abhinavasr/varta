import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    profile?: any;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

export const getProfile = async (): Promise<any> => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (profileData: any): Promise<any> => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export const getUserProfile = async (userId: string): Promise<any> => {
  const response = await api.get(`/auth/profile/${userId}`);
  return response.data;
};
