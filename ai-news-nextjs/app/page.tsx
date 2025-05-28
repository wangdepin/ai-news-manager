'use client';

import { useEffect, useState } from 'react';
import { NewsList } from '@/components/NewsList';
import { NewsItem } from '@/types/news';

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/news');
      if (!response.ok) throw new Error('Failed to fetch news');
      
      const data = await response.json();
      setNews(data.news);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/fetch-news', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to refresh news');
      
      await fetchNews();
    } catch (err) {
      setError(err as Error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 AI 信息管家
          </h1>
          <p className="text-gray-600">
            每天 10 分钟，掌握 AI 领域最前沿动态
          </p>
          
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '更新中...' : '立即更新'}
            </button>
            
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                最后更新：{lastUpdate.toLocaleTimeString('zh-CN')}
              </span>
            )}
          </div>
        </header>

        <NewsList news={news} isLoading={isLoading} error={error} />
      </div>
    </main>
  );
}