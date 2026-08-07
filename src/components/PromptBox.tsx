import { useState, useRef, useEffect } from 'react';
import { ArrowUp, ChevronRight, Paperclip, Sparkles, X } from 'lucide-react';

interface PromptBoxProps {
  onSubmit: (prompt: string) => void;
  compact?: boolean;
}

const suggestions = [
  '创建一个基金对比研究 Dashboard',
  '做一个基金组合健康诊断工具',
  '生成一份市场早报网页',
  '创建一个家庭财富规划应用',
];

export default function PromptBox({ onSubmit, compact = false }: PromptBoxProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  const canOptimize = value.trim().length > 0;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  useEffect(() => {
    if (!attachOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setAttachOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [attachOpen]);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue('');
    setAttachments([]);
  };

  const handleOptimize = () => {
    if (!canOptimize) return;
    setValue((current) => {
      const text = current.trim();
      if (!text) return current;
      if (text.includes('对比') || text.includes('Dashboard')) {
        return '创建一个基金对比研究 Dashboard，对比三只基金近三年的收益、最大回撤、波动率、基金经理和主要持仓，并生成可视化图表与研究摘要。';
      }
      if (text.includes('组合') || text.includes('诊断')) {
        return '做一个基金组合健康诊断工具，识别持仓基金，评估资产配置、相关性与风险，并生成可视化诊断页面。';
      }
      return `${text}。请补充清晰的目标用户、核心功能、需要展示的关键指标，以及期望的页面结构。`;
    });
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const openFilePicker = () => {
    setAttachOpen(false);
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setAttachments((prev) => {
      const merged = [...prev];
      for (const file of files) {
        if (!merged.some((item) => item.name === file.name && item.size === file.size)) {
          merged.push(file);
        }
      }
      return merged;
    });
    event.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!compact && (
        <h1 className={`text-center font-bold text-bolt-light-12 tracking-tight mb-3 animate-fade-in ${compact ? 'text-2xl' : 'text-[2.5rem]'}`}>
          用盈米能力，创建你的金融应用
        </h1>
      )}
      {!compact && (
        <p className="text-center text-bolt-light-8 text-[15px] mb-8 animate-fade-in">
          发送需求后，AI 会展示思考与计划流程，并自动开始构建。
        </p>
      )}

      <div
        className={`relative rounded-2xl border bg-white transition-all duration-200 ${
          focused
            ? 'border-bolt-blue bolt-glow shadow-lg shadow-bolt-blue/5'
            : 'border-bolt-light-5 shadow-sm'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="例如：创建一个基金对比研究 Dashboard..."
          rows={compact ? 1 : 2}
          className={`w-full bg-transparent resize-none outline-none px-5 pt-4 text-[15px] text-bolt-light-12 placeholder:text-bolt-light-7 ${
            compact ? 'pb-2' : 'pb-3'
          }`}
        />

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {attachments.map((file) => (
              <span
                key={`${file.name}-${file.size}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-bolt-light-3 px-2.5 py-1 text-[12px] text-bolt-light-10"
              >
                <Paperclip className="h-3 w-3 shrink-0" />
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  aria-label={`移除 ${file.name}`}
                  onClick={() => setAttachments((prev) => prev.filter((item) => item !== file))}
                  className="rounded p-0.5 text-bolt-light-7 hover:bg-bolt-light-4 hover:text-bolt-light-11"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-0.5">
            <div className="relative" ref={attachMenuRef}>
              <button
                type="button"
                onClick={() => setAttachOpen((open) => !open)}
                aria-label="添加附件"
                aria-expanded={attachOpen}
                className="rounded-lg p-2 text-bolt-light-8 transition-colors duration-150 hover:bg-bolt-light-3 hover:text-bolt-light-11"
              >
                <Paperclip className="w-[18px] h-[18px]" />
              </button>

              {attachOpen && (
                <div className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-[220px] overflow-hidden rounded-xl border border-bolt-light-5 bg-white py-1 shadow-xl animate-fade-in">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-bolt-light-11 hover:bg-bolt-light-2"
                  >
                    <Paperclip className="h-4 w-4 text-bolt-light-8" />
                    <span className="flex-1">添加文件</span>
                    <ChevronRight className="h-4 w-4 text-bolt-light-6" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleOptimize}
              disabled={!canOptimize}
              aria-disabled={!canOptimize}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 ${
                canOptimize
                  ? 'text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11'
                  : 'cursor-not-allowed text-bolt-light-6'
              }`}
            >
              <Sparkles className="w-[15px] h-[15px]" />
              优化
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={!value.trim()}
              className={`p-2 rounded-lg transition-all duration-150 ${
                value.trim()
                  ? 'bg-bolt-blue text-white hover:bg-bolt-blue-dark'
                  : 'bg-bolt-light-4 text-bolt-light-7 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>

      {!compact && (
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setValue(s)}
              className="px-3 py-1.5 rounded-full border border-bolt-light-5 bg-white text-[13px] text-bolt-light-9 hover:border-bolt-light-7 hover:text-bolt-light-11 transition-all duration-150 bolt-card-hover"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
