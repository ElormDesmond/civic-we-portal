import React, { useEffect, useState } from 'react';

interface PermitApplication {
  id: number;
  full_name: string;
  permit_type: string;
  status: string;
  payload: any;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [permits, setPermits] = useState<PermitApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllPermits = async () => {
    try {
      const response = await fetch('http://localhost:8888/api/admin/permits', {
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

  useEffect(() => {
    fetchAllPermits();
  }, []);

  const handleStatusUpdate = async (id: number, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:8888/api/admin/permits/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });

      if (response.ok) {
        setPermits(permits.map(p => p.id === id ? { ...p, status: newStatus } : p));
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="text-center p-10">Loading permit applications...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Admin: Permit Moderation</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {permits.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">No permit applications found.</td>
              </tr>
            ) : (
              permits.map((permit) => (
                <tr key={permit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{permit.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{permit.permit_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(permit.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(permit.status)}`}>
                      {permit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {permit.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(permit.id, 'approved')}
                          className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(permit.id, 'rejected')}
                          className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
