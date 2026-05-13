import React, { useEffect, useState } from 'react';
import ImageUpload from '../../components/ImageUpload';

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  author: string;
  image_url: string;
  published_at: string;
}

const AdminNews: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchNews = async () => {
    try {
      const response = await fetch('http://localhost:8888/api/news');
      if (response.ok) {
        const data = await response.json();
        setArticles(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, content, author, image_url: imageUrl };

    try {
      const response = await fetch('http://localhost:8888/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (response.ok) {
        setShowForm(false);
        setTitle('');
        setContent('');
        setAuthor('');
        setImageUrl('');
        fetchNews();
      } else {
        alert('Failed to create news article');
      }
    } catch (err) {
      console.error('Create news error:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`http://localhost:8888/api/admin/news/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setArticles(articles.filter(a => a.id !== id));
      } else {
        alert('Failed to delete article');
      }
    } catch (err) {
      console.error('Delete news error:', err);
    }
  };

  if (loading) return <div className="text-center p-10">Loading news management...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin: News Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : 'Add New Article'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 mb-12 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Author</label>
                <input required value={author} onChange={e => setAuthor(e.target.value)} type="text" className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                <textarea required value={content} onChange={e => setContent(e.target.value)} rows={5} className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none"></textarea>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Article Image</label>
              <ImageUpload uploadType="news" onUploadSuccess={(url) => setImageUrl(`http://localhost:8888${url}`)} />
              {imageUrl && <p className="text-xs text-green-600 break-all font-mono">Uploaded: {imageUrl}</p>}
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition">
            Publish Article
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="h-40 w-full overflow-hidden bg-gray-100">
              <img 
                src={article.image_url || 'https://via.placeholder.com/400x200'} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex-grow">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{article.title}</h3>
              <p className="text-xs text-gray-500 mb-4">By {article.author} on {new Date(article.published_at).toLocaleDateString()}</p>
              <div className="flex justify-end space-x-2">
                <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-900 text-sm font-semibold">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNews;
