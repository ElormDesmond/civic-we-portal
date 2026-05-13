import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface PermitApplication {
  id: number;
  permit_type: string;
  status: string;
  payload: any;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [permits, setPermits] = useState<PermitApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPermits = async () => {
      try {
        const response = await fetch('http://localhost:8888/api/permits/my', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setPermits(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch permits:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPermits();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  if (loading) return <div className="text-center p-10">Loading your applications...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Citizen Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.full_name}. Track your service requests here.</p>
        </div>
        <Link to="/apply" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
          New Application
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {permits.length === 0 ? (
            <li className="p-10 text-center text-gray-500">
              You haven't submitted any permit applications yet.
            </li>
          ) : (
            permits.map((permit) => (
              <li key={permit.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate uppercase tracking-wider">
                      {permit.permit_type}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(permit.status)}`}>
                        {permit.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        Submitted on {new Date(permit.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                      <p>
                        Project: {permit.payload.project_title || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
