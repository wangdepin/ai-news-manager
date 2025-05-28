import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNewsSources } from '@/lib/services/sources';
import { processAndSaveNews } from '@/lib/services/news-processor';

export async function POST(request: NextRequest) {
  try {
    // Verify authorization for manual triggers
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow both manual triggers from frontend and cron job triggers
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Check if it's from the frontend (no auth header)
      if (authHeader) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('Starting news fetch job...');
    
    // Fetch news from all sources
    const newsItems = await fetchAllNewsSources();
    
    // Process and save to database
    await processAndSaveNews(newsItems);
    
    return NextResponse.json({
      success: true,
      itemsProcessed: newsItems.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in fetch-news job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch and process news' 
      },
      { status: 500 }
    );
  }
}