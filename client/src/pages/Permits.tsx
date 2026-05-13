import React from 'react';
import { Link } from 'react-router-dom';

const Permits: React.FC = () => {
  const permitTypes = [
    {
      id: 'building',
      title: 'Building Permit',
      description: 'Apply for permission to construct, renovate, or alter a building.',
      icon: '🏗️',
      link: '/apply/building',
    },
    {
      id: 'marriage',
      title: 'Marriage Permit',
      description: 'Register your marriage and obtain a legal marriage certificate.',
      icon: '💍',
      link: '#', // Placeholder
      disabled: true,
    },
    {
      id: 'business',
      title: 'Business License',
      description: 'Obtain a license to operate a commercial business within the municipality.',
      icon: '🏢',
      link: '#', // Placeholder
      disabled: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">Municipal Services</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 text-center max-w-2xl mx-auto">
        Select the service you require to begin your digital application process.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {permitTypes.map((permit) => (
          <div key={permit.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 flex flex-col ${permit.disabled ? 'opacity-60' : 'hover:shadow-xl transition transform hover:-translate-y-1'}`}>
            <span className="text-4xl mb-6">{permit.icon}</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{permit.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 flex-grow">{permit.description}</p>
            {permit.disabled ? (
              <button disabled className="w-full py-3 bg-gray-200 text-gray-500 rounded-xl font-bold cursor-not-allowed">
                Coming Soon
              </button>
            ) : (
              <Link to={permit.link} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-center hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                Apply Now
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Permits;
