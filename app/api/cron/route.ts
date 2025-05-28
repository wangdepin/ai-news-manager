import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNewsSources } from '@/lib/services/sources';
import { processAndSaveNews } from '@/lib/services/news-processor';

export const maxDuration = 300; // 5 minutes max execution time

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting scheduled news fetch job...');
    
    // Fetch news from all sources
    const newsItems = await fetchAllNewsSources();
    
    // Process and save to database
    await processAndSaveNews(newsItems);
    
    console.log(`Scheduled job completed. Processed ${newsItems.length} items.`);
    
    return NextResponse.json({
      success: true,
      itemsProcessed: newsItems.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Cron job failed' 
      },
      { status: 500 }
    );
  }
}