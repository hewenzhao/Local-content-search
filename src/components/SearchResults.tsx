import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Files,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Folder,
  Eye,
  Hash,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import { FileRecord, FileType, SearchMatch, SearchResult } from '../types';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  totalMatches: number;
  onOpenFileViewer: (file: FileRecord, initialMatchIndex?: number) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  totalMatches,
  onOpenFileViewer,
}) => {
  // Track which cards have expanded all matches
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});
  // Track copied status for file paths
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);

  const handleShowInFolder = async (file: FileRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.electronAPI?.showItemInFolder) {
      await window.electronAPI.showItemInFolder(file.path);
    }
  };

  const handleOpenNativeApp = async (file: FileRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.electronAPI?.openPath) {
      await window.electronAPI.openPath(file.path);
    } else {
      handleDownloadBlob(file, e);
    }
  };

  const toggleExpand = (fileId: string) => {
    setExpandedFiles((prev) => ({
      ...prev,
      [fileId]: !prev[fileId],
    }));
  };

  const handleCopyPath = async (file: FileRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(file.path);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadBlob = (file: FileRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.blobUrl) {
      window.open(file.blobUrl, '_blank');
    } else {
      // Create a blob from content
      const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (ms: number) => {
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  };

  // Get icon and color badge by file type
  const getTypeBadge = (type: FileType, ext: string) => {
    switch (type) {
      case 'json':
        return {
          icon: FileCode,
          label: 'JSON',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          iconColor: 'text-amber-600',
        };
      case 'csv':
        return {
          icon: FileSpreadsheet,
          label: ext.toUpperCase() || 'CSV',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          iconColor: 'text-emerald-600',
        };
      case 'docx':
      case 'doc':
        return {
          icon: Files,
          label: ext.toUpperCase(),
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          iconColor: 'text-blue-600',
        };
      case 'excel':
        return {
          icon: FileSpreadsheet,
          label: ext.toUpperCase(),
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconColor: 'text-emerald-600',
        };
      case 'pdf':
        return {
          icon: FileText,
          label: 'PDF',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          iconColor: 'text-rose-600',
        };
      case 'html':
        return {
          icon: FileCode,
          label: 'HTML',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          iconColor: 'text-purple-600',
        };
      default:
        return {
          icon: FileText,
          label: ext.toUpperCase() || 'TXT',
          badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
          iconColor: 'text-stone-600',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Results Header Status */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <div>
          共检索到 <strong className="text-stone-900 font-semibold">{results.length}</strong> 个文件，
          累计命中 <strong className="text-amber-700 font-semibold">{totalMatches}</strong> 处
        </div>
        <div className="text-[11px] text-stone-500">
          点击“浏览文件”可全屏查看正文及命中跳转
        </div>
      </div>

      {/* List of matching files */}
      <div className="space-y-3.5">
        {results.map((result) => {
          const { file, matches, matchCount } = result;
          const badge = getTypeBadge(file.type, file.extension);
          const Icon = badge.icon;
          const isExpanded = expandedFiles[file.id];
          const displayedMatches = isExpanded ? matches : matches.slice(0, 3);
          const hasMore = matches.length > 3;

          return (
            <article
              key={file.id}
              className="bg-white rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all overflow-hidden"
            >
              {/* File Card Header */}
              <div className="p-4 sm:p-5 pb-3 border-b border-stone-100 bg-stone-50/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left: Icon, Filename, Path */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg border ${badge.badgeClass} shrink-0 mt-0.5`}
                    >
                      <Icon className={`w-5 h-5 ${badge.iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className="text-sm sm:text-base font-bold text-stone-900 truncate select-text"
                          title={file.name}
                        >
                          {file.name}
                        </h3>

                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium border ${badge.badgeClass}`}
                        >
                          {badge.label}
                        </span>

                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 font-medium">
                          命中 {matchCount} 处
                        </span>
                      </div>

                      {/* File path info */}
                      <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 truncate">
                        <Folder className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span
                          className="truncate font-mono text-[11px] text-stone-600 select-all"
                          title={file.path}
                        >
                          {file.path}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Browse, Copy Path, Open Native) */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* If in Electron: Show in Windows File Explorer */}
                    {isElectron ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleShowInFolder(file, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-md transition-colors cursor-pointer"
                          title="在 Windows 文件资源管理器中打开并选中该文件"
                        >
                          <Folder className="w-3.5 h-3.5 text-amber-600" />
                          <span>定位文件</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleOpenNativeApp(file, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-md transition-colors cursor-pointer"
                          title="使用 Windows 系统默认关联程序（Word/Excel/Notepad等）打开"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                          <span>系统打开</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Copy Path */}
                        <button
                          id={`btn-copy-path-${file.id}`}
                          type="button"
                          onClick={(e) => handleCopyPath(file, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-md transition-colors cursor-pointer"
                          title="复制该文件的本地系统绝对/相对路径"
                        >
                          {copiedId === file.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-medium">已复制路径</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-stone-500" />
                              <span>复制路径</span>
                            </>
                          )}
                        </button>

                        {/* Open in Browser / Download */}
                        {file.blobUrl && (
                          <button
                            id={`btn-open-native-${file.id}`}
                            type="button"
                            onClick={(e) => handleDownloadBlob(file, e)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-md transition-colors cursor-pointer"
                            title="在浏览器原生新标签页打开或下载该文件"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                            <span className="hidden sm:inline">本地打开</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* Browse File Full Screen */}
                    <button
                      id={`btn-browse-file-${file.id}`}
                      type="button"
                      onClick={() => onOpenFileViewer(file)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors shadow-xs cursor-pointer"
                      title="进入全屏阅览器浏览全文并定位高亮匹配"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>浏览文件</span>
                    </button>
                  </div>
                </div>

                {/* File Metadata Line */}
                <div className="mt-2.5 flex items-center gap-4 text-[11px] text-stone-600 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Layers className="w-3 h-3 text-stone-500" /> 大小: {formatSize(file.size)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-500" /> 修改: {formatDate(file.lastModified)}
                  </span>
                  {file.metadata?.pageCount && (
                    <span>共 {file.metadata.pageCount} 页</span>
                  )}
                  {file.metadata?.sheetCount && (
                    <span>共 {file.metadata.sheetCount} 个工作表</span>
                  )}
                  {file.metadata?.lineCount && (
                    <span>约 {file.metadata.lineCount} 行</span>
                  )}
                </div>
              </div>

              {/* Partial Snippets Section (部分预览) */}
              <div className="p-4 sm:p-5 pt-3 bg-white">
                <div className="text-xs font-medium text-stone-600 mb-2 flex items-center gap-1.5">
                  <span>匹配部分预览:</span>
                </div>

                <div className="space-y-2">
                  {displayedMatches.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-stone-50/80 border border-stone-200/80 text-xs leading-relaxed select-text"
                    >
                      {/* Location Badge (Line / Page / Sheet) */}
                      <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 font-mono text-stone-600 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                            <Hash className="w-3 h-3" /> 第 {m.lineNumber} 行
                          </span>

                          {m.pageNumber && (
                            <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-medium">
                              第 {m.pageNumber} 页
                            </span>
                          )}

                          {m.sheetName && (
                            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                              表: {m.sheetName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Snippet text with highlighted matched portion */}
                      <div className="text-stone-700 font-mono text-xs break-all">
                        <span>{m.snippetBefore}</span>
                        <mark className="bg-amber-300 text-stone-900 font-bold px-1 py-0.5 rounded shadow-2xs mx-0.5">
                          {m.matchText}
                        </mark>
                        <span>{m.snippetAfter}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show more toggle if matches > 3 */}
                {hasMore && (
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => toggleExpand(file.id)}
                      className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium py-1 px-3 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>收起预览 (仅展示前 3 处)</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>展开其余 {matches.length - 3} 处匹配</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
