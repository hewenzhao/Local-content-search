import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { FileViewerModal } from './components/FileViewerModal';
import { EmptyState } from './components/EmptyState';
import { IndexingBanner } from './components/IndexingBanner';
import { BuildGuideModal } from './components/BuildGuideModal';
import { SAMPLE_FILES } from './data/sampleFiles';
import { FileRecord, IndexingProgress, SearchFilter, SavedIndexFile } from './types';
import { processFileToRecord, processBufferToRecord } from './utils/fileParsers';
import { searchFiles } from './utils/searchEngine';
import { UploadCloud } from 'lucide-react';

export default function App() {
  // Loaded documents in memory
  const [files, setFiles] = useState<FileRecord[]>(SAMPLE_FILES);

  // Search filter options
  const [filter, setFilter] = useState<SearchFilter>({
    query: '',
    isRegex: false,
    isCaseSensitive: false,
    isWholeWord: false,
    selectedType: 'all',
    sortBy: 'relevance',
  });

  // Indexing progress state
  const [progress, setProgress] = useState<IndexingProgress>({
    total: 0,
    current: 0,
    currentFileName: '',
    isIndexing: false,
  });

  // Active file in full viewer modal
  const [viewerFile, setViewerFile] = useState<FileRecord | null>(null);
  const [viewerMatchIndex, setViewerMatchIndex] = useState<number | undefined>(undefined);

  // Windows .exe compilation guide modal
  const [isBuildGuideOpen, setIsBuildGuideOpen] = useState(false);

  // Drag over state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);

  // Update filter
  const handleFilterChange = (updates: Partial<SearchFilter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  };

  const handleClearQuery = () => {
    setFilter((prev) => ({ ...prev, query: '' }));
  };

  // Perform search across files
  const searchOutput = useMemo(() => {
    return searchFiles(files, filter);
  }, [files, filter]);

  // Load sample dataset
  const handleLoadSamples = () => {
    setFiles(SAMPLE_FILES);
    setFilter((prev) => ({
      ...prev,
      query: '"本地文件"',
      isRegex: false,
      selectedType: 'all',
    }));
  };

  // Clear all files
  const handleClearFiles = () => {
    setFiles([]);
    setFilter((prev) => ({ ...prev, query: '' }));
  };

  // Process a list of File objects with progress updates
  const processFileList = async (fileItems: { file: File; relativePath?: string }[]) => {
    if (fileItems.length === 0) return;

    setProgress({
      total: fileItems.length,
      current: 0,
      currentFileName: fileItems[0].file.name,
      isIndexing: true,
    });

    const newRecords: FileRecord[] = [];

    for (let i = 0; i < fileItems.length; i++) {
      const item = fileItems[i];
      setProgress((prev) => ({
        ...prev,
        current: i + 1,
        currentFileName: item.file.name,
      }));

      try {
        const record = await processFileToRecord(item.file, item.relativePath);
        newRecords.push(record);
      } catch (err) {
        console.warn(`Error parsing ${item.file.name}:`, err);
      }
    }

    setFiles((prev) => {
      // Merge while preventing duplicate IDs
      const map = new Map<string, FileRecord>();
      // Keep existing non-sample or merge
      for (const f of prev) {
        map.set(f.path, f);
      }
      for (const f of newRecords) {
        map.set(f.path, f);
      }
      return Array.from(map.values());
    });

    setProgress({
      total: 0,
      current: 0,
      currentFileName: '',
      isIndexing: false,
    });
  };

  // Select local folder using Native Electron or File System Access API with fallback
  const handleSelectDirectory = async () => {
    // 1. Native Windows Electron Application Flow
    if (isElectron && window.electronAPI?.selectDirectory && window.electronAPI?.scanDirectory) {
      try {
        const dirPath = await window.electronAPI.selectDirectory();
        if (!dirPath) return;

        const scanned = await window.electronAPI.scanDirectory(dirPath);
        if (scanned.length === 0) {
          alert('所选文件夹中未找到支持检索的文档文件 (.txt, .docx, .xlsx, .pdf, .html 等)');
          return;
        }

        setProgress({
          total: scanned.length,
          current: 0,
          currentFileName: scanned[0].name,
          isIndexing: true,
        });

        const newRecords: FileRecord[] = [];
        for (let i = 0; i < scanned.length; i++) {
          const item = scanned[i];
          setProgress((prev) => ({
            ...prev,
            current: i + 1,
            currentFileName: item.name,
          }));

          try {
            const fileRes = await window.electronAPI.readFileBuffer(item.fullPath);
            if (fileRes.success && fileRes.data) {
              const record = await processBufferToRecord(
                fileRes.data,
                item.name,
                item.fullPath,
                item.size,
                item.mtime
              );
              newRecords.push(record);
            }
          } catch (readErr) {
            console.warn(`Error reading file ${item.fullPath}:`, readErr);
          }
        }

        setFiles((prev) => {
          const map = new Map<string, FileRecord>();
          for (const f of prev) map.set(f.path, f);
          for (const f of newRecords) map.set(f.path, f);
          return Array.from(map.values());
        });

        setProgress({
          total: 0,
          current: 0,
          currentFileName: '',
          isIndexing: false,
        });
        return;
      } catch (err: any) {
        console.error('Electron folder selection error:', err);
      }
    }

    // 2. Web Browser File System Access API
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-expect-error Native File System Access API
        const dirHandle = await window.showDirectoryPicker();
        const collected: { file: File; relativePath: string }[] = [];

        async function readDir(handle: any, currentPath: string) {
          for await (const entry of handle.values()) {
            const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
            if (entry.kind === 'file') {
              // Only collect supported formats or text files
              const ext = entry.name.split('.').pop()?.toLowerCase();
              if (
                ext &&
                [
                  'txt',
                  'md',
                  'log',
                  'json',
                  'xml',
                  'doc',
                  'docx',
                  'xls',
                  'xlsx',
                  'csv',
                  'pdf',
                  'html',
                  'htm',
                  'yaml',
                  'yml',
                  'ini',
                  'sql',
                  'js',
                  'ts',
                ].includes(ext)
              ) {
                const file = await entry.getFile();
                collected.push({ file, relativePath: entryPath });
              }
            } else if (entry.kind === 'directory') {
              if (!['node_modules', '.git', 'dist', '.vscode', '.idea'].includes(entry.name)) {
                await readDir(entry, entryPath);
              }
            }
          }
        }

        await readDir(dirHandle, dirHandle.name);

        if (collected.length > 0) {
          await processFileList(collected);
        }
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User cancelled
        console.warn('showDirectoryPicker unavailable or blocked, falling back to input:', err);
      }
    }

    // Fallback: trigger webkitdirectory input
    const dirInput = document.querySelector('input[webkitdirectory]') as HTMLInputElement | null;
    if (dirInput) {
      dirInput.click();
    }
  };

  // Select files from standard input
  const handleSelectFiles = async (fileList: FileList) => {
    const list: { file: File; relativePath?: string }[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      list.push({ file: f, relativePath: (f as any).webkitRelativePath || f.name });
    }
    await processFileList(list);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleSelectFiles(e.dataTransfer.files);
    }
  };

  // Open full file viewer modal
  const handleOpenFileViewer = (file: FileRecord, initialMatchIndex?: number) => {
    setViewerFile(file);
    setViewerMatchIndex(initialMatchIndex);
  };

  // Export parsed index to a downloadable JSON file
  const handleExportIndex = () => {
    if (files.length === 0) return;
    const indexData: SavedIndexFile = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      totalFiles: files.length,
      records: files.map((f) => ({
        id: f.id,
        name: f.name,
        path: f.path,
        size: f.size,
        lastModified: f.lastModified,
        type: f.type,
        extension: f.extension,
        content: f.content,
        pages: f.pages,
        sheets: f.sheets,
        metadata: f.metadata,
      })),
    };

    const blob = new Blob([JSON.stringify(indexData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `file-search-index-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import previously saved index JSON file
  const handleImportIndex = async (file: File) => {
    try {
      const text = await file.text();
      const parsed: SavedIndexFile = JSON.parse(text);
      if (!parsed || !Array.isArray(parsed.records) || parsed.records.length === 0) {
        alert('无效的解析索引文件，未检测到有效的文档记录。');
        return;
      }

      const restoredFiles: FileRecord[] = parsed.records.map((r) => ({
        ...r,
        blobUrl: URL.createObjectURL(
          new Blob([r.content], { type: 'text/plain;charset=utf-8' })
        ),
      }));

      setFiles((prev) => {
        const map = new Map<string, FileRecord>();
        for (const f of prev) map.set(f.path, f);
        for (const f of restoredFiles) map.set(f.path, f);
        return Array.from(map.values());
      });
    } catch (err: any) {
      alert(`导入解析索引失败: ${err.message}`);
    }
  };

  const totalIndexedSize = useMemo(() => {
    return files.reduce((sum, f) => sum + f.size, 0);
  }, [files]);

  // Current active matches for the modal
  const activeModalMatches = useMemo(() => {
    if (!viewerFile) return [];
    const found = searchOutput.results.find((r) => r.file.id === viewerFile.id);
    return found ? found.matches : [];
  }, [viewerFile, searchOutput.results]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans relative selection:bg-amber-200 selection:text-stone-900"
    >
      {/* Drag and drop overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-2xl border-2 border-dashed border-amber-500">
            <UploadCloud className="w-12 h-12 text-amber-600 mx-auto mb-2 animate-bounce" />
            <h3 className="text-base font-bold text-stone-900">释放鼠标以导入文件</h3>
            <p className="text-xs text-stone-500 mt-1">
              自动识别 TXT, DOC, DOCX, Excel, CSV, JSON, PDF, HTML 等文件
            </p>
          </div>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        files={files}
        onSelectDirectory={handleSelectDirectory}
        onSelectFiles={handleSelectFiles}
        onLoadSamples={handleLoadSamples}
        onClearFiles={handleClearFiles}
        onOpenBuildGuide={() => setIsBuildGuideOpen(true)}
        onExportIndex={handleExportIndex}
        onImportIndex={handleImportIndex}
        isIndexing={progress.isIndexing}
        totalIndexedSize={totalIndexedSize}
        isElectron={isElectron}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Indexing Progress Notification Banner */}
        <IndexingBanner progress={progress} />

        {/* Search Bar & Mode Options */}
        {files.length > 0 && (
          <SearchBar
            filter={filter}
            onChange={handleFilterChange}
            onClear={handleClearQuery}
            resultCount={searchOutput.results.length}
            totalMatches={searchOutput.totalMatches}
            isPhraseSearch={searchOutput.isPhraseSearch}
            searchError={searchOutput.error}
          />
        )}

        {/* Content Body: Empty State or Results List */}
        {files.length === 0 || !filter.query.trim() || searchOutput.results.length === 0 ? (
          <EmptyState
            hasFiles={files.length > 0}
            hasQuery={Boolean(filter.query.trim())}
            onSelectDirectory={handleSelectDirectory}
            onLoadSamples={handleLoadSamples}
            onSelectFiles={handleSelectFiles}
            onImportIndex={handleImportIndex}
          />
        ) : (
          <SearchResults
            results={searchOutput.results}
            query={filter.query}
            totalMatches={searchOutput.totalMatches}
            onOpenFileViewer={handleOpenFileViewer}
          />
        )}
      </main>

      {/* Footer */}
      <footer id="app-footer" className="border-t border-stone-200 bg-white/80 py-3 text-center text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>本地 PC 文件内容检索工具 (Local Full Text Search) · 支持纯离线解析</span>
            <span className="text-stone-300 hidden sm:inline">|</span>
            <span className="font-medium text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/80">
              设计者·贺文照
            </span>
          </div>
          <span className="text-stone-500 font-mono text-[11px]">
            格式: txt, doc, docx, xls, xlsx, csv, pdf, html | 短语: "半角双引号" | 正则: .*
          </span>
        </div>
      </footer>

      {/* Full Document Viewer Modal */}
      {viewerFile && (
        <FileViewerModal
          file={viewerFile}
          query={filter.query}
          matches={activeModalMatches}
          initialMatchIndex={viewerMatchIndex}
          onClose={() => setViewerFile(null)}
        />
      )}

      {/* Windows .exe Compilation & Packaging Guide Modal */}
      <BuildGuideModal
        isOpen={isBuildGuideOpen}
        onClose={() => setIsBuildGuideOpen(false)}
      />
    </div>
  );
}
