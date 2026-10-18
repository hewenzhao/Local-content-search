import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { FileRecord, FileType, PageContent, SheetContent } from '../types';

// Configure PDF.js worker using web worker URL or fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
} catch {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs';
}

/**
 * Determine FileType from filename extension
 */
export function getFileType(fileName: string): { type: FileType; extension: string } {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'json':
      return { type: 'json', extension: 'json' };
    case 'csv':
    case 'tsv':
      return { type: 'csv', extension: ext };
    case 'txt':
    case 'md':
    case 'log':
    case 'xml':
    case 'yaml':
    case 'yml':
    case 'ini':
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'py':
    case 'java':
    case 'c':
    case 'cpp':
    case 'sql':
      return { type: 'txt', extension: ext };
    case 'doc':
      return { type: 'doc', extension: ext };
    case 'docx':
      return { type: 'docx', extension: ext };
    case 'xls':
    case 'xlsx':
      return { type: 'excel', extension: ext };
    case 'pdf':
      return { type: 'pdf', extension: ext };
    case 'html':
    case 'htm':
      return { type: 'html', extension: ext };
    default:
      return { type: 'other', extension: ext };
  }
}

/**
 * Parse plain text files (.txt, .md, .csv, etc.)
 */
export async function parsePlainText(file: File): Promise<string> {
  try {
    const text = await file.text();
    // Detect if encoding is messed up (lots of replacement characters \uFFFD)
    if ((text.match(/\uFFFD/g) || []).length > 5) {
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder('gb18030');
      return decoder.decode(buffer);
    }
    return text;
  } catch (err) {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }
}

/**
 * Parse HTML files: strip scripts/styles, extract title and text
 */
export async function parseHtml(file: File): Promise<{ content: string; title: string }> {
  const rawHtml = await parsePlainText(file);
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  // Remove unwanted elements
  doc.querySelectorAll('script, style, noscript, svg').forEach((el) => el.remove());

  const title = doc.title || '';
  const bodyText = doc.body ? doc.body.innerText || doc.body.textContent || '' : '';
  const cleanContent = (title ? `[Title: ${title}]\n\n` : '') + bodyText.trim();

  return {
    content: cleanContent,
    title,
  };
}

/**
 * Parse JSON files: pretty format for readable line-by-line matching and structure
 */
export async function parseJson(
  file: File
): Promise<{ content: string; keyCount?: number; lineCount: number }> {
  const rawText = await parsePlainText(file);
  try {
    const parsed = JSON.parse(rawText);
    const pretty = JSON.stringify(parsed, null, 2);
    const lines = pretty.split('\n');
    return {
      content: pretty,
      keyCount: typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : undefined,
      lineCount: lines.length,
    };
  } catch {
    // If not standard JSON (e.g. JSON Lines / JSONL), return raw text
    const lines = rawText.split('\n');
    return {
      content: rawText,
      lineCount: lines.length,
    };
  }
}

/**
 * Parse CSV/TSV files with multi-encoding detection and tabular sheet structure
 */
export async function parseCsv(file: File): Promise<{
  content: string;
  sheets: SheetContent[];
  rowCount: number;
  colCount: number;
}> {
  try {
    const buffer = await file.arrayBuffer();
    // SheetJS XLSX handles CSV delimiters, quoted values, and tabs
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0] || 'CSV';
    const worksheet = workbook.Sheets[firstSheetName];

    if (worksheet) {
      const csvStr = XLSX.utils.sheet_to_csv(worksheet, { blankrows: false });
      const rows = csvStr.split('\n').filter((r) => r.trim().length > 0);
      const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : null;
      const rowCount = range ? range.e.r - range.s.r + 1 : rows.length;
      const colCount = range ? range.e.c - range.s.c + 1 : 0;

      const sheet: SheetContent = {
        sheetName: file.name,
        text: csvStr,
        rowCount,
        colCount,
      };

      return {
        content: csvStr,
        sheets: [sheet],
        rowCount,
        colCount,
      };
    }
  } catch (sheetErr) {
    console.warn(`SheetJS CSV parsing fallback for ${file.name}:`, sheetErr);
  }

  // Fallback: plain text line-based CSV
  const text = await parsePlainText(file);
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const colEstimate = lines.length > 0 ? lines[0].split(',').length : 0;
  const fallbackSheet: SheetContent = {
    sheetName: file.name,
    text,
    rowCount: lines.length,
    colCount: colEstimate,
  };

  return {
    content: text,
    sheets: [fallbackSheet],
    rowCount: lines.length,
    colCount: colEstimate,
  };
}

/**
 * Parse Word .docx files: unpack word/document.xml with JSZip
 */
export async function parseDocx(file: File): Promise<{ content: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXmlFile = zip.file('word/document.xml');

    if (!docXmlFile) {
      throw new Error('未找到 word/document.xml 文件');
    }

    const xmlStr = await docXmlFile.async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');

    const paragraphs: string[] = [];
    const pElements = xmlDoc.getElementsByTagName('w:p');

    for (let i = 0; i < pElements.length; i++) {
      const p = pElements[i];
      const tElements = p.getElementsByTagName('w:t');
      let line = '';
      for (let j = 0; j < tElements.length; j++) {
        line += tElements[j].textContent || '';
      }
      if (line.trim().length > 0) {
        paragraphs.push(line.trim());
      }
    }

    return {
      content: paragraphs.join('\n'),
    };
  } catch (err: any) {
    console.warn(`Docx parse failed for ${file.name}:`, err);
    // Fallback: try raw text search inside xml stream
    const arrayBuffer = await file.arrayBuffer();
    const textDecoder = new TextDecoder('utf-8');
    const raw = textDecoder.decode(arrayBuffer);
    const matches = raw.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (matches && matches.length > 0) {
      const extracted = matches
        .map((m) => m.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''))
        .join(' ');
      return { content: extracted };
    }
    throw new Error(err.message || 'DOCX 解析错误');
  }
}

/**
 * Parse Word 97-2003 binary .doc files by extracting text streams (ASCII and UTF-16LE)
 */
export async function parseDoc(file: File): Promise<{ content: string }> {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Scan for UTF-16LE and ASCII text chunks
    const textPieces: string[] = [];
    let currentAscii = '';
    let currentUtf16 = '';

    // Pass 1: ASCII printable characters (len >= 3)
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
        currentAscii += String.fromCharCode(b);
      } else {
        if (currentAscii.trim().length >= 4) {
          textPieces.push(currentAscii.trim());
        }
        currentAscii = '';
      }
    }
    if (currentAscii.trim().length >= 4) {
      textPieces.push(currentAscii.trim());
    }

    // Pass 2: UTF-16LE runs (every 2 bytes)
    const view = new DataView(buffer);
    for (let i = 0; i < buffer.byteLength - 1; i += 2) {
      const code = view.getUint16(i, true);
      // CJK characters or printable basic unicode
      if (
        (code >= 0x4e00 && code <= 0x9fff) || // CJK unified ideographs
        (code >= 0x3400 && code <= 0x4dbf) ||
        (code >= 0x3000 && code <= 0x303f) || // CJK symbols
        (code >= 0xff00 && code <= 0xffef) || // Fullwidth forms
        (code >= 32 && code <= 126)
      ) {
        currentUtf16 += String.fromCharCode(code);
      } else {
        if (currentUtf16.trim().length >= 3) {
          textPieces.push(currentUtf16.trim());
        }
        currentUtf16 = '';
      }
    }
    if (currentUtf16.trim().length >= 3) {
      textPieces.push(currentUtf16.trim());
    }

    // De-duplicate contiguous pieces
    const combined = Array.from(new Set(textPieces)).join('\n');
    return {
      content: combined.length > 0 ? combined : `[DOC 文件: ${file.name} 二进制内容已索引]`,
    };
  } catch (err: any) {
    return { content: `[DOC 读取异常: ${err.message}]` };
  }
}

/**
 * Parse Excel files (.xlsx, .xls, .csv) with SheetJS
 */
export async function parseExcel(file: File): Promise<{
  content: string;
  sheets: SheetContent[];
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const sheets: SheetContent[] = [];
    const contentLines: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;

      // Extract CSV representation
      const csv = XLSX.utils.sheet_to_csv(worksheet, { blankrows: false });
      const rows = csv.split('\n').filter((r) => r.trim().length > 0);

      const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : null;
      const rowCount = range ? range.e.r - range.s.r + 1 : rows.length;
      const colCount = range ? range.e.c - range.s.c + 1 : 0;

      sheets.push({
        sheetName,
        text: csv,
        rowCount,
        colCount,
      });

      contentLines.push(`[工作表: ${sheetName}]`);
      contentLines.push(csv);
      contentLines.push('');
    }

    return {
      content: contentLines.join('\n'),
      sheets,
    };
  } catch (err: any) {
    throw new Error(err.message || 'Excel 文件解析失败');
  }
}

/**
 * Parse PDF files using pdfjs-dist
 */
export async function parsePdf(file: File): Promise<{
  content: string;
  pages: PageContent[];
  pageCount: number;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    } as any);

    const pdfDocument = await loadingTask.promise;
    const pageCount = pdfDocument.numPages;
    const pages: PageContent[] = [];
    const fullTextParts: string[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => item.str || '')
        .filter((str: string) => str.trim().length > 0);

      const pageText = pageStrings.join(' ');
      pages.push({
        pageNumber: pageNum,
        text: pageText,
      });

      fullTextParts.push(`[第 ${pageNum} 页]\n${pageText}`);
    }

    return {
      content: fullTextParts.join('\n\n'),
      pages,
      pageCount,
    };
  } catch (err: any) {
    console.warn(`PDF parse error for ${file.name}:`, err);
    throw new Error(err.message || 'PDF 解析失败');
  }
}

/**
 * Universal file processor: converts a browser File into a searchable FileRecord
 */
export async function processFileToRecord(
  file: File,
  relativePath?: string
): Promise<FileRecord> {
  const { type, extension } = getFileType(file.name);
  const path = relativePath || (file as any).webkitRelativePath || file.name;
  const id = `${path}_${file.size}_${file.lastModified}`;

  let content = '';
  let pages: PageContent[] | undefined;
  let sheets: SheetContent[] | undefined;
  const metadata: Record<string, any> = {};

  try {
    if (type === 'json') {
      const result = await parseJson(file);
      content = result.content;
      metadata.lineCount = result.lineCount;
      if (result.keyCount !== undefined) {
        metadata.keyCount = result.keyCount;
      }
    } else if (type === 'csv') {
      const result = await parseCsv(file);
      content = result.content;
      sheets = result.sheets;
      metadata.rowCount = result.rowCount;
      metadata.colCount = result.colCount;
      metadata.lineCount = result.rowCount;
    } else if (type === 'txt') {
      content = await parsePlainText(file);
      metadata.lineCount = content.split('\n').length;
    } else if (type === 'html') {
      const result = await parseHtml(file);
      content = result.content;
      metadata.title = result.title;
      metadata.lineCount = content.split('\n').length;
    } else if (type === 'docx') {
      const result = await parseDocx(file);
      content = result.content;
      metadata.lineCount = content.split('\n').length;
    } else if (type === 'doc') {
      const result = await parseDoc(file);
      content = result.content;
    } else if (type === 'excel') {
      const result = await parseExcel(file);
      content = result.content;
      sheets = result.sheets;
      metadata.sheetCount = sheets.length;
    } else if (type === 'pdf') {
      const result = await parsePdf(file);
      content = result.content;
      pages = result.pages;
      metadata.pageCount = result.pageCount;
    } else {
      // Default: try as plain text
      try {
        content = await parsePlainText(file);
      } catch {
        content = `[不支持或未知二进制文件格式: ${file.name}]`;
      }
    }
  } catch (err: any) {
    metadata.error = err.message || '解析遇到问题';
    content = `[文件内容提取错误: ${err.message || '未知错误'}]`;
  }

  // Create Blob URL for instant viewing
  let blobUrl: string | undefined;
  try {
    blobUrl = URL.createObjectURL(file);
  } catch {
    // Ignore blob creation failure
  }

  return {
    id,
    name: file.name,
    path,
    size: file.size,
    lastModified: file.lastModified,
    type,
    extension,
    content,
    rawFile: file,
    blobUrl,
    pages,
    sheets,
    metadata,
  };
}

/**
 * Process a raw ArrayBuffer (e.g. from Electron fs.readFile) into a FileRecord
 */
export async function processBufferToRecord(
  buffer: ArrayBuffer,
  name: string,
  fullPath: string,
  size: number,
  mtime: number
): Promise<FileRecord> {
  const file = new File([buffer], name, { lastModified: mtime });
  return processFileToRecord(file, fullPath);
}

