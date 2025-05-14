
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import supabase from '../services/supabase';
import { Transaction } from '../types/database';

export const useTransactions = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (): Promise<Transaction[]> => {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  };

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['transactions', userId],
    queryFn: fetchTransactions,
    enabled: !!userId,
  });

  const addTransaction = async (
    type: 'earned' | 'redeemed' | 'bonus' | 'referral',
    points: number,
    description: string,
    drinkType?: string,
    amountSpent?: number
  ) => {
    if (!userId) {
      setError('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          type,
          points,
          description,
          drink_type: drinkType,
          amount_spent: amountSpent
        }]);

      if (error) throw error;

      // Refresh transactions and user profile
      refetch();

      setLoading(false);
      return { success: true, data };
    } catch (error) {
      console.error('Error adding transaction:', error);
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to add transaction');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add transaction' 
      };
    }
  };

  return {
    transactions: transactions || [],
    isLoading: isLoading || loading,
    error,
    addTransaction,
    refetch,
  };
};

export default useTransactions;
