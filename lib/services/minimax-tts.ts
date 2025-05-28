import axios from 'axios';
import { put } from '@vercel/blob';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID;
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text_to_speech';

export interface MinimaxTTSRequest {
  text: string;
  model?: string;
  voice_id?: string;
  speed?: number;
  vol?: number;
  pitch?: number;
  emotion?: string;
}

export async function generateTTS(text: string, newsId: string): Promise<string | null> {
  if (!MINIMAX_API_KEY || !MINIMAX_GROUP_ID) {
    throw new Error('Minimax API credentials not configured');
  }

  try {
    // Prepare TTS request
    const ttsRequest: MinimaxTTSRequest = {
      text: prepareTTSText(text),
      model: 'speech-01',
      voice_id: 'female-tianmei',  // 甜美女声
      speed: 1.0,
      vol: 1.0,
      pitch: 0
    };

    // Call Minimax API
    const response = await axios.post(
      MINIMAX_API_URL,
      {
        ...ttsRequest,
        group_id: MINIMAX_GROUP_ID
      },
      {
        headers: {
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // Upload to Vercel Blob
    const audioBuffer = Buffer.from(response.data);
    const filename = `audio/${newsId}_${Date.now()}.mp3`;
    
    const blob = await put(filename, audioBuffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'audio/mpeg'
    });

    console.log(`Generated and uploaded TTS for news ${newsId}: ${blob.url}`);
    return blob.url;
  } catch (error: any) {
    console.error('Minimax TTS error:', error.response?.data || error.message);
    return null;
  }
}

function prepareTTSText(content: string): string {
  // Clean and format text for better TTS output
  let text = content
    .replace(/\n+/g, '。')  // Replace newlines with periods
    .replace(/[-*]/g, '')   // Remove bullet points
    .replace(/\s+/g, ' ')   // Normalize whitespace
    .trim();

  // Add pauses for better speech rhythm
  text = text.replace(/。/g, '。 ');
  
  // Limit length for TTS (Minimax has limits)
  const maxLength = 500;
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '... 更多详情请查看原文。';
  }

  return text;
}

export async function batchGenerateTTS(
  items: Array<{ id: string; title: string; summary: string }>
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  // Process one by one to avoid overloading
  for (const item of items) {
    const ttsText = `标题：${item.title}。摘要内容：${item.summary}`;
    const audioUrl = await generateTTS(ttsText, item.id);
    
    if (audioUrl) {
      results.set(item.id, audioUrl);
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}