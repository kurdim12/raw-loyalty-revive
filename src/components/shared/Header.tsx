
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Coffee } from 'lucide-react';

const Header = () => {
  const { user, profile, isAdmin, logout } = useAuth();

  // Get the initials from the full name or email
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="bg-white border-b border-coffee-cream sticky top-0 z-50">
      <div className="container flex justify-between items-center h-16 px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Coffee className="h-6 w-6 text-coffee-espresso" />
          <span className="font-bold text-coffee-espresso text-lg">Raw Coffee Shop</span>
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {profile && (
                <div className="hidden md:flex items-center mr-2">
                  <div className="text-right mr-2">
                    <p className="text-sm font-medium text-coffee-espresso">
                      {profile.full_name || user.email}
                    </p>
                    <p className="text-xs text-coffee-mocha">
                      {profile.points} Points • {profile.rank}
                    </p>
                  </div>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 bg-coffee-latte text-coffee-dark">
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/rewards">Rewards</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button className="bg-coffee-mocha hover:bg-coffee-espresso" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
