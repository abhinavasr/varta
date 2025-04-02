import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as tokenService from '../services/tokenService';
import { useAuth } from './AuthContext';

interface TokenContextType {
  balance: number;
  transactions: any[];
  loading: boolean;
  error: string | null;
  getBalance: () => Promise<void>;
  getTransactions: () => Promise<void>;
  claimDailyReward: () => Promise<any>;
  purchaseTokens: (amount: number) => Promise<any>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      getBalance();
    }
  }, [token]);

  const getBalance = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.getTokenBalance();
      setBalance(response.balance);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch token balance');
      console.error('Error fetching token balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactions = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.getTransactionHistory();
      setTransactions(response.transactions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const claimDailyReward = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.claimDailyReward();
      setBalance(response.new_balance);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to claim daily reward');
      console.error('Error claiming daily reward:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const purchaseTokens = async (amount: number) => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.purchaseTokens(amount);
      setBalance(response.new_balance);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purchase tokens');
      console.error('Error purchasing tokens:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TokenContext.Provider
      value={{
        balance,
        transactions,
        loading,
        error,
        getBalance,
        getTransactions,
        claimDailyReward,
        purchaseTokens
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = (): TokenContextType => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};
