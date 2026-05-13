import React, { useEffect, useState } from 'react';
import Map from '../components/Map';

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  budget: number;
  end_date: string;
  latitude: number;
  longitude: number;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8888/api/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data || []);
        setLoading(false);
      })
      .catch((err) => console.error('Failed to fetch projects:', err));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Municipal Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">Tracking our progress in building a better community.</p>
        </div>
      </div>

      <div className="mb-12">
        <Map projects={projects} />
      </div>
      
      {projects.length === 0 ? (
        <p className="text-center text-gray-500 py-20">No projects currently listed.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{project.title}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                {project.description}
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-gray-50 dark:border-gray-700 pt-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Budget</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(project.budget)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Expected Completion</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
