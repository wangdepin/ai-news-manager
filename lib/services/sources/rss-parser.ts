import Parser from 'rss-parser';
import { NewsItem } from '@/types/news';

const parser = new Parser();

export interface RSSSource {
  name: string;
  feedUrl: string;
}

export const RSS_SOURCES: RSSSource[] = [
  {
    name: 'arXiv AI/ML',
    feedUrl: 'http://export.arxiv.org/rss/cs.AI+cs.LG'
  },
  {
    name: 'OpenAI Blog',
    feedUrl: 'https://openai.com/blog/rss/'
  },
  {
    name: 'HuggingFace Blog',
    feedUrl: 'https://huggingface.co/blog/feed.xml'
  }
];

export async function fetchRSSFeed(source: RSSSource): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.feedUrl);
    const items: NewsItem[] = [];
    
    // Only get items from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const entry of feed.items.slice(0, 10)) {
      const publishedDate = new Date(entry.pubDate || entry.isoDate || Date.now());
      
      if (publishedDate < oneDayAgo) continue;
      
      items.push({
        title: entry.title || 'No Title',
        url: entry.link || '',
        content: entry.contentSnippet || entry.content || '',
        source: source.name,
        published_date: publishedDate.toISOString()
      });
    }
    
    return items;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${source.name}:`, error);
    return [];
  }
}

export async function fetchAllRSSFeeds(): Promise<NewsItem[]> {
  const results = await Promise.all(
    RSS_SOURCES.map(source => fetchRSSFeed(source))
  );
  
  return results.flat();
}