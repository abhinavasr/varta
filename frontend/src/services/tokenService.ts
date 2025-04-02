import api from './api';

export const getTokenBalance = async (): Promise<any> => {
  const response = await api.get('/tokens/balance');
  return response.data;
};

export const getTransactionHistory = async (page = 1, limit = 10): Promise<any> => {
  const response = await api.get(`/tokens/transactions?page=${page}&limit=${limit}`);
  return response.data;
};

export const claimDailyReward = async (): Promise<any> => {
  const response = await api.post('/tokens/daily-reward');
  return response.data;
};

export const purchaseTokens = async (amount: number): Promise<any> => {
  const response = await api.post('/tokens/purchase', { amount });
  return response.data;
};

export const checkDailyRewardEligibility = async (): Promise<any> => {
  const response = await api.get('/tokens/daily-reward/check');
  return response.data;
};

export const getTokenStats = async (): Promise<any> => {
  const response = await api.get('/tokens/stats');
  return response.data;
};
