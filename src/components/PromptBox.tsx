import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Paperclip, Sliders, Palette, AtSign, Sparkles, ChevronDown } from 'lucide-react';

interface PromptBoxProps {
  onSubmit: (prompt: string) => void;
  compact?: boolean;
}

const suggestions = [
  '一个SaaS产品的落地页',
  '一个带图表和表格的仪表盘',
  '一个带深色模式的作品集网站',
  '一个电商产品页面',
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
          今天想构建什么？
        </h1>
      )}
      {!compact && (
        <p className="text-center text-bolt-light-8 text-[15px] mb-8 animate-fade-in">
          通过与AI对话，创建令人惊艳的应用和网站。
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
          placeholder="来构建一个原型..."
          rows={compact ? 1 : 2}
          className={`w-full bg-transparent resize-none outline-none px-5 pt-4 text-[15px] text-bolt-light-12 placeholder:text-bolt-light-7 ${
            compact ? 'pb-2' : 'pb-3'
          }`}
        />

        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-0.5">
            <button className="p-2 rounded-lg text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-colors duration-150" title="附件">
              <Paperclip className="w-[18px] h-[18px]" />
            </button>
            <button className="p-2 rounded-lg text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-colors duration-150" title="提及文件">
              <AtSign className="w-[18px] h-[18px]" />
            </button>
            <button className="p-2 rounded-lg text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-colors duration-150" title="设计系统">
              <Palette className="w-[18px] h-[18px]" />
            </button>
            <button className="p-2 rounded-lg text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-colors duration-150" title="设置">
              <Sliders className="w-[18px] h-[18px]" />
            </button>
            <button className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-colors duration-150 text-[13px] font-medium">
              <Sparkles className="w-[15px] h-[15px]" />
              优化
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-colors duration-150 text-[13px] font-medium">
              Bolt 智能体
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
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
