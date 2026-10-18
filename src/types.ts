export type FileType = 'txt' | 'doc' | 'docx' | 'excel' | 'pdf' | 'html' | 'json' | 'csv' | 'other';

export interface PageContent {
  pageNumber: number;
  text: string;
}

export interface SheetContent {
  sheetName: string;
  text: string;
  rowCount: number;
  colCount: number;
}

export interface SavedIndexFile {
  version: string;
  exportDate: string;
  totalFiles: number;
  records: {
    id: string;
    name: string;
    path: string;
    size: number;
    lastModified: number;
    type: FileType;
    extension: string;
    content: string;
    pages?: PageContent[];
    sheets?: SheetContent[];
    metadata?: Record<string, any>;
  }[];
}

export interface FileRecord {
  id: string;
  name: string;
  path: string;
  size: number;
  lastModified: number;
  type: FileType;
  extension: string;
  content: string; // full plaintext extracted for searching
  rawFile?: File; // Native browser File object if available
  blobUrl?: string; // Blob URL for direct browser preview
  pages?: PageContent[];
  sheets?: SheetContent[];
  metadata?: {
    title?: string;
    pageCount?: number;
    sheetCount?: number;
    lineCount?: number;
    error?: string;
  };
}

export interface SearchMatch {
  index: number;
  length: number;
  text: string;
  lineNumber: number;
  lineText: string;
  snippetBefore: string;
  matchText: string;
  snippetAfter: string;
  pageNumber?: number;
  sheetName?: string;
}

export interface SearchResult {
  file: FileRecord;
  matches: SearchMatch[];
  matchCount: number;
}

export interface SearchFilter {
  query: string;
  isRegex: boolean;
  isCaseSensitive: boolean;
  isWholeWord: boolean;
  selectedType: string; // 'all' | FileType
  sortBy: 'relevance' | 'name' | 'size' | 'modified';
}

export interface IndexingProgress {
  total: number;
  current: number;
  currentFileName: string;
  isIndexing: boolean;
}

export interface ElectronScannedFile {
  fullPath: string;
  name: string;
  size: number;
  mtime: number;
  extension: string;
}

export interface ElectronAPI {
  isElectron: boolean;
  selectDirectory: () => Promise<string | null>;
  selectFiles: () => Promise<string[] | null>;
  openPath: (fullPath: string) => Promise<{ success: boolean; error?: string }>;
  showItemInFolder: (fullPath: string) => Promise<{ success: boolean; error?: string }>;
  scanDirectory: (dirPath: string) => Promise<ElectronScannedFile[]>;
  readFileBuffer: (fullPath: string) => Promise<{
    success: boolean;
    data?: ArrayBuffer;
    size?: number;
    mtime?: number;
    name?: string;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
