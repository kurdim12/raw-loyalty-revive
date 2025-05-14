import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import Layout from '@/components/shared/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Award, Calendar, Cake, Gift } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import supabase from '@/services/supabase';
import { format, differenceInDays, addYears, isSameDay } from 'date-fns';

const Profile = () => {
  const { user, logout } = useAuth();
  const { profile, isLoading, updateProfile, refetch } = useProfile(user?.id);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form fields when profile loads
  useState(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBirthday(profile.birthday || '');
    }
  });

  const handleUpdate = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const result = await updateProfile({
        full_name: fullName,
        birthday: birthday || null
      });
      
      if (!result.success) throw new Error(result.error);
      
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
      setBirthday(profile.birthday || '');
    }
    setEditing(true);
  };

  const formatBirthday = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMMM d');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getDaysUntilBirthday = () => {
    if (!profile?.birthday) return null;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const birthday = new Date(profile.birthday);
    birthday.setFullYear(currentYear);
    
    // If birthday has passed this year, calculate for next year
    if (birthday < today) {
      birthday.setFullYear(currentYear + 1);
    }
    
    return differenceInDays(birthday, today);
  };

  const isBirthdayToday = () => {
    if (!profile?.birthday) return false;
    
    const today = new Date();
    const birthDate = new Date(profile.birthday);
    return today.getMonth() === birthDate.getMonth() && 
           today.getDate() === birthDate.getDate();
  };

  const daysUntilBirthday = getDaysUntilBirthday();
  const birthdayToday = isBirthdayToday();

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

            {/* Birthday */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
              <div className="flex items-center gap-2 min-w-[160px] pt-2">
                <Cake className="h-4 w-4 text-coffee-mocha" />
                <Label>Birthday</Label>
              </div>
              {editing ? (
                <div className="space-y-1 max-w-md w-full">
                  <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="max-w-md"
                  />
                  <p className="text-xs text-gray-500 pl-1">
                    Get 20 bonus points on your birthday each year!
                  </p>
                </div>
              ) : (
                <div className="text-gray-700">
                  <div>{formatBirthday(profile?.birthday)}</div>
                  {profile?.birthday && (
                    <p className="text-sm text-coffee-mocha mt-1 flex items-center">
                      <Gift className="h-3 w-3 mr-1" />
                      {birthdayToday 
                        ? 'Happy Birthday! You received 20 points! 🎉'
                        : daysUntilBirthday === 1
                        ? 'Tomorrow is your birthday! Get ready for 20 bonus points!'
                        : `${daysUntilBirthday} days until your birthday (20 bonus points!)`
                      }
                    </p>
                  )}
                </div>
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
        
        {!profile?.birthday && !editing && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex">
                <Gift className="h-5 w-5 text-coffee-espresso mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-coffee-espresso">Birthday Bonus Available!</h4>
                  <p className="text-sm text-coffee-mocha mt-1">
                    Add your birthday to receive 20 bonus points every year on your special day.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
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
