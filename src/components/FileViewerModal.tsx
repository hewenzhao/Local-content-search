import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Folder,
  Hash,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Files,
  Search,
  BookOpen,
} from 'lucide-react';
import { FileRecord, SearchMatch } from '../types';

interface FileViewerModalProps {
  file: FileRecord | null;
  query: string;
  matches: SearchMatch[];
  initialMatchIndex?: number;
  onClose: () => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  file,
  query,
  matches,
  initialMatchIndex,
  onClose,
}) => {
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Sync initial match or first match
  useEffect(() => {
    if (initialMatchIndex !== undefined && matches.length > 0) {
      const idx = matches.findIndex((m) => m.index === initialMatchIndex);
      setCurrentMatchIdx(idx !== -1 ? idx : 0);
    } else {
      setCurrentMatchIdx(0);
    }
  }, [file, initialMatchIndex, matches]);

  // Set default active sheet for Excel
  useEffect(() => {
    if (file?.sheets && file.sheets.length > 0) {
      setActiveSheet(file.sheets[0].sheetName);
    }
  }, [file]);

  // Scroll to active match
  useEffect(() => {
    if (matches.length > 0 && contentContainerRef.current) {
      const activeEl = contentContainerRef.current.querySelector(
        `[data-match-index="${currentMatchIdx}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatchIdx, matches]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);

  const handleShowInFolder = async () => {
    if (window.electronAPI?.showItemInFolder && file) {
      await window.electronAPI.showItemInFolder(file.path);
    }
  };

  const handleOpenNativeApp = async () => {
    if (window.electronAPI?.openPath && file) {
      await window.electronAPI.openPath(file.path);
    }
  };

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(file.path);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    } catch {}
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    } catch {}
  };

  const handlePrevMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIdx((prev) => (prev > 0 ? prev - 1 : matches.length - 1));
  };

  const handleNextMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIdx((prev) => (prev < matches.length - 1 ? prev + 1 : 0));
  };

  // Render text with highlights
  const renderHighlightedContent = () => {
    const text =
      activeSheet && file.sheets
        ? file.sheets.find((s) => s.sheetName === activeSheet)?.text || file.content
        : file.content;

    const lines = text.split('\n');

    return (
      <div className="font-mono text-xs leading-6 select-text">
        {lines.map((line, lineIdx) => {
          const lineNum = lineIdx + 1;

          // Check if any match falls on this line
          const lineMatches = matches.filter((m) => m.lineNumber === lineNum);

          return (
            <div
              key={lineIdx}
              className={`flex items-start hover:bg-amber-50/40 group py-0.5 px-2 rounded ${
                lineMatches.length > 0 ? 'bg-amber-50/20' : ''
              }`}
            >
              {/* Line number gutter */}
              <span className="w-12 shrink-0 select-none text-right pr-4 text-stone-400 group-hover:text-stone-600 font-mono text-[11px]">
                {lineNum}
              </span>

              {/* Line content */}
              <div className="flex-1 whitespace-pre-wrap break-all text-stone-800">
                {renderLineWithMatchMarks(line, lineNum)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Highlights matches in a specific line
  const renderLineWithMatchMarks = (line: string, lineNum: number) => {
    const relevantMatches = matches.filter((m) => m.lineNumber === lineNum);

    if (relevantMatches.length === 0 || !query.trim()) {
      return line || ' ';
    }

    // Sort matches on this line by column/occurrence
    // We can highlight tokens matching query
    // Simple substring replace for visual highlight:
    const escapedQuery = query
      .replace(/"/g, '')
      .trim()
      .split(/\s+/)
      .filter((q) => q.length > 0)
      .map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    if (!escapedQuery) {
      return line || ' ';
    }

    try {
      const reg = new RegExp(`(${escapedQuery})`, 'gi');
      const parts = line.split(reg);

      return parts.map((part, pIdx) => {
        if (reg.test(part)) {
          // Check if this is the active match
          const globalMatchIndex = matches.findIndex(
            (m) => m.lineNumber === lineNum && m.matchText.toLowerCase() === part.toLowerCase()
          );
          const isActive = globalMatchIndex === currentMatchIdx;

          return (
            <mark
              key={pIdx}
              data-match-index={globalMatchIndex !== -1 ? globalMatchIndex : undefined}
              className={`px-1 py-0.5 rounded transition-all ${
                isActive
                  ? 'bg-amber-400 text-stone-950 font-bold ring-2 ring-amber-600 shadow-xs'
                  : 'bg-amber-200 text-stone-900 font-semibold'
              }`}
            >
              {part}
            </mark>
          );
        }
        return <span key={pIdx}>{part}</span>;
      });
    } catch {
      return line || ' ';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between gap-4">
          {/* File details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
              <h2 className="text-base font-bold text-stone-900 truncate" title={file.name}>
                {file.name}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-stone-200/80 text-stone-700 font-mono uppercase">
                {file.extension}
              </span>
            </div>

            {/* Path info */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1 truncate">
              <Folder className="w-3.5 h-3.5 shrink-0 text-stone-400" />
              <span className="truncate font-mono text-[11px] select-all">{file.path}</span>
              <button
                type="button"
                onClick={handleCopyPath}
                className="text-stone-500 hover:text-stone-800 ml-1 p-0.5 rounded cursor-pointer"
                title="复制本地文件路径"
              >
                {copiedPath ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Action buttons & Match Navigator */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Match navigation stepper */}
            {matches.length > 0 && (
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-stone-200 shadow-2xs text-xs">
                <span className="text-stone-500 font-medium px-1">
                  命中 <strong className="text-stone-900">{currentMatchIdx + 1}</strong> /{' '}
                  {matches.length}
                </span>

                <button
                  type="button"
                  onClick={handlePrevMatch}
                  className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                  title="上一个匹配 (Shift+Enter)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMatch}
                  className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                  title="下一个匹配 (Enter)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Copy full text */}
            <button
              type="button"
              onClick={handleCopyContent}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer"
              title="复制提取的全文文本"
            >
              {copiedContent ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制全文</span>
                </>
              )}
            </button>

            {/* If Electron: Open in explorer & Open with default program */}
            {isElectron ? (
              <>
                <button
                  type="button"
                  onClick={handleShowInFolder}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="在 Windows 资源管理器中高亮定位该文件"
                >
                  <Folder className="w-3.5 h-3.5 text-amber-600" />
                  <span>定位文件</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenNativeApp}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="使用本地关联程序（Word/Excel/Notepad等）打开"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>系统打开</span>
                </button>
              </>
            ) : (
              file.blobUrl && (
                <a
                  href={file.blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="在新标签页浏览原生文件"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>原生打开</span>
                </a>
              )
            )}

            {/* Close Button */}
            <button
              id="btn-close-viewer"
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer ml-1"
              title="关闭预览 (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Excel Sheet Tabs (if Excel document) */}
        {file.sheets && file.sheets.length > 1 && (
          <div className="px-5 py-2 bg-stone-100 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-stone-500 font-medium shrink-0">工作表:</span>
            {file.sheets.map((sheet) => (
              <button
                key={sheet.sheetName}
                type="button"
                onClick={() => setActiveSheet(sheet.sheetName)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                  activeSheet === sheet.sheetName
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                {sheet.sheetName} ({sheet.rowCount}行)
              </button>
            ))}
          </div>
        )}

        {/* Document Content Scroll Area */}
        <div
          ref={contentContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50"
        >
          <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-xl p-4 sm:p-6 shadow-xs">
            {renderHighlightedContent()}
          </div>
        </div>

        {/* Modal Bottom Footer Info */}
        <div className="px-5 py-2.5 border-t border-stone-200 bg-white flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span>
              总字数: <strong>{file.content.length}</strong> 字
            </span>
            {file.metadata?.lineCount && (
              <span>
                行数: <strong>{file.metadata.lineCount}</strong> 行
              </span>
            )}
            {file.metadata?.pageCount && (
              <span>
                页数: <strong>{file.metadata.pageCount}</strong> 页
              </span>
            )}
          </div>

          <div className="text-[11px] text-stone-400">
            按 <kbd className="px-1 py-0.5 bg-stone-100 border rounded text-stone-600">Esc</kbd>{' '}
            关闭，点击行内高亮可直接选中
          </div>
        </div>
      </div>
    </div>
  );
};
