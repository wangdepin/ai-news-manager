'use client';

import { NewsItem } from '@/types/news';
import { NewsCard } from './NewsCard';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface NewsListProps {
  news: NewsItem[];
  isLoading?: boolean;
  error?: Error | null;
}

export function NewsList({ news, isLoading, error }: NewsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-600">
        <p>加载失败：{error.message}</p>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>暂无新闻</p>
      </div>
    );
  }

  // Group news by date
  const newsByDate = news.reduce((acc, item) => {
    const date = format(new Date(item.published_date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  return (
    <div className="space-y-8">
      {Object.entries(newsByDate).map(([date, items]) => (
        <div key={date}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {format(new Date(date), 'yyyy年MM月dd日', { locale: zhCN })}
          </h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {items.map((item) => (
              <NewsCard key={item.id || item.url} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}