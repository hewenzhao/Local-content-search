import React from 'react';
import {
  FolderOpen,
  FilePlus,
  Sparkles,
  FileText,
  FileSpreadsheet,
  FileCode,
  Files,
  Search,
  CheckCircle2,
  ShieldCheck,
  Quote,
  FileUp,
} from 'lucide-react';

interface EmptyStateProps {
  hasFiles: boolean;
  hasQuery: boolean;
  onSelectDirectory: () => void;
  onLoadSamples: () => void;
  onSelectFiles: (files: FileList) => void;
  onImportIndex?: (file: File) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  hasFiles,
  hasQuery,
  onSelectDirectory,
  onLoadSamples,
  onSelectFiles,
  onImportIndex,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const indexInputRef = React.useRef<HTMLInputElement>(null);

  // Case 1: Search returned 0 results
  if (hasFiles && hasQuery) {
    return (
      <div className="bg-white rounded-xl border-4 border-sky-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 mb-1">未检索到匹配的内容</h3>
        <p className="text-xs text-stone-500 leading-relaxed mb-4">
          在当前已索引的本地文档中未找到对应内容。请尝试缩短搜索词、检查双引号短语完整性，或关闭“区分大小写/全词匹配”后重试。
        </p>
      </div>
    );
  }

  // Case 2: Files loaded, but no query entered yet
  if (hasFiles && !hasQuery) {
    return (
      <div className="bg-stone-50/60 rounded-xl border border-dashed border-stone-300 p-10 text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 mb-1">已就绪，请输入关键词开始搜索</h3>
        <p className="text-xs text-stone-500 leading-relaxed mb-4">
          支持直接输入普通词汇、用半角双引号进行精确短语搜索（如 <code>"财务预算"</code>），或点击上方“正则”开启正则表达式查询。
        </p>
      </div>
    );
  }

  // Case 3: Initial Empty State - No files loaded yet
  return (
    <div className="space-y-6">
      {/* Hero Welcome & Dropzone */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 hover:border-amber-500/60 transition-colors p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-stone-900 text-amber-400 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <FolderOpen className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/90 text-xs font-semibold tracking-wide mb-3">
          Local Full Text Search
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight mb-2">
          开启本地 PC 文件内容全文检索
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed mb-6">
          纯浏览器端本地解析，直接检索您本地计算机上的文档正文。无需上传服务器，保护隐私安全。
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="btn-empty-select-folder"
            type="button"
            onClick={onSelectDirectory}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 active:bg-stone-950 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>选择本地文件夹</span>
          </button>

          <button
            id="btn-empty-select-files"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer border border-stone-200"
          >
            <FilePlus className="w-4 h-4 text-stone-600" />
            <span>选择本地文件</span>
          </button>

          {onImportIndex && (
            <button
              id="btn-empty-import-index"
              type="button"
              onClick={() => indexInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-xl transition-colors cursor-pointer border border-stone-200"
              title="导入之前保存的解析索引文件继续工作"
            >
              <FileUp className="w-4 h-4 text-blue-600" />
              <span>导入解析索引</span>
            </button>
          )}

          <button
            id="btn-empty-load-samples"
            type="button"
            onClick={onLoadSamples}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-900 bg-amber-100/70 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer border border-amber-300/70"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>一键载入演示样本</span>
          </button>
        </div>

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

        {onImportIndex && (
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
        )}

        <div className="mt-4 text-xs text-stone-600 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>本地内存安全沙箱解析 · 绝不回传文件至任何第三方服务器</span>
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Capability 1: Multi-format */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Files className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">全格式兼容解析</h4>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">
            深度兼容 TXT、Word (DOC/DOCX)、Excel (XLS/XLSX)、CSV 表格、JSON 数据、PDF 与 HTML 网页。
          </p>
          <div className="flex flex-wrap gap-1 text-[10px] font-mono font-medium">
            <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">.txt</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">.docx</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">.xlsx</span>
            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">.csv</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">.json</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">.pdf</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">.html</span>
          </div>
        </div>

        {/* Capability 2: Search Syntax */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Quote className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">短语搜索与正则匹配</h4>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">
            使用半角双引号 <code>"短语"</code> 精确匹配连续词组；支持标准正则表达式（如邮箱、日期、数值）。
          </p>
          <div className="text-[11px] text-stone-500 font-mono bg-stone-50 p-2 rounded border border-stone-100">
            例: <code>"财务预算"</code> 或 <code>\d&#123;4&#125;-\d&#123;2&#125;-\d&#123;2&#125;</code>
          </div>
        </div>

        {/* Capability 3: Preview & Local Link */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">结果部分预览与浏览</h4>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">
            自动生成命中前后文摘要卡片，标注行号/页码；点击即可全屏阅读全文并跳转至高亮处。
          </p>
          <div className="text-[11px] text-stone-500 flex items-center gap-2">
            <span>· 上下文高亮</span>
            <span>· 一键复制路径</span>
            <span>· 原生浏览</span>
          </div>
        </div>
      </div>
    </div>
  );
};
