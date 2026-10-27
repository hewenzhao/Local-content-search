import React, { useRef } from 'react';
import {
  FolderOpen,
  FilePlus,
  Sparkles,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileCode,
  Files,
  HardDrive,
  PackageCheck,
  Monitor,
  Save,
  FileUp,
} from 'lucide-react';
import { FileRecord } from '../types';
import appLogo from '../assets/logo.jpg';

interface HeaderProps {
  files: FileRecord[];
  onSelectDirectory: () => void;
  onSelectFiles: (files: FileList) => void;
  onLoadSamples: () => void;
  onClearFiles: () => void;
  onOpenBuildGuide: () => void;
  onExportIndex: () => void;
  onImportIndex: (file: File) => void;
  isIndexing: boolean;
  totalIndexedSize: number;
  isElectron?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  files,
  onSelectDirectory,
  onSelectFiles,
  onLoadSamples,
  onClearFiles,
  onOpenBuildGuide,
  onExportIndex,
  onImportIndex,
  isIndexing,
  totalIndexedSize,
  isElectron,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirInputRef = useRef<HTMLInputElement>(null);
  const indexInputRef = useRef<HTMLInputElement>(null);

  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Group count by type
  const typeCounts = files.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <header className="border-b border-stone-200 bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & Title with submitted app icon */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-xs overflow-hidden border border-stone-200 shrink-0 p-1">
              <img
                src={appLogo}
                alt="本地文件全文搜索 Logo"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('Local-Search2')) {
                    target.src = './assets/aistudio/Local-Search2_f61edb1f.jpg';
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  本地文件全文搜索
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-900 border border-amber-300 font-mono shadow-2xs">
                  V3.0
                </span>
                <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                  Oct, 2026
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 tracking-wide">
                  Local Full Text Search
                </span>
                {isElectron ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-300 flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-emerald-600" /> Windows 原生客户端
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium border border-stone-200">
                    本地PC离线解析
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5 flex-wrap">
                <span>支持 TXT · Word · Excel · CSV · JSON · PDF · HTML | 正则与双引号短语搜索</span>
                <span className="text-stone-300 hidden sm:inline">|</span>
                <span className="font-medium text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded text-[11px] border border-stone-200">设计者：贺文照</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Build Windows .exe Guide Button */}
            <button
              id="btn-build-guide"
              type="button"
              onClick={onOpenBuildGuide}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300 cursor-pointer"
              title="查看如何打包为 Windows 下独立运行的 .exe 可执行程序"
            >
              <PackageCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>.exe 打包指南</span>
            </button>

            {/* Native Folder Picker Button */}
            <button
              id="btn-select-folder"
              type="button"
              onClick={onSelectDirectory}
              disabled={isIndexing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 rounded-lg transition-colors border border-stone-300 cursor-pointer disabled:opacity-50"
              title="选择并检索整个本地文件夹（支持递归子目录）"
            >
              <FolderOpen className="w-4 h-4 text-amber-600" />
              <span>选择本地文件夹</span>
            </button>

            {/* Fallback hidden directory input */}
            <input
              ref={dirInputRef}
              type="file"
              {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onSelectFiles(e.target.files);
                }
              }}
            />

            {/* Select Multiple Files */}
            <button
              id="btn-select-files"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isIndexing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 active:bg-stone-100 rounded-lg transition-colors border border-stone-200 cursor-pointer disabled:opacity-50"
              title="选择多个本地文档文件"
            >
              <FilePlus className="w-3.5 h-3.5 text-stone-600" />
              <span>选择文件</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md,.log,.json,.xml,.doc,.docx,.xls,.xlsx,.csv,.tsv,.pdf,.html,.htm"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onSelectFiles(e.target.files);
                }
              }}
            />

            {/* Export Index / Save parsed cache to file */}
            {files.length > 0 && (
              <button
                id="btn-export-index"
                type="button"
                onClick={onExportIndex}
                disabled={isIndexing}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 cursor-pointer disabled:opacity-50"
                title="将当前所有已解析的资料缓存保存为文件，下次可直接加载跳过解析"
              >
                <Save className="w-3.5 h-3.5 text-blue-600" />
                <span>保存解析索引</span>
              </button>
            )}

            {/* Import Index / Load saved cache file */}
            <button
              id="btn-import-index"
              type="button"
              onClick={() => indexInputRef.current?.click()}
              disabled={isIndexing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-lg transition-colors border border-stone-200 cursor-pointer disabled:opacity-50"
              title="加载此前保存的解析索引缓存文件，直接继续上次未完成的工作"
            >
              <FileUp className="w-3.5 h-3.5 text-stone-600" />
              <span>加载索引文件</span>
            </button>
            <input
              ref={indexInputRef}
              type="file"
              accept=".json,.index"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onImportIndex(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />

            {/* Load Sample Files */}
            <button
              id="btn-load-samples"
              type="button"
              onClick={onLoadSamples}
              disabled={isIndexing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 rounded-lg transition-colors border border-amber-200 cursor-pointer disabled:opacity-50"
              title="载入包含 Word/Excel/CSV/JSON/PDF/HTML/TXT 的预置测试示例"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>加载示例文件</span>
            </button>

            {/* Clear button if has files */}
            {files.length > 0 && (
              <button
                id="btn-clear-files"
                type="button"
                onClick={onClearFiles}
                disabled={isIndexing}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="清空已索引文件"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">清空</span>
              </button>
            )}
          </div>
        </div>

        {/* Indexing Stats Bar */}
        {files.length > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 font-medium text-stone-900">
                <HardDrive className="w-3.5 h-3.5 text-stone-500" />
                <span>已就绪 {files.length} 个文件</span>
                <span className="text-stone-400">({formatBytes(totalIndexedSize)})</span>
              </div>

              <div className="flex items-center gap-3 text-stone-500 flex-wrap">
                {typeCounts.txt && (
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3 h-3 text-stone-600" /> TXT: {typeCounts.txt}
                  </span>
                )}
                {(typeCounts.docx || typeCounts.doc) && (
                  <span className="inline-flex items-center gap-1">
                    <Files className="w-3 h-3 text-blue-600" /> Word: {(typeCounts.docx || 0) + (typeCounts.doc || 0)}
                  </span>
                )}
                {typeCounts.excel && (
                  <span className="inline-flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> Excel: {typeCounts.excel}
                  </span>
                )}
                {typeCounts.csv && (
                  <span className="inline-flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3 text-teal-600" /> CSV: {typeCounts.csv}
                  </span>
                )}
                {typeCounts.json && (
                  <span className="inline-flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-amber-600" /> JSON: {typeCounts.json}
                  </span>
                )}
                {typeCounts.pdf && (
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3 h-3 text-rose-600" /> PDF: {typeCounts.pdf}
                  </span>
                )}
                {typeCounts.html && (
                  <span className="inline-flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-purple-600" /> HTML: {typeCounts.html}
                  </span>
                )}
              </div>
            </div>

            <span className="text-stone-500 text-[11px]">
              数据仅留存在浏览器本地内存，无网络上传
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
