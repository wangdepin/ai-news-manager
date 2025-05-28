import { NewsItem } from '@/types/news';
import { supabaseAdmin } from '@/lib/utils/supabase';
import { generateSummary } from './deepseek';
import { generateTTS } from './minimax-tts';

export async function processAndSaveNews(items: NewsItem[]): Promise<void> {
  if (!items.length) return;

  console.log(`Processing ${items.length} news items...`);

  // Check existing items to avoid duplicates
  const urls = items.map(item => item.url);
  const { data: existingItems } = await supabaseAdmin
    .from('news_items')
    .select('url')
    .in('url', urls);

  const existingUrls = new Set(existingItems?.map(item => item.url) || []);
  const newItems = items.filter(item => !existingUrls.has(item.url));

  if (!newItems.length) {
    console.log('No new items to process');
    return;
  }

  console.log(`Found ${newItems.length} new items to process`);

  // Insert new items first (without summary and audio)
  const { data: insertedItems, error: insertError } = await supabaseAdmin
    .from('news_items')
    .insert(newItems)
    .select();

  if (insertError) {
    console.error('Error inserting news items:', insertError);
    throw insertError;
  }

  if (!insertedItems) return;

  // Generate summaries
  console.log('Generating summaries...');
  const summaryPromises = insertedItems.map(async (item) => {
    try {
      const summary = await generateSummary(item.title, item.content, item.url);
      await supabaseAdmin
        .from('news_items')
        .update({ summary })
        .eq('id', item.id);
      return { ...item, summary };
    } catch (error) {
      console.error(`Failed to generate summary for ${item.id}:`, error);
      return item;
    }
  });

  const itemsWithSummaries = await Promise.all(summaryPromises);

  // Generate TTS for items with summaries
  console.log('Generating TTS audio...');
  const ttsPromises = itemsWithSummaries
    .filter(item => item.summary && item.summary !== '- 摘要生成失败')
    .map(async (item) => {
      try {
        const ttsText = `标题：${item.title}。摘要内容：${item.summary}`;
        const audioUrl = await generateTTS(ttsText, item.id);
        
        if (audioUrl) {
          await supabaseAdmin
            .from('news_items')
            .update({ audio_url: audioUrl })
            .eq('id', item.id);
        }
      } catch (error) {
        console.error(`Failed to generate TTS for ${item.id}:`, error);
      }
    });

  await Promise.all(ttsPromises);

  console.log('News processing completed');
}

export async function getLatestNews(limit: number = 20): Promise<NewsItem[]> {
  const { data, error } = await supabaseAdmin
    .from('news_items')
    .select('*')
    .order('published_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest news:', error);
    throw error;
  }

  return data || [];
}

export async function getNewsByDate(date: string): Promise<NewsItem[]> {
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);

  const { data, error } = await supabaseAdmin
    .from('news_items')
    .select('*')
    .gte('published_date', startDate.toISOString())
    .lt('published_date', endDate.toISOString())
    .order('published_date', { ascending: false });

  if (error) {
    console.error('Error fetching news by date:', error);
    throw error;
  }

  return data || [];
}