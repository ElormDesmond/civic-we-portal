import React, { useEffect, useState } from 'react';

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  author: string;
  image_url: string;
  published_at: string;
}

const News: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8888/api/news')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data || []);
        setLoading(false);
      })
      .catch((err) => console.error('Failed to fetch news:', err));
  }, []);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Latest News & Updates</h1>
      
      {articles.length === 0 ? (
        <p className="text-center text-gray-500 py-20">No news articles found at this time.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article key={article.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700">
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={article.image_url || 'https://via.placeholder.com/800x400?text=News+Article'} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-6 flex-grow">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span>{new Date(article.published_at).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{article.author}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                  {article.content}
                </p>
                <button className="text-blue-600 font-semibold hover:text-blue-500 transition-colors">
                  Read More →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
