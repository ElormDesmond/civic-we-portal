import React, { useEffect, useState } from 'react';

interface Official {
  id: number;
  full_name: string;
  role: string;
  bio: string;
  image_url: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
  icon: string;
  officials: Official[];
}

const About: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8888/api/departments')
      .then((res) => res.json())
      .then((data) => {
        setDepartments(data);
        setLoading(false);
      })
      .catch((err) => console.error('Failed to fetch departments:', err));
  }, []);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">About Our Municipality</h1>
      
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 border-b pb-2">Our Departments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 border border-gray-100 dark:border-gray-700">
              <div className="text-blue-600 mb-4">
                {/* Placeholder for Icon */}
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏛️</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{dept.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{dept.description}</p>
              
              {dept.officials && dept.officials.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Officials</h4>
                  <div className="space-y-3">
                    {dept.officials.map((official) => (
                      <div key={official.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                          <img 
                            src={official.image_url || 'https://via.placeholder.com/150'} 
                            alt={official.full_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{official.full_name}</p>
                          <p className="text-xs text-gray-500">{official.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
