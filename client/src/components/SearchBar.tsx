import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: number;
  type: string;
  title: string;
  snippet: string;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:8888/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-sm" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-full px-10 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
          placeholder="Search news, projects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">No results found for "{query}"</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={result.type === 'news' ? '/news' : '/projects'}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b border-gray-50 dark:border-gray-700 last:border-none"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      result.type === 'news' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {result.type}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{result.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{result.snippet}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
