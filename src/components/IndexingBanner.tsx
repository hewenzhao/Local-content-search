import React from 'react';
import { Loader2, HardDrive } from 'lucide-react';
import { IndexingProgress } from '../types';

interface IndexingBannerProps {
  progress: IndexingProgress;
}

export const IndexingBanner: React.FC<IndexingBannerProps> = ({ progress }) => {
  if (!progress.isIndexing) return null;

  const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
          <div className="text-xs font-medium text-amber-950 truncate">
            正在解析本地文档正文 ({progress.current}/{progress.total}):{' '}
            <span className="font-mono text-amber-800">{progress.currentFileName}</span>
          </div>
        </div>
        <div className="text-xs font-semibold text-amber-900 shrink-0 font-mono">
          {percent}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-amber-600 h-1.5 rounded-full transition-all duration-200 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
