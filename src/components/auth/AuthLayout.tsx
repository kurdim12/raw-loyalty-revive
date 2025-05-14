
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-coffee-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-coffee-espresso mb-2">
            Raw Coffee Shop
          </h1>
          <h2 className="text-2xl font-semibold text-coffee-dark mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-coffee-mocha">
              {subtitle}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-coffee-cream">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
