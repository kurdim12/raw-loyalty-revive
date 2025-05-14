
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { Reward } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { PlusCircle, Gift, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const RewardManagement = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 0,
    category: 'general',
    active: true
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;
      
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingReward(null);
    setFormData({
      name: '',
      description: '',
      points_required: 0,
      category: 'general',
      active: true
    });
    setShowDialog(true);
  };

  const openEditDialog = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || '',
      points_required: reward.points_required,
      category: reward.category || 'general',
      active: reward.active
    });
    setShowDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      active: checked
    }));
  };

  const saveReward = async () => {
    try {
      if (formData.name.trim() === '') {
        toast.error('Reward name is required');
        return;
      }

      if (formData.points_required <= 0) {
        toast.error('Points required must be greater than 0');
        return;
      }

      if (editingReward) {
        // Update existing reward
        const { error } = await supabase
          .from('rewards')
          .update({
            name: formData.name,
            description: formData.description,
            points_required: formData.points_required,
            category: formData.category,
            active: formData.active
          })
          .eq('id', editingReward.id);

        if (error) throw error;
        toast.success('Reward updated successfully');
      } else {
        // Create new reward
        const { error } = await supabase
          .from('rewards')
          .insert({
            name: formData.name,
            description: formData.description,
            points_required: formData.points_required,
            category: formData.category,
            active: formData.active
          });

        if (error) throw error;
        toast.success('Reward created successfully');
      }

      setShowDialog(false);
      fetchRewards();
    } catch (error) {
      console.error('Error saving reward:', error);
      toast.error('Failed to save reward');
    }
  };

  const toggleRewardStatus = async (reward: Reward) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ active: !reward.active })
        .eq('id', reward.id);

      if (error) throw error;
      
      toast.success(`Reward ${reward.active ? 'disabled' : 'enabled'}`);
      fetchRewards();
    } catch (error) {
      console.error('Error toggling reward status:', error);
      toast.error('Failed to update reward status');
    }
  };

  const deleteReward = async (rewardId: string) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;
      
      toast.success('Reward deleted successfully');
      fetchRewards();
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Failed to delete reward');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reward Management</h2>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Reward
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading rewards...</div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-8">
          <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p>No rewards found. Add your first reward!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className={!reward.active ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{reward.name}</span>
                  <span className="text-lg font-normal">{reward.points_required} points</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground mb-2">
                  {reward.description || 'No description'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="bg-muted text-xs px-2 py-1 rounded">{reward.category}</span>
                  <span className={`text-xs px-2 py-1 rounded ${reward.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {reward.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 justify-between">
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" onClick={() => toggleRewardStatus(reward)}>
                    {reward.active ? 'Disable' : 'Enable'}
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(reward)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteReward(reward.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReward ? 'Edit Reward' : 'Add New Reward'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Reward Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter reward name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="points_required">Points Required</Label>
              <Input
                id="points_required"
                name="points_required"
                type="number"
                value={formData.points_required}
                onChange={handleNumberChange}
                min={1}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Enter category"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveReward}>
              {editingReward ? 'Update' : 'Create'} Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardManagement;
