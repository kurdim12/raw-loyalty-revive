
import { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface LayoutProps {
  children: ReactNode;
  loading?: boolean;
}

const Layout = ({ children, loading = false }: LayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-coffee-light">
      <Header />
      {user && <Navigation />}
      
      <main className="flex-1 container py-6 px-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          children
        )}
      </main>
      
      <footer className="bg-coffee-dark text-white py-4">
        <div className="container text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Raw Coffee Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
