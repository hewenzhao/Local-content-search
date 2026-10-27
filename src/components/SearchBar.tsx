import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Regex,
  CaseSensitive,
  WholeWord,
  Quote,
  ArrowUpDown,
  FileText,
  FileSpreadsheet,
  FileCode,
  Files,
  Info,
} from 'lucide-react';
import { SearchFilter } from '../types';

interface SearchBarProps {
  filter: SearchFilter;
  onChange: (newFilter: Partial<SearchFilter>) => void;
  onClear: () => void;
  resultCount: number;
  totalMatches: number;
  isPhraseSearch: boolean;
  searchError?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filter,
  onChange,
  onClear,
  resultCount,
  totalMatches,
  isPhraseSearch,
  searchError,
}) => {
  const quickExamples = [
    { label: '短语: "本地文件"', query: '"本地文件"' },
    { label: '短语: "人工智能"', query: '"人工智能"' },
    { label: '短语: "财务预算"', query: '"财务预算"' },
    { label: '正则: 日期 \\d{4}-\\d{2}-\\d{2}', query: '\\d{4}-\\d{2}-\\d{2}', regex: true },
    { label: '正则: 邮箱 [a-zA-Z0-9._%+-]+@...', query: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', regex: true },
  ];

  return (
    <div className="bg-white rounded-2xl border-4 border-orange-500 shadow-lg shadow-orange-500/10 p-4 sm:p-5 transition-all">
      {/* Header Indicator */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-orange-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-100 inline-block"></span>
          <span className="text-xs sm:text-sm font-bold text-stone-900 tracking-wide">
            检索输入与参数设定
          </span>
          <span className="text-[11px] font-medium text-orange-700 bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-md">
            核心控制区
          </span>
        </div>
        <div className="text-[11px] text-stone-600 hidden sm:block">
          支持即时搜索、半角双引号精确短语及正则表达式
        </div>
      </div>

      {/* Search Input Container */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-stone-400 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>

        <input
          id="search-input"
          type="text"
          value={filter.query}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder='输入检索内容... 支持短语如 "项目规划"，或勾选正则模式'
          className="w-full pl-11 pr-28 py-3 text-stone-900 placeholder:text-stone-400 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-300 focus:border-orange-500 rounded-lg text-sm transition-all focus:outline-none focus:ring-3 focus:ring-orange-500/20"
        />

        {/* Right side controls inside input */}
        <div className="absolute right-2.5 flex items-center gap-1">
          {filter.query && (
            <button
              id="btn-clear-query"
              type="button"
              onClick={onClear}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors cursor-pointer"
              title="清除搜索内容"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Regex toggle inside input */}
          <button
            id="toggle-regex"
            type="button"
            onClick={() => onChange({ isRegex: !filter.isRegex })}
            className={`p-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer ${
              filter.isRegex
                ? 'bg-orange-100 text-orange-950 font-semibold border border-orange-300'
                : 'text-stone-500 hover:bg-stone-200/60'
            }`}
            title={filter.isRegex ? '正则表达式模式已开启' : '开启正则表达式模式 (.*)'}
          >
            <Regex className="w-4 h-4" />
            <span className="text-[11px] font-medium hidden sm:inline">正则</span>
          </button>
        </div>
      </div>

      {/* Regex error alert if invalid syntax */}
      {searchError && (
        <div className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-1.5 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Phrase search active banner indicator */}
      {isPhraseSearch && !filter.isRegex && (
        <div className="mt-2 text-xs text-orange-900 bg-orange-50/80 border border-orange-200 rounded-md px-3 py-1.5 flex items-center gap-2">
          <Quote className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>
            已识别<strong>半角双引号短语搜索</strong>：正在对引号内的词组进行严格连续匹配
          </span>
        </div>
      )}

      {/* Options Row: Case Sensitive, Whole Word, Type Filter, Sort */}
      <div className="mt-3.5 pt-3 border-t border-stone-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Mode toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-stone-500 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" /> 参数选项:
          </span>

          <button
            id="toggle-case"
            type="button"
            onClick={() => onChange({ isCaseSensitive: !filter.isCaseSensitive })}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer border ${
              filter.isCaseSensitive
                ? 'bg-stone-800 text-white border-stone-800 font-medium'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
            title="区分英文大小写 (Match Case)"
          >
            <CaseSensitive className="w-3.5 h-3.5" />
            <span>区分大小写</span>
          </button>

          <button
            id="toggle-whole-word"
            type="button"
            disabled={filter.isRegex}
            onClick={() => onChange({ isWholeWord: !filter.isWholeWord })}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer border ${
              filter.isWholeWord && !filter.isRegex
                ? 'bg-stone-800 text-white border-stone-800 font-medium'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            } ${filter.isRegex ? 'opacity-40 cursor-not-allowed' : ''}`}
            title="全词匹配 (仅限英文单词边界)"
          >
            <WholeWord className="w-3.5 h-3.5" />
            <span>全词匹配</span>
          </button>

          {/* Quick help popover note */}
          <span className="hidden md:inline-flex items-center gap-1 text-stone-600 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
            提示: 用半角 <code>"短语"</code> 可精确检索
          </span>
        </div>

        {/* Right: Sort selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-500">排序:</span>
          <select
            id="select-sort"
            value={filter.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as any })}
            className="bg-stone-50 border border-stone-200 rounded-md px-2 py-1 text-xs text-stone-700 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="relevance">相关度 / 命中数</option>
            <option value="name">文件名 (A-Z)</option>
            <option value="modified">最近修改时间</option>
            <option value="size">文件大小</option>
          </select>
        </div>
      </div>

      {/* File Format Filter Tabs */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-stone-500 font-medium shrink-0 mr-1">格式筛选:</span>

        {[
          { id: 'all', label: '全部格式', icon: null },
          { id: 'txt', label: 'TXT/代码', icon: FileText },
          { id: 'docx', label: 'Word (DOC/DOCX)', icon: Files },
          { id: 'excel', label: 'Excel (XLS/XLSX)', icon: FileSpreadsheet },
          { id: 'csv', label: 'CSV 表格', icon: FileSpreadsheet },
          { id: 'json', label: 'JSON 数据', icon: FileCode },
          { id: 'pdf', label: 'PDF 文档', icon: FileText },
          { id: 'html', label: 'HTML/网页', icon: FileCode },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive =
            filter.selectedType === tab.id ||
            (tab.id === 'docx' && filter.selectedType === 'doc');
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange({ selectedType: tab.id })}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-orange-500 text-white border-orange-500 font-medium shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Search Chips */}
      <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex items-center gap-1.5 flex-wrap text-xs">
        <span className="text-stone-500 shrink-0">快捷搜索:</span>
        {quickExamples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              onChange({
                query: ex.query,
                isRegex: Boolean(ex.regex),
              });
            }}
            className="px-2 py-0.5 rounded bg-stone-100 hover:bg-orange-100 hover:text-orange-950 text-stone-600 transition-colors text-[11px] cursor-pointer"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
};
