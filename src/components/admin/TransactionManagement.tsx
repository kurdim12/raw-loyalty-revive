
import { useState } from 'react';
import { supabase } from '@/services/supabase';
import { Profile } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import UserSearch from './UserSearch';

const drinkPoints = {
  'White Tradition': 4,
  'Black Tradition': 3,
  'Raw Signature': 5,
  'Raw Specialty': 6
};

type PointMethod = 'drink' | 'amount';

const TransactionManagement = () => {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [pointMethod, setPointMethod] = useState<PointMethod>('drink');
  const [selectedDrink, setSelectedDrink] = useState('');
  const [dollarAmount, setDollarAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addPoints = async () => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }

    let points = 0;
    let description = '';

    if (pointMethod === 'drink') {
      if (!selectedDrink) {
        toast.error('Please select a drink');
        return;
      }
      points = drinkPoints[selectedDrink as keyof typeof drinkPoints];
      description = `${selectedDrink} purchase`;
    } else {
      if (!dollarAmount || isNaN(parseFloat(dollarAmount)) || parseFloat(dollarAmount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      points = Math.floor(parseFloat(dollarAmount));
      description = `$${dollarAmount} purchase`;
    }

    try {
      setIsSubmitting(true);

      // Add transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedUser.id,
          type: 'earned',
          points,
          description,
          drink_type: pointMethod === 'drink' ? selectedDrink : null,
          amount_spent: pointMethod === 'amount' ? parseFloat(dollarAmount) : null
        });

      if (transactionError) throw transactionError;

      // Update user points
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          points: selectedUser.points + points,
          lifetime_points: selectedUser.lifetime_points + points
        })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      toast.success(`Added ${points} points to ${selectedUser.email}`);
      
      // Reset form
      if (pointMethod === 'drink') {
        setSelectedDrink('');
      } else {
        setDollarAmount('');
      }
      
    } catch (error) {
      console.error('Error adding points:', error);
      toast.error('Failed to add points');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Add Points</h2>
      
      {/* User Selection */}
      <div className="mb-6">
        <Label className="block mb-2">Select User:</Label>
        <UserSearch onSelectUser={setSelectedUser} />
      </div>
      
      {selectedUser && (
        <div className="bg-muted/20 p-4 rounded-lg">
          <p className="mb-4">Adding points for: <strong>{selectedUser.email}</strong></p>
          
          {/* Method Toggle */}
          <div className="mb-4">
            <Label className="block mb-2">Select Method:</Label>
            <RadioGroup 
              value={pointMethod} 
              onValueChange={(value) => setPointMethod(value as PointMethod)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="drink" id="drink" />
                <Label htmlFor="drink">By Drink</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="amount" id="amount" />
                <Label htmlFor="amount">By Amount ($1 = 1 point)</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Input Based on Method */}
          {pointMethod === 'drink' ? (
            <div className="mb-4">
              <Label htmlFor="drink-select" className="block mb-2">Select Drink:</Label>
              <Select value={selectedDrink} onValueChange={setSelectedDrink}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a drink" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(drinkPoints).map(drink => (
                    <SelectItem key={drink} value={drink}>
                      {drink} ({drinkPoints[drink as keyof typeof drinkPoints]} points)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mb-4">
              <Label htmlFor="amount" className="block mb-2">Enter Amount:</Label>
              <Input
                id="amount"
                type="number"
                value={dollarAmount}
                onChange={(e) => setDollarAmount(e.target.value)}
                placeholder="Enter dollar amount"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {dollarAmount && !isNaN(parseFloat(dollarAmount)) && parseFloat(dollarAmount) > 0 
                  ? `Will add ${Math.floor(parseFloat(dollarAmount))} points` 
                  : ''}
              </p>
            </div>
          )}
          
          <Button
            onClick={addPoints}
            disabled={isSubmitting || 
              (pointMethod === 'drink' && !selectedDrink) || 
              (pointMethod === 'amount' && (!dollarAmount || isNaN(parseFloat(dollarAmount)) || parseFloat(dollarAmount) <= 0))
            }
            className="mt-4"
          >
            {isSubmitting ? 'Adding...' : 'Add Points'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
