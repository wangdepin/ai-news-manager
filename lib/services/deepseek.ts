import axios from 'axios';

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateSummary(title: string, content: string, url: string): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured');
  }

  const prompt = `请为以下AI领域的新闻/论文生成简洁摘要。

标题：${title}
链接：${url}
内容：${content.slice(0, 2000)}...

要求：
1. 生成3-5个要点，每个要点一行
2. 使用bullet形式（-开头）
3. 突出核心创新或重要信息
4. 每条不超过20个字
5. 适合快速阅读理解
6. 用中文回复

只返回要点内容，不需要其他说明。`;

  try {
    const response = await axios.post<DeepSeekResponse>(
      `${DEEPSEEK_API_URL}/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的AI新闻摘要助手，擅长提炼关键信息。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300,
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const summary = response.data.choices[0]?.message?.content?.trim() || '- 摘要生成失败';
    console.log(`Generated summary for: ${title}`);
    return summary;
  } catch (error: any) {
    console.error('DeepSeek API error:', error.response?.data || error.message);
    return '- 摘要生成失败';
  }
}

export async function batchGenerateSummaries(
  items: Array<{ id: string; title: string; content: string; url: string }>
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const summaries = await Promise.all(
      batch.map(item => 
        generateSummary(item.title, item.content, item.url)
          .catch(err => {
            console.error(`Failed to generate summary for ${item.id}:`, err);
            return '- 摘要生成失败';
          })
      )
    );
    
    batch.forEach((item, index) => {
      results.set(item.id, summaries[index]);
    });
    
    // Add a small delay between batches
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}