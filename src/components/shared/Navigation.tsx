
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Coffee, Gift, User, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const { isAdmin } = useAuth();

  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <Coffee className="h-5 w-5" />,
    },
    {
      title: 'Rewards',
      path: '/rewards',
      icon: <Gift className="h-5 w-5" />,
    },
  ];

  if (isAdmin) {
    navItems.push({
      title: 'Admin',
      path: '/admin',
      icon: <Users className="h-5 w-5" />,
    });
  }

  return (
    <nav className="bg-coffee-cream bg-opacity-50">
      <div className="container flex justify-between items-center h-12">
        <div className="flex items-center space-x-1 px-2 w-full md:justify-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-coffee-mocha text-white'
                    : 'text-coffee-dark hover:bg-coffee-latte hover:bg-opacity-70'
                )
              }
            >
              <span className="mr-1.5">{item.icon}</span>
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
