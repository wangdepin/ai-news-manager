'use client';

import { NewsItem } from '@/types/news';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState } from 'react';

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlayAudio = () => {
    if (!item.audio_url) return;

    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const newAudio = new Audio(item.audio_url);
      newAudio.play();
      newAudio.onended = () => setIsPlaying(false);
      setAudio(newAudio);
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
            {item.title}
          </a>
        </h3>
        {item.audio_url && (
          <button
            onClick={handlePlayAudio}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            {isPlaying ? '⏸️ 暂停' : '🎧 播放'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <span className="bg-gray-100 px-2 py-1 rounded">{item.source}</span>
        <time dateTime={item.published_date}>
          {format(new Date(item.published_date), 'MM月dd日 HH:mm', { locale: zhCN })}
        </time>
      </div>

      {item.summary && (
        <div className="text-gray-700 space-y-1">
          {item.summary.split('\n').map((line, index) => (
            <p key={index} className="text-sm">
              {line}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          阅读原文 →
        </a>
      </div>
    </div>
  );
}