
import Layout from '@/components/shared/Layout';

const Admin = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-coffee-dark">Admin Dashboard</h1>
        </div>

        <div className="bg-coffee-cream bg-opacity-30 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-coffee-dark mb-4">
            Admin Panel Coming Soon
          </h2>
          <p className="text-coffee-mocha">
            This is a placeholder for the admin panel. In the complete version, this area will include 
            user management, transaction creation, reward management, settings, analytics, and 
            community moderation.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
