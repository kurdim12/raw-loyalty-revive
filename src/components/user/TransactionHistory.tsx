
import { useState } from 'react';
import { Transaction } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading?: boolean;
}

const TransactionHistory = ({ transactions, loading = false }: TransactionHistoryProps) => {
  const [visibleCount, setVisibleCount] = useState(5);
  
  const showMore = () => {
    setVisibleCount(prev => prev + 5);
  };
  
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'text-green-600';
      case 'redeemed':
        return 'text-red-600';
      case 'bonus':
        return 'text-purple-600';
      case 'referral':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getTransactionPrefix = (type: string) => {
    switch (type) {
      case 'earned':
        return '+';
      case 'redeemed':
        return '-';
      case 'bonus':
        return '+';
      case 'referral':
        return '+';
      default:
        return '';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-coffee-mocha">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-coffee-mocha">
            No transactions yet. Make a purchase to earn points!
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {transactions.slice(0, visibleCount).map((transaction) => (
                <li 
                  key={transaction.id}
                  className="border-b border-coffee-cream pb-2 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-coffee-mocha">
                        {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                        {transaction.drink_type && ` • ${transaction.drink_type}`}
                      </p>
                    </div>
                    <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {getTransactionPrefix(transaction.type)}
                      {transaction.points}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {transactions.length > visibleCount && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={showMore}>
                  Show more
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
