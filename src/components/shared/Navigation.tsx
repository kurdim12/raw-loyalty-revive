
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  Gift, 
  User, 
  Shield, 
  Coffee,
  MessageSquare
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      active 
        ? 'bg-coffee-espresso text-white' 
        : 'text-coffee-dark hover:bg-coffee-cream'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

const Navigation = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-coffee-light border-b border-coffee-cream">
      <div className="container px-4 mx-auto">
        <div className="flex items-center space-x-1 md:space-x-4 py-2 overflow-x-auto">
          <NavItem 
            to="/dashboard" 
            icon={<Home className="w-4 h-4" />} 
            label="Dashboard" 
            active={isActive('/dashboard')} 
          />
          
          <NavItem 
            to="/rewards" 
            icon={<Gift className="w-4 h-4" />} 
            label="Rewards" 
            active={isActive('/rewards')} 
          />
          
          <NavItem 
            to="/community" 
            icon={<MessageSquare className="w-4 h-4" />} 
            label="Community" 
            active={isActive('/community')} 
          />
          
          <NavItem 
            to="/profile" 
            icon={<User className="w-4 h-4" />} 
            label="Profile" 
            active={isActive('/profile')} 
          />
          
          {isAdmin && (
            <NavItem 
              to="/admin" 
              icon={<Shield className="w-4 h-4" />} 
              label="Admin" 
              active={isActive('/admin')} 
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
