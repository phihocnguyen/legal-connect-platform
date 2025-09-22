'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function Search() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Debounced search effect
  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      const searchTimeout = setTimeout(() => {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsSearching(false);
      }, 800); // 800ms delay for header search

      return () => {
        clearTimeout(searchTimeout);
        setIsSearching(false);
      };
    }
  }, [query, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setTimeout(() => setIsSearching(false), 300);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        setIsSearching(true);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setTimeout(() => setIsSearching(false), 300);
      }
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-8">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm văn bản pháp luật..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <LoadingSpinner size="sm" showText={false} />
          </div>
        )}
        <button type="submit" className="sr-only">
          Tìm kiếm
        </button>
      </form>
    </div>
  );
}
