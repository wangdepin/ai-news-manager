import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Database schema
export const createNewsTable = `
  CREATE TABLE IF NOT EXISTS news_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    content TEXT,
    summary TEXT,
    source TEXT NOT NULL,
    published_date TIMESTAMPTZ NOT NULL,
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_news_published_date ON news_items(published_date DESC);
  CREATE INDEX IF NOT EXISTS idx_news_source ON news_items(source);
`;