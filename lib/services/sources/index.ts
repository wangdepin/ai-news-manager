import { NewsItem } from '@/types/news';
import { fetchAllRSSFeeds } from './rss-parser';
import { fetchHackerNewsAI } from './hacker-news';

export async function fetchAllNewsSources(): Promise<NewsItem[]> {
  console.log('Fetching news from all sources...');
  
  const [rssItems, hnItems] = await Promise.all([
    fetchAllRSSFeeds(),
    fetchHackerNewsAI()
  ]);
  
  const allItems = [...rssItems, ...hnItems];
  
  // Sort by published date (newest first)
  allItems.sort((a, b) => 
    new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
  );
  
  console.log(`Fetched ${allItems.length} total news items`);
  return allItems;
}