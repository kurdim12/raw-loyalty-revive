
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import Layout from '@/components/shared/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Award, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import supabase from '@/services/supabase';
import { format } from 'date-fns';

const Profile = () => {
  const { user, logout } = useAuth();
  const { profile, isLoading, refetch } = useProfile(user?.id);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form fields when profile loads
  useState(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  });

  const handleUpdate = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refetch();
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = () => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
    setEditing(true);
  };

  return (
    <Layout loading={isLoading && !profile}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-coffee-dark">My Profile</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 min-w-[160px]">
                <Mail className="h-4 w-4 text-coffee-mocha" />
                <Label>Email</Label>
              </div>
              <div className="text-gray-700">{user?.email || 'No email set'}</div>
            </div>
            
            {/* Full Name */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 min-w-[160px]">
                <User className="h-4 w-4 text-coffee-mocha" />
                <Label>Full Name</Label>
              </div>
              {editing ? (
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="max-w-md"
                />
              ) : (
                <div className="text-gray-700">{profile?.full_name || 'Not set'}</div>
              )}
            </div>
            
            {/* Phone */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 min-w-[160px]">
                <Phone className="h-4 w-4 text-coffee-mocha" />
                <Label>Phone</Label>
              </div>
              {editing ? (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="max-w-md"
                />
              ) : (
                <div className="text-gray-700">{profile?.phone || 'Not set'}</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Loyalty Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rank & Points */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 min-w-[160px]">
                <Award className="h-4 w-4 text-coffee-mocha" />
                <Label>Status</Label>
              </div>
              <div className="text-gray-700">
                {profile?.rank || 'Bronze'} • {profile?.points || 0} Points Available • {profile?.lifetime_points || 0} Lifetime Points
              </div>
            </div>
            
            {/* Member Since */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 min-w-[160px]">
                <Calendar className="h-4 w-4 text-coffee-mocha" />
                <Label>Member Since</Label>
              </div>
              <div className="text-gray-700">
                {profile?.created_at ? format(new Date(profile.created_at), 'PPP') : 'Unknown'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          {editing ? (
            <>
              <Button 
                onClick={handleUpdate} 
                disabled={isSaving} 
                className="bg-coffee-mocha hover:bg-coffee-espresso"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={startEditing} 
                className="bg-coffee-mocha hover:bg-coffee-espresso"
              >
                Edit Profile
              </Button>
              <Button 
                variant="destructive" 
                onClick={logout}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
