export interface NewsItem {
  id?: string;
  title: string;
  url: string;
  content: string;
  summary?: string;
  source: string;
  published_date: string;
  audio_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewsSource {
  name: string;
  type: 'rss' | 'api' | 'web';
  url?: string;
  fetchInterval?: number; // in minutes
}

export interface SummaryRequest {
  title: string;
  content: string;
  url: string;
}

export interface TTSRequest {
  text: string;
  newsId: string;
}