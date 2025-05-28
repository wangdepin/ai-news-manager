import axios from 'axios';
import { NewsItem } from '@/types/news';

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';
const AI_KEYWORDS = [
  'AI', 'artificial intelligence', 'machine learning', 'ML',
  'neural', 'GPT', 'LLM', 'deep learning', 'OpenAI', 'Anthropic',
  'Claude', 'ChatGPT', 'transformer', 'diffusion', 'DeepSeek',
  'Gemini', 'Llama', 'Mistral'
];

export async function fetchHackerNewsAI(): Promise<NewsItem[]> {
  try {
    // Get top stories
    const { data: storyIds } = await axios.get(`${HN_API_BASE}/topstories.json`);
    const items: NewsItem[] = [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Check first 50 stories
    for (const storyId of storyIds.slice(0, 50)) {
      const { data: story } = await axios.get(`${HN_API_BASE}/item/${storyId}.json`);
      
      if (!story || story.type !== 'story') continue;
      
      const title = story.title || '';
      const isAIRelated = AI_KEYWORDS.some(keyword => 
        title.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (!isAIRelated) continue;
      
      const publishedDate = new Date(story.time * 1000);
      if (publishedDate < oneDayAgo) continue;
      
      items.push({
        title,
        url: story.url || `https://news.ycombinator.com/item?id=${storyId}`,
        content: story.text || '',
        source: 'Hacker News',
        published_date: publishedDate.toISOString()
      });
      
      // Limit to 5 AI stories
      if (items.length >= 5) break;
    }
    
    return items;
  } catch (error) {
    console.error('Error fetching Hacker News:', error);
    return [];
  }
}