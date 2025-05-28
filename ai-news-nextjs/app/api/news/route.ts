import { NextResponse } from 'next/server';
import { getLatestNews } from '@/lib/services/news-processor';

export async function GET() {
  try {
    const news = await getLatestNews(50);
    
    return NextResponse.json({
      success: true,
      news,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch news' 
      },
      { status: 500 }
    );
  }
}