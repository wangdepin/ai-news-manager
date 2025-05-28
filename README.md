# AI 信息管家 - Next.js + Vercel 版本 🚀

基于 Next.js + Vercel + Supabase 的云端 AI 新闻聚合系统，自动抓取、摘要并生成语音播报。

## 🏗️ 技术架构

- **前端**：Next.js 14 + TypeScript + Tailwind CSS
- **部署**：Vercel（自动部署 + Cron 定时任务）
- **数据库**：Supabase（PostgreSQL）
- **文件存储**：Vercel Blob Storage（音频文件）
- **AI 服务**：
  - DeepSeek API（内容摘要）
  - Minimax API（语音合成）

## ✨ 核心功能

- 📰 **多源聚合**：自动抓取 arXiv、OpenAI Blog、HuggingFace、Hacker News
- 🤖 **智能摘要**：DeepSeek API 生成 3-5 条关键信息
- 🎧 **语音播报**：Minimax TTS 生成自然语音，支持在线播放
- ⏰ **定时更新**：Vercel Cron 每小时自动更新
- 📱 **响应式设计**：适配手机、平板、桌面设备

## 🚀 部署指南

### 1. 准备工作

获取以下服务的 API Key：
- [Supabase](https://supabase.com/) - 数据库
- [DeepSeek](https://platform.deepseek.com/) - AI 摘要
- [Minimax](https://api.minimax.chat/) - 语音合成
- [Vercel](https://vercel.com/) - 部署 + Blob 存储

### 2. 配置 Supabase

1. 创建新项目
2. 在 SQL Editor 中执行以下建表语句：

```sql
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

CREATE INDEX idx_news_published_date ON news_items(published_date DESC);
CREATE INDEX idx_news_source ON news_items(source);
```

### 3. 部署到 Vercel

1. Fork 本项目到你的 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
SUPABASE_SERVICE_KEY=你的_supabase_service_key

# DeepSeek API
DEEPSEEK_API_KEY=你的_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1

# Minimax TTS API
MINIMAX_API_KEY=你的_minimax_api_key
MINIMAX_GROUP_ID=你的_minimax_group_id

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=你的_vercel_blob_token

# Cron Secret
CRON_SECRET=随机生成的密钥
```

4. 部署完成后，Vercel 会自动启用定时任务（每小时执行）

### 4. 本地开发

```bash
# 安装依赖
cd ai-news-nextjs
npm install

# 复制环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 API Keys

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 📂 项目结构

```
ai-news-nextjs/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── news/         # 获取新闻列表
│   │   ├── fetch-news/   # 手动触发抓取
│   │   └── cron/         # 定时任务入口
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── components/            # React 组件
│   ├── NewsCard.tsx      # 新闻卡片
│   └── NewsList.tsx      # 新闻列表
├── lib/                   # 核心逻辑
│   ├── services/         # 服务模块
│   │   ├── sources/      # 新闻源爬虫
│   │   ├── deepseek.ts   # DeepSeek API
│   │   ├── minimax-tts.ts # Minimax TTS
│   │   └── news-processor.ts # 新闻处理
│   └── utils/            # 工具函数
├── types/                # TypeScript 类型
└── vercel.json          # Vercel 配置（定时任务）
```

## 🔧 API 接口

- `GET /api/news` - 获取最新新闻列表
- `POST /api/fetch-news` - 手动触发新闻抓取
- `GET /api/cron` - 定时任务接口（需要 Bearer Token）

## 💰 成本估算

- **Supabase**：免费套餐足够（500MB 数据库 + 1GB 传输）
- **Vercel**：免费套餐足够（100GB 带宽/月）
- **DeepSeek**：约 ¥0.001/条摘要
- **Minimax TTS**：约 ¥0.01/条语音
- **预估成本**：每天 50 条新闻约 ¥0.5-1.0

## 🛠️ 扩展建议

1. **添加更多新闻源**：
   - Anthropic Blog
   - Google AI Blog
   - MIT News AI

2. **功能增强**：
   - 用户订阅偏好设置
   - 关键词过滤
   - 邮件/微信推送
   - 历史归档查询

3. **性能优化**：
   - 增加 Redis 缓存
   - 使用 ISR 提升加载速度
   - 图片 CDN 加速

## 📝 注意事项

1. 确保所有 API Key 都已正确配置
2. Vercel Cron 仅在 Pro 套餐支持更高频率（免费版最短 1 小时）
3. 注意各 API 的调用限制和费用
4. 定期检查爬虫是否正常工作

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License