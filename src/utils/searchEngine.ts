import { FileRecord, SearchFilter, SearchMatch, SearchResult } from '../types';

export interface ParseQueryResult {
  regex: RegExp | null;
  error?: string;
  isPhraseSearch: boolean;
  terms: string[];
}

/**
 * Parses user input query into a RegExp or set of terms.
 * Handles:
 * 1. Regex mode: query is compiled directly as RegExp
 * 2. Phrase search with half-width quotes: "phrase one" term2 "phrase three"
 * 3. Plain keyword search
 */
export function buildSearchMatcher(
  rawQuery: string,
  options: { isRegex: boolean; isCaseSensitive: boolean; isWholeWord: boolean }
): ParseQueryResult {
  const query = rawQuery.trim();
  if (!query) {
    return { regex: null, isPhraseSearch: false, terms: [] };
  }

  const flags = options.isCaseSensitive ? 'g' : 'gi';

  // 1. Explicit Regex Mode
  if (options.isRegex) {
    try {
      const regex = new RegExp(query, flags);
      return { regex, isPhraseSearch: false, terms: [query] };
    } catch (err: any) {
      return {
        regex: null,
        error: `正则表达式错误: ${err.message || '语法不合法'}`,
        isPhraseSearch: false,
        terms: [],
      };
    }
  }

  // 2. Phrase Search with half-width quotes: e.g. "exact phrase" or multiple terms
  const phraseRegex = /"([^"]+)"|(\S+)/g;
  const terms: string[] = [];
  let isPhraseSearch = false;
  let match: RegExpExecArray | null;

  while ((match = phraseRegex.exec(query)) !== null) {
    if (match[1] !== undefined) {
      // Quoted phrase
      isPhraseSearch = true;
      if (match[1].trim()) {
        terms.push(match[1]);
      }
    } else if (match[2] !== undefined) {
      // Unquoted token
      terms.push(match[2]);
    }
  }

  if (terms.length === 0) {
    return { regex: null, isPhraseSearch: false, terms: [] };
  }

  // Escape regex special characters
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Build pattern
  // If whole word is requested: \bterm\b (for word boundaries)
  const patternParts = terms.map((term) => {
    const escaped = escapeRegex(term);
    if (options.isWholeWord && /^[a-zA-Z0-9_]+$/.test(term)) {
      return `\\b${escaped}\\b`;
    }
    return escaped;
  });

  try {
    const combinedPattern = patternParts.join('|');
    const regex = new RegExp(combinedPattern, flags);
    return { regex, isPhraseSearch, terms };
  } catch (err: any) {
    return {
      regex: null,
      error: `搜索匹配模式生成失败: ${err.message}`,
      isPhraseSearch,
      terms,
    };
  }
}

/**
 * Extract context snippet around match with line number and page/sheet awareness
 */
export function extractSnippet(
  content: string,
  startIndex: number,
  matchLength: number,
  file: FileRecord,
  contextRadius = 50
): SearchMatch {
  const matchText = content.slice(startIndex, startIndex + matchLength);

  // Line number calculation
  const beforeSlice = content.slice(0, startIndex);
  const lineNumber = beforeSlice.split('\n').length;

  // Find start and end of the line containing the match
  const lastNewline = beforeSlice.lastIndexOf('\n');
  const nextNewline = content.indexOf('\n', startIndex + matchLength);
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
  const lineEnd = nextNewline === -1 ? content.length : nextNewline;
  const lineText = content.slice(lineStart, lineEnd).trim();

  // Snippet bounds
  const snippetStart = Math.max(0, startIndex - contextRadius);
  const snippetEnd = Math.min(content.length, startIndex + matchLength + contextRadius);

  let snippetBefore = content.slice(snippetStart, startIndex);
  let snippetAfter = content.slice(startIndex + matchLength, snippetEnd);

  // Format whitespace (replace line breaks in snippet context with spaces for clean display)
  snippetBefore = snippetBefore.replace(/[\r\n\t]+/g, ' ');
  snippetAfter = snippetAfter.replace(/[\r\n\t]+/g, ' ');

  if (snippetStart > 0) {
    snippetBefore = '...' + snippetBefore;
  }
  if (snippetEnd < content.length) {
    snippetAfter = snippetAfter + '...';
  }

  // Page detection for PDF
  let pageNumber: number | undefined;
  if (file.pages && file.pages.length > 0) {
    let charOffset = 0;
    for (const p of file.pages) {
      charOffset += p.text.length + 20; // approximate section headers
      if (startIndex <= charOffset) {
        pageNumber = p.pageNumber;
        break;
      }
    }
  }

  // Sheet detection for Excel
  let sheetName: string | undefined;
  if (file.sheets && file.sheets.length > 0) {
    let charOffset = 0;
    for (const s of file.sheets) {
      charOffset += s.text.length + 30;
      if (startIndex <= charOffset) {
        sheetName = s.sheetName;
        break;
      }
    }
  }

  return {
    index: startIndex,
    length: matchLength,
    text: matchText,
    lineNumber,
    lineText,
    snippetBefore,
    matchText,
    snippetAfter,
    pageNumber,
    sheetName,
  };
}

/**
 * Search across a collection of FileRecords
 */
export function searchFiles(
  files: FileRecord[],
  filter: SearchFilter
): { results: SearchResult[]; error?: string; isPhraseSearch: boolean; totalMatches: number } {
  if (!filter.query.trim()) {
    return { results: [], isPhraseSearch: false, totalMatches: 0 };
  }

  const { regex, error, isPhraseSearch, terms } = buildSearchMatcher(filter.query, {
    isRegex: filter.isRegex,
    isCaseSensitive: filter.isCaseSensitive,
    isWholeWord: filter.isWholeWord,
  });

  if (error || !regex) {
    return { results: [], error, isPhraseSearch, totalMatches: 0 };
  }

  const results: SearchResult[] = [];
  let totalMatches = 0;

  for (const file of files) {
    // Type filtering
    if (filter.selectedType !== 'all' && file.type !== filter.selectedType) {
      continue;
    }

    const content = file.content;
    if (!content) continue;

    const matches: SearchMatch[] = [];
    let match: RegExpExecArray | null;

    // Reset regex state
    regex.lastIndex = 0;

    // If query had multiple tokens (phrase search + tokens), check if all terms are present if needed,
    // or collect all matches
    let maxMatchesPerFile = 200; // safe upper bound
    let count = 0;

    while ((match = regex.exec(content)) !== null && count < maxMatchesPerFile) {
      const matchIndex = match.index;
      const matchText = match[0];
      if (matchText.length === 0) {
        // Prevent zero-length infinite loops
        regex.lastIndex++;
        continue;
      }

      const matchObj = extractSnippet(content, matchIndex, matchText.length, file);
      matches.push(matchObj);
      count++;
    }

    if (matches.length > 0) {
      totalMatches += matches.length;
      results.push({
        file,
        matches,
        matchCount: matches.length,
      });
    }
  }

  // Sort results
  results.sort((a, b) => {
    if (filter.sortBy === 'name') {
      return a.file.name.localeCompare(b.file.name, 'zh-CN');
    }
    if (filter.sortBy === 'size') {
      return b.file.size - a.file.size;
    }
    if (filter.sortBy === 'modified') {
      return b.file.lastModified - a.file.lastModified;
    }
    // Default: 'relevance' (most matches first, plus bonus if filename contains query)
    const lowerQuery = filter.query.toLowerCase();
    const aNameBonus = a.file.name.toLowerCase().includes(lowerQuery) ? 50 : 0;
    const bNameBonus = b.file.name.toLowerCase().includes(lowerQuery) ? 50 : 0;
    return b.matchCount + bNameBonus - (a.matchCount + aNameBonus);
  });

  return { results, isPhraseSearch, totalMatches };
}
