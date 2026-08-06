import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Paperclip, Sparkles, ListChecks } from 'lucide-react';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue('');
  };

  const handleOptimize = () => {
    setValue((current) => current.trim() || '创建一个基金对比研究 Dashboard，对比三只基金近三年的收益、最大回撤、波动率、基金经理和主要持仓，并生成可视化图表与研究摘要。');
    requestAnimationFrame(() => textareaRef.current?.focus());
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

        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-0.5">
            <button disabled className="p-2 rounded-lg text-bolt-light-7 cursor-not-allowed" title="Demo 中暂未开放附件">
              <Paperclip className="w-[18px] h-[18px]" />
            </button>
            <button onClick={handleOptimize} className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-colors duration-150 text-[13px] font-medium">
              <Sparkles className="w-[15px] h-[15px]" />
              优化
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bolt-blue-light text-bolt-blue text-[12px] font-semibold">
              <ListChecks className="w-3.5 h-3.5" />
              Plan Mode
            </span>
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
