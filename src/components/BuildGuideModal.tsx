import React, { useState } from 'react';
import {
  X,
  Terminal,
  PackageCheck,
  FolderTree,
  Cpu,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface BuildGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuildGuideModal: React.FC<BuildGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Windows .exe 编译与打包操作指南
              </h2>
              <p className="text-xs text-stone-500">
                项目已集成 Electron 与 electron-builder，可一键输出单文件绿色版或安装包 (v2.0 · Oct, 2026)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-stone-800 text-xs sm:text-sm">
          {/* Quick Start with 1-click BAT */}
          <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 font-bold text-emerald-950 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                ★
              </span>
              <span>免命令行：Windows 桌面双击批处理脚本（推荐）</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed mb-3">
              导出并解压代码后，项目根目录已为您预置了 3 个一键运行脚本，无需手动打开黑框输入命令：
            </p>
            <div className="space-y-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-stone-900 font-mono">1-启动本地检索服务(浏览器模式).bat</span>
                  <p className="text-[11px] text-stone-500">双击自动安装依赖、启动检索服务并在浏览器中自动打开界面</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium shrink-0">日常秒开</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-stone-900 font-mono">2-打包Windows桌面版软件(.exe).bat</span>
                  <p className="text-[11px] text-stone-500">双击一键调用 Electron 打包为独立的 Windows .exe 桌面软件</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium shrink-0">生成可执行文件</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-stone-900 font-mono">3-更新本地代码与依赖(Git同步).bat</span>
                  <p className="text-[11px] text-stone-500">若配置了 Git，双击即可拉取 GitHub 仓库最新代码并刷新依赖</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium shrink-0">一键同步更新</span>
              </div>
            </div>
          </div>

          {/* Step 1: Export Source Code */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <div className="flex items-center gap-2 font-bold text-stone-900 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>获取或更新项目源码至本地 PC</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              在当前网页右上角（或右上角设置菜单）中，选择 <strong>导出为 ZIP (Export to ZIP)</strong> 下载最新代码包，解压并直接覆盖到您本地 PC 的工作目录（例如 <code>E:\Search_Mac\</code>）。
            </p>
          </div>

          {/* Step 2: Install Dependencies */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">
                  2
                </span>
                <span>在 Windows 终端安装依赖</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('npm install', 'step2')}
                className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-2 py-1 rounded cursor-pointer"
              >
                {copiedCmd === 'step2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>复制命令</span>
              </button>
            </div>
            <p className="text-xs text-stone-600 mb-2">
              在项目文件夹下打开 PowerShell 或 CMD 命令行工具，执行：
            </p>
            <div className="bg-stone-900 text-stone-100 font-mono text-xs p-3 rounded-lg flex items-center justify-between">
              <code>npm install</code>
            </div>
          </div>

          {/* Step 3: Build .exe command */}
          <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs">
                  3
                </span>
                <span>执行一键打包命令输出 .exe</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('npm run electron:build', 'step3')}
                className="inline-flex items-center gap-1 text-xs text-amber-900 hover:text-amber-950 bg-white border border-amber-300 px-2 py-1 rounded cursor-pointer"
              >
                {copiedCmd === 'step3' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>复制命令</span>
              </button>
            </div>

            <p className="text-xs text-amber-900 mb-2 leading-relaxed">
              打包程序将自动编译 React 前端，并调用 electron-builder 输出 Windows 专属可执行程序：
            </p>
            <div className="bg-stone-900 text-stone-100 font-mono text-xs p-3 rounded-lg space-y-1">
              <div className="text-stone-400"># 生成便携版+安装包</div>
              <div className="text-amber-400 font-bold">npm run electron:build</div>
              <div className="text-stone-400 pt-1"># 或仅生成单文件便携绿色版：</div>
              <div className="text-stone-200">npm run electron:build:portable</div>
            </div>
          </div>

          {/* Output Artifacts */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <FolderTree className="w-4 h-4 text-amber-600" />
              <span>编译产物说明 (生成于 dist-electron/ 目录)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>便携免安装单文件版 (.exe)</span>
                </div>
                <div className="text-stone-500 font-mono text-[11px] mt-1">
                  本地文件内容搜索工具-便携单文件版-2.0.0.exe
                </div>
                <p className="text-stone-600 mt-1.5 text-[11px] leading-relaxed">
                  无需安装，随拷随用，双击直接运行。推荐放置于 U 盘或工具箱中。
                </p>
              </div>

              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>标准 Windows 安装包 (Setup.exe)</span>
                </div>
                <div className="text-stone-500 font-mono text-[11px] mt-1">
                  本地文件内容搜索工具 Setup 2.0.0.exe
                </div>
                <p className="text-stone-600 mt-1.5 text-[11px] leading-relaxed">
                  标准 Windows 安装向导，自动创建桌面快捷图标与开始菜单项。
                </p>
              </div>
            </div>
          </div>

          {/* FAQ & Tips */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-stone-600" />
              <span>注意事项与常见排查</span>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>Windows SmartScreen 拦截提示</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                自建编译的程序未购买微软商业数字签名。首次双击若弹出“Windows 已保护你的电脑”，点击 <strong>“更多信息” &rarr; “仍要运行”</strong> 即可。
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            完整指南亦已保存在项目根目录 <code>BUILD_WINDOWS_EXE_GUIDE.md</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
